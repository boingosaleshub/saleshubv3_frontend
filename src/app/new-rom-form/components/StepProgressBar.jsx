/**
 * StepProgressBar Component
 * Step-based progress indicator with numbered circles and labels
 * Matches reference design with project color scheme
 */

import { useRef, useEffect } from 'react'

export function StepProgressBar({ currentStepIndex = 0, steps = [], progress = 0, className = '' }) {
    const scrollContainerRef = useRef(null)
    const stepRefs = useRef([])

    // Auto-scroll to active step on mobile
    useEffect(() => {
        if (scrollContainerRef.current && stepRefs.current[currentStepIndex]) {
            const container = scrollContainerRef.current
            const activeStep = stepRefs.current[currentStepIndex]

            // Calculate center position
            const containerWidth = container.offsetWidth
            const stepLeft = activeStep.offsetLeft
            const stepWidth = activeStep.offsetWidth

            const scrollLeft = stepLeft - (containerWidth / 2) + (stepWidth / 2)

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            })
        }
    }, [currentStepIndex])

    // Calculate the progress percentage for the current step's line
    const calculateLineProgress = (stepIndex) => {
        const stepSize = 100 / steps.length
        const stepStart = stepIndex * stepSize
        const stepEnd = (stepIndex + 1) * stepSize

        if (progress >= stepEnd) {
            // Completed steps: 100% filled
            return 100
        } else if (progress >= stepStart && progress < stepEnd) {
            // Current step: calculate partial progress (0-100%)
            const progressInStep = ((progress - stepStart) / stepSize) * 100
            return progressInStep
        } else {
            // Future steps: 0% filled
            return 0
        }
    }

    return (
        <div className={`w-full ${className}`}>
            <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto pb-4 scrollbar-none"
            >
                <div className="flex items-start justify-between relative min-w-[600px] md:min-w-0 px-1">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex
                        const isActive = index === currentStepIndex
                        const showLine = index < steps.length - 1
                        const lineProgress = calculateLineProgress(index)

                        return (
                            <div
                                key={index}
                                ref={el => stepRefs.current[index] = el}
                                className="flex flex-col items-center relative"
                                style={{ flex: 1 }}
                            >
                                {/* Top Container for Circle and Lines - Fixed Height to prevent jumpiness */}
                                <div className="relative flex items-center justify-center w-full h-[54px] mb-1">

                                    {/* Connecting Line Background (Gray) */}
                                    {showLine && (
                                        <div
                                            className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[3px] -z-10 bg-gray-200 dark:bg-gray-700"
                                            style={{ width: '100%' }}
                                        />
                                    )}

                                    {/* Connecting Line Progress (Red) */}
                                    {showLine && (
                                        <div
                                            className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[3px] -z-10"
                                            style={{
                                                width: `${lineProgress}%`,
                                                backgroundColor: '#DC2626',
                                                transition: 'width 0.3s linear',
                                                willChange: 'width',
                                            }}
                                        />
                                    )}

                                    {/* Step Circle */}
                                    <div
                                        className="rounded-full flex items-center justify-center font-bold text-base z-10 transition-all duration-300 ease-in-out bg-white dark:bg-[#1a1d21] shrink-0 shadow-sm"
                                        style={{
                                            width: isActive ? '48px' : '40px',
                                            height: isActive ? '48px' : '40px',
                                            backgroundColor: isCompleted || isActive ? '#DC2626' : undefined,
                                            border: `3px solid ${isCompleted || isActive ? '#DC2626' : '#D1D5DB'}`,
                                            color: isCompleted || isActive ? '#FFFFFF' : '#9CA3AF',
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Step Label */}
                                <div
                                    className="text-xs font-medium text-center leading-tight transition-colors duration-300 ease-in-out px-1 min-h-[32px] flex items-start justify-center"
                                    style={{
                                        color: isCompleted || isActive ? '#DC2626' : '#9CA3AF',
                                        fontWeight: isActive ? '600' : '500',
                                    }}
                                >
                                    {step.label}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Percentage Display */}
            <div className="text-center mt-2">
                <span className="text-3xl font-bold text-gray-700 dark:text-gray-300 transition-all duration-300">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
    )
}
