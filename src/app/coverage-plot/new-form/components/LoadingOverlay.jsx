/**
 * LoadingOverlay Component
 * Composable loading overlay with GIF, step-based progress bar, and step display
 * Implements Composition Pattern
 */
import Image from "next/image"
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
        <div className="absolute inset-0 z-40 bg-white dark:bg-[#1a1d21] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-8 w-full max-w-5xl px-4">
                {/* Loading GIF */}
                <Image
                    src="/success.gif"
                    alt="Loading..."
                    width={400}
                    height={400}
                    className="object-contain"
                    unoptimized
                />
                
                {/* Step-Based Progress Bar */}
                <StepProgressBar
                    currentStepIndex={currentStepIndex}
                    steps={AUTOMATION_STEPS}
                    progress={progress}
                    className="w-full"
                />
                
                {/* Current Step Text */}
                <StepDisplay step={currentStep} visible={stepVisible} />
                
                {/* Queue Link */}
                <div className="text-center mt-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Wanna check out your coverage plot progress?{' '}
                        <a
                            href="/coverage-plot/progress-queue"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium hover:underline"
                        >
                            Click here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}