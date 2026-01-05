"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { startAutomationStream, checkJobStatus } from "@/app/coverage-plot/new-form/services/automationService"
import { createSSEConnection } from "@/app/coverage-plot/new-form/services/sseClient"
import { ANIMATION_DURATIONS } from "@/app/coverage-plot/new-form/utils/constants"
import { useQueue } from "@/app/coverage-plot/new-form/hooks/useQueue"

const AutomationContext = createContext(null)

// localStorage keys
const STORAGE_KEY = 'coverage_plot_automation_state'
const STORAGE_JOB_ID_KEY = 'coverage_plot_job_id'

// Helper functions for localStorage
function saveAutomationState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            isLoading: state.isLoading,
            progress: state.progress,
            currentStep: state.currentStep,
            error: state.error,
            queueInfo: state.queueInfo,
            timestamp: Date.now()
        }))
    } catch (e) {
        console.error('Failed to save automation state:', e)
    }
}

function loadAutomationState() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (e) {
        console.error('Failed to load automation state:', e)
    }
    return null
}

function saveJobId(jobId) {
    try {
        localStorage.setItem(STORAGE_JOB_ID_KEY, jobId)
    } catch (e) {
        console.error('Failed to save job ID:', e)
    }
}

function getJobId() {
    try {
        return localStorage.getItem(STORAGE_JOB_ID_KEY)
    } catch (e) {
        console.error('Failed to get job ID:', e)
    }
    return null
}

function clearAutomationState() {
    try {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_JOB_ID_KEY)
    } catch (e) {
        console.error('Failed to clear automation state:', e)
    }
}

