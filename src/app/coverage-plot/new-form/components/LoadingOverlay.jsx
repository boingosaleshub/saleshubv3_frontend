/**
 * LoadingOverlay Component
 * Composable loading overlay with GIF, progress bar, and step display
 * Implements Composition Pattern
 */

import Image from "next/image"
import { ProgressBar } from "./ProgressBar"
import { StepDisplay } from "./StepDisplay"

export function LoadingOverlay({
    isLoading = false,
    progress = 0,
    currentStep = '',
    stepVisible = true
}) {
    if (!isLoading) return null

    return (
        <div className="absolute inset-0 z-40 bg-white flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md px-4">
                {/* Loading GIF */}
                <Image
                    src="/success.gif"
                    alt="Loading..."
                    width={400}
                    height={400}
                    className="object-contain"
                    unoptimized
                />

                {/* Progress Bar */}
                <ProgressBar progress={progress} />

                {/* Current Step */}
                <StepDisplay step={currentStep} visible={stepVisible} />
            </div>
        </div>
    )
}
