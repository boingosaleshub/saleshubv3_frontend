/**
 * LoadingOverlay Component
 * Composable loading overlay with GIF, progress bar, and step display
 * Implements Composition Pattern
 */

import Image from "next/image"
import Link from "next/link"
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

                {/* Queue Link */}
                <div className="text-center mt-4">
                    <p className="text-gray-500 text-sm">
                        Wanna check out your coverage plot progress?{' '}
                        <Link
                            href="/coverage-plot/progress-queue"
                            className="text-red-600 hover:text-red-700 font-medium hover:underline"
                        >
                            Click here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