export function AutomationProvider({ children }) {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState('')
    const [stepVisible, setStepVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [queueInfo, setQueueInfo] = useState(null) // { position: number }

    const currentStepRef = useRef('')
    const { joinQueue, checkStatus, leaveQueue } = useQueue()
    const pollingRef = useRef(null)
    const statusPollingRef = useRef(null)
    const hasActiveJobRef = useRef(false)
    const currentJobIdRef = useRef(null)
    const sseConnectionRef = useRef(null)

    const handleProgress = useCallback((progressValue, step, status) => {
        setProgress(progressValue)
        
        // Save to localStorage
        saveAutomationState({
            isLoading: true,
            progress: progressValue,
            currentStep: step,
            error: null,
            queueInfo
        })

        // Fade out, change text, fade in
        if (step !== currentStepRef.current) {
            setStepVisible(false)
            setTimeout(() => {
                setCurrentStep(step)
                currentStepRef.current = step
                setStepVisible(true)
            }, ANIMATION_DURATIONS.STEP_FADE_HALF)
        }
    }, [queueInfo])

    // Poll backend for job status (used when SSE connection is lost)
    const pollJobStatus = useCallback(async (jobId) => {
        if (!jobId) return

        try {
            const status = await checkJobStatus(jobId)
            
            if (status.status === 'completed') {
                // Job completed
                clearInterval(statusPollingRef.current)
                statusPollingRef.current = null
                await leaveQueue()
                hasActiveJobRef.current = false
                setIsLoading(false)
                clearAutomationState()
                
                // If we have results, we could trigger download here
                if (status.result) {
                    // Handle completion
                    console.log('Job completed:', status.result)
                }
            } else if (status.status === 'failed') {
                // Job failed
                clearInterval(statusPollingRef.current)
                statusPollingRef.current = null
                await leaveQueue()
                hasActiveJobRef.current = false
                setIsLoading(false)
                setError(status.error || 'Automation failed')
                clearAutomationState()
            } else if (status.status === 'running' || status.status === 'processing') {
                // Job still running - update progress
                handleProgress(status.progress || 0, status.step || currentStep, status.status)
                setIsLoading(true)
            }
        } catch (err) {
            console.error('Error polling job status:', err)
            // Don't stop polling on transient errors
        }
    }, [leaveQueue, currentStep, handleProgress])

    // Restore state from localStorage on mount
    useEffect(() => {
        const savedState = loadAutomationState()
        const savedJobId = getJobId()
        
        if (savedState && savedJobId) {
            // Check if state is recent (within last hour)
            const age = Date.now() - (savedState.timestamp || 0)
            const oneHour = 60 * 60 * 1000
            
            if (age < oneHour) {
                // Restore state
                setIsLoading(savedState.isLoading)
                setProgress(savedState.progress || 0)
                setCurrentStep(savedState.currentStep || '')
                currentStepRef.current = savedState.currentStep || ''
                setQueueInfo(savedState.queueInfo)
                hasActiveJobRef.current = savedState.isLoading
                currentJobIdRef.current = savedJobId
                
                // Start polling backend for status
                if (savedState.isLoading) {
                    statusPollingRef.current = setInterval(() => {
                        pollJobStatus(savedJobId)
                    }, 3000) // Poll every 3 seconds
                }
            } else {
                // State too old, clear it
                clearAutomationState()
            }
        }
    }, [pollJobStatus])

    const startAutomation = useCallback(async (payload, userName = 'Guest') => {
        setIsLoading(true)
        setProgress(0)
        setCurrentStep('Joining queue...')
        setStepVisible(true)
        setError(null)
        setQueueInfo(null)
        currentStepRef.current = 'Joining queue...'
        hasActiveJobRef.current = true

        // Save initial state
        saveAutomationState({
            isLoading: true,
            progress: 0,
            currentStep: 'Joining queue...',
            error: null,
            queueInfo: null
        })

        try {
            // 1. Join Queue
            let position = await joinQueue(userName, 'Coverage Plot')
            setQueueInfo({ position })
            
            saveAutomationState({
                isLoading: true,
                progress: 0,
                currentStep: 'Joining queue...',
                error: null,
                queueInfo: { position }
            })

            // 2. Wait for turn
            if (position > 0) {
                setCurrentStep(`Waiting in queue... Position: ${position + 1}`)
                currentStepRef.current = `Waiting in queue... Position: ${position + 1}`

                await new Promise((resolve, reject) => {
                    pollingRef.current = setInterval(async () => {
                        const newPos = await checkStatus()
                        setQueueInfo({ position: newPos })
                        
                        saveAutomationState({
                            isLoading: true,
                            progress,
                            currentStep: currentStepRef.current,
                            error: null,
                            queueInfo: { position: newPos }
                        })

                        if (newPos === 0) {
                            clearInterval(pollingRef.current)
                            pollingRef.current = null
                            resolve()
                        } else {
                            // Update status message with new position
                            const msg = `Waiting in queue... Position: ${newPos + 1}`
                            if (msg !== currentStepRef.current) {
                                setCurrentStep(msg)
                                currentStepRef.current = msg
                            }
                        }
                    }, 3000) // Poll every 3 seconds
                })
            }

            // 3. Start Automation
            setCurrentStep('Starting automation...')
            currentStepRef.current = 'Starting automation...'

            const { response, jobId } = await startAutomationStream(payload)
            currentJobIdRef.current = jobId
            saveJobId(jobId)

            // Start status polling as backup (in case SSE disconnects)
            statusPollingRef.current = setInterval(() => {
                pollJobStatus(jobId)
            }, 5000) // Poll every 5 seconds as backup

            return new Promise((resolve, reject) => {
                // Store connection reference for cleanup
                const connectionPromise = createSSEConnection(
                    response,
                    handleProgress,
                    async (finalData) => {
                        // Clear polling
                        if (statusPollingRef.current) {
                            clearInterval(statusPollingRef.current)
                            statusPollingRef.current = null
                        }
                        
                        await leaveQueue() // Leave queue on success
                        hasActiveJobRef.current = false
                        setIsLoading(false)
                        clearAutomationState()
                        
                        if (finalData.success && finalData.screenshots) {
                            resolve(finalData.screenshots)
                        } else {
                            reject(new Error('No screenshots received'))
                        }
                    },
                    async (err) => {
                        // Clear polling
                        if (statusPollingRef.current) {
                            clearInterval(statusPollingRef.current)
                            statusPollingRef.current = null
                        }
                        
                        // Don't leave queue on error - let status polling handle it
                        // The job might still be running on backend
                        console.error('SSE error, but job may still be running:', err)
                        
                        // Continue polling for status - backend might still be processing
                        // Only mark as error if status polling confirms failure
                    }
                )
                
                sseConnectionRef.current = connectionPromise
            })
        } catch (err) {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
                pollingRef.current = null
            }
            if (statusPollingRef.current) {
                clearInterval(statusPollingRef.current)
                statusPollingRef.current = null
            }
            
            // Only clear state if we're sure it failed
            // If it's a network error, the backend might still be running
            if (err.message && !err.message.includes('network') && !err.message.includes('fetch')) {
                await leaveQueue()
                hasActiveJobRef.current = false
                setIsLoading(false)
                setError(err.message)
                clearAutomationState()
            }
            throw err
        }
    }, [handleProgress, joinQueue, checkStatus, leaveQueue, pollJobStatus, progress])

    // Cleanup only polling intervals on unmount - DO NOT stop the automation
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
                pollingRef.current = null
            }
            // Note: We intentionally do NOT call leaveQueue() here
            // The automation should continue running on the backend
            // Status polling will continue if state is restored on next mount
        }
    }, [])

    const value = {
        progress,
        currentStep,
        stepVisible,
        isLoading,
        error,
        startAutomation,
        queueInfo
    }

    return (
        <AutomationContext.Provider value={value}>
            {children}
        </AutomationContext.Provider>
    )
}

export function useAutomation() {
    const context = useContext(AutomationContext)
    if (!context) {
        throw new Error("useAutomation must be used within an AutomationProvider")
    }
    return context
}
