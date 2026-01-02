/**
 * useSSEProgress Hook
 * Custom hook for handling SSE connection and progress updates
 * Implements Observer Pattern
 */

import { useState, useCallback, useRef } from 'react'
import { startAutomationStream } from '../services/automationService'
import { createSSEConnection } from '../services/sseClient'
import { ANIMATION_DURATIONS } from '../utils/constants'

export function useSSEProgress() {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState('')
    const [stepVisible, setStepVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    
    const currentStepRef = useRef('')
    
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
    
    const startAutomation = useCallback(async (payload) => {
        setIsLoading(true)
        setProgress(0)
        setCurrentStep('Starting...')
        setStepVisible(true)
        setError(null)
        currentStepRef.current = 'Starting...'
        
        console.log('[useSSEProgress] Starting automation with payload:', payload)
        
        try {
            const response = await startAutomationStream(payload)
            console.log('[useSSEProgress] Got response, creating SSE connection')
            
            return new Promise((resolve, reject) => {
                createSSEConnection(
                    response,
                    handleProgress,
                    (finalData) => {
                        console.log('[useSSEProgress] Automation complete, final data:', finalData)
                        setIsLoading(false)
                        if (finalData.success && finalData.screenshots) {
                            console.log(`[useSSEProgress] Resolving with ${finalData.screenshots.length} screenshots`)
                            resolve(finalData.screenshots)
                        } else {
                            console.error('[useSSEProgress] No screenshots in final data')
                            reject(new Error('No screenshots received'))
                        }
                    },
                    (err) => {
                        console.error('[useSSEProgress] Error:', err)
                        setIsLoading(false)
                        setError(err.message)
                        reject(err)
                    }
                )
            })
        } catch (err) {
            console.error('[useSSEProgress] Exception:', err)
            setIsLoading(false)
            setError(err.message)
            throw err
        }
    }, [handleProgress])
    
    return {
        progress,
        currentStep,
        stepVisible,
        isLoading,
        error,
        startAutomation
    }
}
