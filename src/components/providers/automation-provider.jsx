"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { startAutomationStream } from "@/app/coverage-plot/new-form/services/automationService"
import { createSSEConnection } from "@/app/coverage-plot/new-form/services/sseClient"
import { ANIMATION_DURATIONS } from "@/app/coverage-plot/new-form/utils/constants"
import { useQueue } from "@/app/coverage-plot/new-form/hooks/useQueue"
import { useAutomationStore } from "@/store/useAutomationStore"

const AutomationContext = createContext(null)

const PROCESS_TIMEOUT_MS = 6 * 60 * 1000
const STALL_TIMEOUT_MS   = 5 * 60 * 1000
const WATCHDOG_INTERVAL_MS = 15 * 1000

export function AutomationProvider({ children }) {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState('')
    const [stepVisible, setStepVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [queueInfo, setQueueInfo] = useState(null)

    const currentStepRef = useRef('')
    const { joinQueue, checkStatus, leaveQueue } = useQueue()
    const pollingRef = useRef(null)
    const hasActiveJobRef = useRef(false)

    // --- Watchdog refs ---
    const processStartedAtRef = useRef(null)
    const lastProgressAtRef = useRef(null)
    const lastProgressValueRef = useRef(0)
    const watchdogRef = useRef(null)

    const cleanupProcess = useCallback(async () => {
        if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
        if (watchdogRef.current) { clearInterval(watchdogRef.current); watchdogRef.current = null }
        processStartedAtRef.current = null
        lastProgressAtRef.current = null
        lastProgressValueRef.current = 0
        hasActiveJobRef.current = false
        await leaveQueue()
    }, [leaveQueue])

    const handleProgress = useCallback((progressValue, step, status) => {
        setProgress(progressValue)

        if (progressValue !== lastProgressValueRef.current) {
            lastProgressAtRef.current = Date.now()
            lastProgressValueRef.current = progressValue
        }

        useAutomationStore.getState().updateProcessProgress('Coverage Plot', progressValue, step)

        if (step !== currentStepRef.current) {
            setStepVisible(false)
            setTimeout(() => {
                setCurrentStep(step)
                currentStepRef.current = step
                setStepVisible(true)
            }, ANIMATION_DURATIONS.STEP_FADE_HALF)
        }
    }, [])

    const startWatchdog = useCallback(() => {
        if (watchdogRef.current) clearInterval(watchdogRef.current)

        const now = Date.now()
        processStartedAtRef.current = now
        lastProgressAtRef.current = now
        lastProgressValueRef.current = 0

        watchdogRef.current = setInterval(async () => {
            const elapsed = Date.now() - (processStartedAtRef.current ?? Date.now())
            const sinceLast = Date.now() - (lastProgressAtRef.current ?? Date.now())

            const timedOut = elapsed > PROCESS_TIMEOUT_MS
            const stalled  = sinceLast > STALL_TIMEOUT_MS

            if (timedOut || stalled) {
                const reason = timedOut
                    ? `Coverage Plot automation timed out after ${Math.round(elapsed / 60000)} minutes.`
                    : `Coverage Plot automation stalled – no progress for ${Math.round(sinceLast / 60000)} minutes.`

                console.warn(`[Coverage Watchdog] ${reason}  Aborting.`)

                await cleanupProcess()
                setIsLoading(false)
                setError(reason)

                useAutomationStore.getState().stopCoverageAutomation?.()
            }
        }, WATCHDOG_INTERVAL_MS)
    }, [cleanupProcess])

    const stopWatchdog = useCallback(() => {
        if (watchdogRef.current) { clearInterval(watchdogRef.current); watchdogRef.current = null }
    }, [])

    const startAutomation = useCallback(async (payload, userName = 'Guest') => {
        setIsLoading(true)
        setProgress(0)
        setCurrentStep('Joining queue...')
        setStepVisible(true)
        setError(null)
        setQueueInfo(null)
        currentStepRef.current = 'Joining queue...'

        startWatchdog()

        try {
            // 1. Join Queue
            let position = await joinQueue(userName, 'Coverage Plot')
            setQueueInfo({ position })
            hasActiveJobRef.current = true

            // 2. Wait for turn
            if (position > 0) {
                setCurrentStep(`Waiting in queue... Position: ${position + 1}`)
                currentStepRef.current = `Waiting in queue... Position: ${position + 1}`

                await new Promise((resolve, reject) => {
                    pollingRef.current = setInterval(async () => {
                        if (!hasActiveJobRef.current) {
                            clearInterval(pollingRef.current)
                            reject(new Error('Process timed out while waiting in queue.'))
                            return
                        }

                        const newPos = await checkStatus()
                        setQueueInfo({ position: newPos })

                        if (newPos === 0) {
                            clearInterval(pollingRef.current)
                            resolve()
                        } else {
                            const msg = `Waiting in queue... Position: ${newPos + 1}`
                            if (msg !== currentStepRef.current) {
                                setCurrentStep(msg)
                                currentStepRef.current = msg
                            }
                        }
                    }, 3000)
                })
            }

            // 3. Start Automation
            lastProgressAtRef.current = Date.now()

            setCurrentStep('Starting automation...')
            currentStepRef.current = 'Starting automation...'

            const response = await startAutomationStream(payload)

            return new Promise((resolve, reject) => {
                createSSEConnection(
                    response,
                    handleProgress,
                    async (finalData) => {
                        stopWatchdog()
                        await cleanupProcess()
                        setIsLoading(false)
                        if (finalData.success && finalData.screenshots) {
                            resolve(finalData.screenshots)
                        } else {
                            reject(new Error('No screenshots received'))
                        }
                    },
                    async (err) => {
                        stopWatchdog()
                        await cleanupProcess()
                        setIsLoading(false)
                        setError(err.message)
                        reject(err)
                    }
                )
            })
        } catch (err) {
            stopWatchdog()
            await cleanupProcess()
            setIsLoading(false)
            setError(err.message)
            throw err
        }
    }, [handleProgress, joinQueue, checkStatus, leaveQueue, startWatchdog, stopWatchdog, cleanupProcess])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
            if (watchdogRef.current) clearInterval(watchdogRef.current)
            if (hasActiveJobRef.current) {
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
