"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { startAutomationStream } from "@/app/coverage-plot/new-form/services/automationService"
import { createSSEConnection } from "@/app/coverage-plot/new-form/services/sseClient"
import { ANIMATION_DURATIONS } from "@/app/coverage-plot/new-form/utils/constants"
import { useQueue } from "@/app/coverage-plot/new-form/hooks/useQueue"

const AutomationContext = createContext(null)

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
        currentStepRef.current = 'Joining queue...'

        try {
            // 1. Join Queue
            let position = await joinQueue(userName)
            setQueueInfo({ position })

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
            setCurrentStep('Starting automation...')
            currentStepRef.current = 'Starting automation...'

            const response = await startAutomationStream(payload)

            return new Promise((resolve, reject) => {
                createSSEConnection(
                    response,
                    handleProgress,
                    async (finalData) => {
                        await leaveQueue() // Leave queue on success
                        setIsLoading(false)
                        if (finalData.success && finalData.screenshots) {
                            resolve(finalData.screenshots)
                        } else {
                            reject(new Error('No screenshots received'))
                        }
                    },
                    async (err) => {
                        await leaveQueue() // Leave queue on error
                        setIsLoading(false)
                        setError(err.message)
                        reject(err)
                    }
                )
            })
        } catch (err) {
            if (pollingRef.current) clearInterval(pollingRef.current)
            await leaveQueue()
            setIsLoading(false)
            setError(err.message)
            throw err
        }
    }, [handleProgress, joinQueue, checkStatus, leaveQueue])

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
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
