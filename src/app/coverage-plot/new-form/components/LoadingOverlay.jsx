/**
 * LoadingOverlay Component
 * Composable loading overlay with GIF, step-based progress bar, and step display
 * Implements Composition Pattern
 */

import { StepProgressBar } from "./StepProgressBar"
import { StepDisplay } from "./StepDisplay"

// Define the automation steps based on render logs
const AUTOMATION_STEPS = [
    { label: "Initializing" },
    { label: "Configuring" },
    { label: "Connecting" },
    { label: "Processing" },
    { label: "Rendering" },
    { label: "Capturing" },
    { label: "Finishing" }
]

export function LoadingOverlay({
    isLoading = false,
    progress = 0,
    currentStep = '',
    stepVisible = true
}) {
    if (!isLoading) return null

    // Calculate current step index based on progress
    const currentStepIndex = Math.min(
        Math.floor((progress / 100) * AUTOMATION_STEPS.length),
        AUTOMATION_STEPS.length - 1
    )

    return (
        <div className="absolute inset-0 z-40 bg-white flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-8 w-full max-w-5xl px-4">
                {/* Step-Based Progress Bar */}
                <StepProgressBar
                    currentStepIndex={currentStepIndex}
                    steps={AUTOMATION_STEPS}
                    progress={progress}
                    className="w-full"
                />

                {/* Current Step Text */}
                <StepDisplay step={currentStep} visible={stepVisible} />
            </div>
        </div>
    )
}
