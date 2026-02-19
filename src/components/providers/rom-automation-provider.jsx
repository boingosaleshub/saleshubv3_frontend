"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { startRomAutomationStream } from "@/app/new-rom-form/services/romSseService"
import { createSSEConnection } from "@/app/coverage-plot/new-form/services/sseClient"
import { downloadAllRomFiles } from "@/app/new-rom-form/services/romAutomationService"
import { generateMultipleExcelFiles } from "@/app/new-rom-form/services/excelGenerationService"
import { ANIMATION_DURATIONS } from "@/app/coverage-plot/new-form/utils/constants"
import { useQueue } from "@/app/coverage-plot/new-form/hooks/useQueue"
import { useAutomationStore } from "@/store/useAutomationStore"
import { useRomProposalSaver } from "@/app/new-rom-form/hooks/useRomProposalSaver"

const RomAutomationContext = createContext(null)

const PROCESS_TIMEOUT_MS = 6 * 60 * 1000  // 6 minutes – total process budget
const STALL_TIMEOUT_MS   = 5 * 60 * 1000  // 5 minutes – max time without progress change
const WATCHDOG_INTERVAL_MS = 15 * 1000     // check every 15 seconds

export function RomAutomationProvider({ children }) {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState('')
    const [stepVisible, setStepVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [queueInfo, setQueueInfo] = useState(null) // { position: number }
    const [results, setResults] = useState(null)

    const currentStepRef = useRef('')
    const payloadRef = useRef(null)
    const formDataRef = useRef(null)
    const { joinQueue, checkStatus, leaveQueue } = useQueue()
    const { saveCompleteRomProposal } = useRomProposalSaver()
    const pollingRef = useRef(null)
    const hasActiveJobRef = useRef(false)

    // --- Watchdog refs ---
    const processStartedAtRef = useRef(null)
    const lastProgressAtRef = useRef(null)
    const lastProgressValueRef = useRef(0)
    const watchdogRef = useRef(null)
    const abortControllerRef = useRef(null)

    // Centralised cleanup so every exit path (success, error, timeout) is consistent
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
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/34d748ff-628f-42e2-b92c-c8daf6c96a9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rom-automation-provider.jsx:handleProgress',message:'handleProgress called',data:{progressValue,step,status,typeOfProgress:typeof progressValue},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        setProgress(progressValue)

        // Update stall-detection bookkeeping
        if (progressValue !== lastProgressValueRef.current) {
            lastProgressAtRef.current = Date.now()
            lastProgressValueRef.current = progressValue
        }

        // Sync progress to global store (for process queue display)
        useAutomationStore.getState().updateProcessProgress('ROM Generator', progressValue, step)

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

    // --- Watchdog: auto-fail on total timeout or stall ---
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
                    ? `ROM automation timed out after ${Math.round(elapsed / 60000)} minutes.`
                    : `ROM automation stalled – no progress for ${Math.round(sinceLast / 60000)} minutes.`

                console.warn(`[ROM Watchdog] ${reason}  Aborting.`)

                // Abort any in-flight fetch / SSE stream
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort()
                    abortControllerRef.current = null
                }

                await cleanupProcess()
                setIsLoading(false)
                setError(reason)

                // Also clean up the global automation store
                useAutomationStore.getState().stopRomAutomation?.()
            }
        }, WATCHDOG_INTERVAL_MS)
    }, [cleanupProcess])

    const stopWatchdog = useCallback(() => {
        if (watchdogRef.current) { clearInterval(watchdogRef.current); watchdogRef.current = null }
    }, [])

    const startAutomation = useCallback(async (payload, userName = 'Guest', fullFormData = null) => {
        setIsLoading(true)
        setProgress(0)
        setCurrentStep('Joining queue...')
        setStepVisible(true)
        setError(null)
        setQueueInfo(null)
        setResults(null)
        currentStepRef.current = 'Joining queue...'

        // Kick off the watchdog from the very start (covers queue-waiting phase too)
        startWatchdog()

        try {
            // 1. Join Queue
            let position = await joinQueue(userName, 'ROM Generator')
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/34d748ff-628f-42e2-b92c-c8daf6c96a9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rom-automation-provider.jsx:joinQueue',message:'joinQueue returned',data:{position,typeOfPosition:typeof position},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            setQueueInfo({ position })
            hasActiveJobRef.current = true

            // 2. Wait for turn
            if (position > 0) {
                setCurrentStep(`Waiting in queue... Position: ${position + 1}`)
                currentStepRef.current = `Waiting in queue... Position: ${position + 1}`

                await new Promise((resolve, reject) => {
                    pollingRef.current = setInterval(async () => {
                        // If the watchdog already aborted, stop polling
                        if (!hasActiveJobRef.current) {
                            clearInterval(pollingRef.current)
                            reject(new Error('Process timed out while waiting in queue.'))
                            return
                        }

                        const newPos = await checkStatus()
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/34d748ff-628f-42e2-b92c-c8daf6c96a9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rom-automation-provider.jsx:checkStatus',message:'checkStatus returned',data:{newPos,typeOfNewPos:typeof newPos},timestamp:Date.now(),hypothesisId:'H1,H4'})}).catch(()=>{});
                        // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/34d748ff-628f-42e2-b92c-c8daf6c96a9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'rom-automation-provider.jsx:startAutomation',message:'Queue resolved, starting SSE',data:{},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
            // #endregion

            // Reset stall timer now that the real work begins
            lastProgressAtRef.current = Date.now()

            setCurrentStep('Starting ROM automation...')
            currentStepRef.current = 'Starting ROM automation...'

            payloadRef.current = payload
            formDataRef.current = fullFormData

            const response = await startRomAutomationStream(payload)

            return new Promise((resolve, reject) => {
                createSSEConnection(
                    response,
                    handleProgress,
                    async (finalData) => {
                        stopWatchdog()
                        await cleanupProcess()
                        setIsLoading(false)
                        if (finalData.success || finalData.partialSuccess) {
                            let excelFiles = []
                            const savedPayload = payloadRef.current
                            if (savedPayload) {
                                try {
                                    console.log('[ROM] Generating Excel files client-side...')
                                    excelFiles = await generateMultipleExcelFiles({
                                        systemType: savedPayload.systemType,
                                        dasVendor: savedPayload.dasVendor,
                                        bdaVendor: savedPayload.bdaVendor,
                                        grossSqFt: savedPayload.grossSqFt,
                                        density: savedPayload.density,
                                        numSectors: savedPayload.numSectors || 0,
                                        areaPercentage: 100
                                    })
                                    console.log('[ROM] Excel files generated:', excelFiles.map(f => f.filename).join(', '))
                                } catch (excelErr) {
                                    console.error('[ROM] Excel generation failed:', excelErr)
                                }
                            }

                            const completeResult = {
                                ...finalData,
                                excelFiles: [...excelFiles, ...(finalData.excelFiles || [])]
                            }

                            try {
                                downloadAllRomFiles(completeResult)
                            } catch (dlErr) {
                                console.error('[ROM] Download error:', dlErr)
                            }

                            if (formDataRef.current) {
                                const fd = formDataRef.current
                                saveCompleteRomProposal({
                                    userId: fd.userId,
                                    venueInfo: fd.venueInfo,
                                    systemInfo: fd.systemInfo,
                                    screenshots: completeResult.screenshots || [],
                                    excelFiles: completeResult.excelFiles || []
                                }).then((saved) => {
                                    console.log('[ROM] ✓ ROM proposal saved to database:', saved.id)
                                }).catch((saveErr) => {
                                    console.error('[ROM] Failed to save ROM proposal to database:', saveErr)
                                })
                            }

                            setResults(completeResult)
                            resolve(completeResult)
                        } else {
                            reject(new Error(finalData.error || 'ROM automation failed'))
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
    }, [handleProgress, joinQueue, checkStatus, leaveQueue, saveCompleteRomProposal, startWatchdog, stopWatchdog, cleanupProcess])

    const resetAutomation = useCallback(() => {
        stopWatchdog()
        setProgress(0)
        setCurrentStep('')
        setStepVisible(true)
        setIsLoading(false)
        setError(null)
        setQueueInfo(null)
        setResults(null)
        currentStepRef.current = ''
        processStartedAtRef.current = null
        lastProgressAtRef.current = null
        lastProgressValueRef.current = 0
    }, [stopWatchdog])

    // Cleanup on unmount (e.g., full page refresh)
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
