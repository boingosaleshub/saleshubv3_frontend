"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { startRomAutomationStream } from "@/app/new-rom-form/services/romSseService"
import { createSSEConnection } from "@/app/coverage-plot/new-form/services/sseClient"
import { ANIMATION_DURATIONS } from "@/app/coverage-plot/new-form/utils/constants"
import { useQueue } from "@/app/coverage-plot/new-form/hooks/useQueue"

const RomAutomationContext = createContext(null)

export function RomAutomationProvider({ children }) {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState('')
    const [stepVisible, setStepVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [queueInfo, setQueueInfo] = useState(null) // { position: number }
    const [results, setResults] = useState(null)

    const currentStepRef = useRef('')
    const { joinQueue, checkStatus, leaveQueue } = useQueue()
    const pollingRef = useRef(null)
    const hasActiveJobRef = useRef(false)

    const handleProgress = useCallback((progressValue, step, status) => {
        setProgress(progressValue)

        // Fade out, change text, fade in
        if (step !== currentStepRef.current) {
            setStepVisible(false)
            setTimeout(() => {
                setCurrentStep(step)
                currentStepRef.current = step
                setStepVisible(true)
            }, ANIMATION_DURATIONS.STEP_FADE_HALF)
        }
    }, [])

    const startAutomation = useCallback(async (payload, userName = 'Guest') => {
        setIsLoading(true)
        setProgress(0)
        setCurrentStep('Joining queue...')
        setStepVisible(true)
        setError(null)
        setQueueInfo(null)
        setResults(null)
        currentStepRef.current = 'Joining queue...'

        try {
            // 1. Join Queue
            let position = await joinQueue(userName, 'ROM Generator')
            setQueueInfo({ position })
            hasActiveJobRef.current = true

            // 2. Wait for turn
            if (position > 0) {
                setCurrentStep(`Waiting in queue... Position: ${position + 1}`)
                currentStepRef.current = `Waiting in queue... Position: ${position + 1}`

                await new Promise((resolve, reject) => {
                    pollingRef.current = setInterval(async () => {
                        const newPos = await checkStatus()
                        setQueueInfo({ position: newPos })

                        if (newPos === 0) {
                            clearInterval(pollingRef.current)
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
            setCurrentStep('Starting ROM automation...')
            currentStepRef.current = 'Starting ROM automation...'

            const response = await startRomAutomationStream(payload)

            return new Promise((resolve, reject) => {
                createSSEConnection(
                    response,
                    handleProgress,
                    async (finalData) => {
                        await leaveQueue() // Leave queue on success
                        hasActiveJobRef.current = false
                        setIsLoading(false)
                        if (finalData.success) {
                            setResults(finalData)
                            resolve(finalData)
                        } else {
                            reject(new Error(finalData.error || 'ROM automation failed'))
                        }
                    },
                    async (err) => {
                        await leaveQueue() // Leave queue on error
                        hasActiveJobRef.current = false
                        setIsLoading(false)
                        setError(err.message)
                        reject(err)
                    }
                )
            })
        } catch (err) {
            if (pollingRef.current) clearInterval(pollingRef.current)
            await leaveQueue()
            hasActiveJobRef.current = false
            setIsLoading(false)
            setError(err.message)
            throw err
        }
    }, [handleProgress, joinQueue, checkStatus, leaveQueue])

    const resetAutomation = useCallback(() => {
        setProgress(0)
        setCurrentStep('')
        setStepVisible(true)
        setIsLoading(false)
        setError(null)
        setQueueInfo(null)
        setResults(null)
        currentStepRef.current = ''
    }, [])

    // Cleanup polling and queue on unmount (e.g., full page refresh)
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
            if (hasActiveJobRef.current) {
                // Best-effort queue cleanup so Progress Queue doesn't show stale "Running"
                leaveQueue()
            }
        }
    }, [leaveQueue])

    const value = {
        progress,
        currentStep,
        stepVisible,
        isLoading,
        error,
        startAutomation,
        resetAutomation,
        queueInfo,
        results
    }

    return (
        <RomAutomationContext.Provider value={value}>
            {children}
        </RomAutomationContext.Provider>
    )
}

export function useRomAutomation() {
    const context = useContext(RomAutomationContext)
    if (!context) {
        throw new Error("useRomAutomation must be used within a RomAutomationProvider")
    }
    return context
}
