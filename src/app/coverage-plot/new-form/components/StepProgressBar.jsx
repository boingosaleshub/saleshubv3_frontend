/**
 * StepProgressBar Component
 * Step-based progress indicator with numbered circles and labels
 * Matches reference design with project color scheme
 */

export function StepProgressBar({ currentStepIndex = 0, steps = [], progress = 0, className = '' }) {
    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex
                    const isActive = index === currentStepIndex
                    const isPending = index > currentStepIndex
                    const showLine = index < steps.length - 1

                    return (
                        <div key={index} className="flex flex-col items-center relative" style={{ flex: 1 }}>
                            {/* Connecting Line */}
                            {showLine && (
                                <div
                                    className="absolute left-1/2 top-[20px] h-[3px] -z-10 transition-all duration-700 ease-in-out"
                                    style={{
                                        width: 'calc(100% + 0px)',
                                        backgroundColor: isCompleted ? '#DC2626' : '#E5E7EB',
                                    }}
                                />
                            )}

                            {/* Step Circle */}
                            <div
                                className="rounded-full flex items-center justify-center font-bold text-base z-10 transition-all duration-700 ease-in-out"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    backgroundColor: isCompleted || isActive ? '#DC2626' : '#FFFFFF',
                                    border: `3px solid ${isCompleted || isActive ? '#DC2626' : '#D1D5DB'}`,
                                    color: isCompleted || isActive ? '#FFFFFF' : '#9CA3AF',
                                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                }}
                            >
                                {index + 1}
                            </div>

                            {/* Step Label */}
                            <div
                                className="mt-3 text-xs font-medium text-center leading-tight transition-all duration-700 ease-in-out px-1"
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

            {/* Percentage Display */}
            <div className="text-center mt-6">
                <span className="text-3xl font-bold text-gray-700 transition-all duration-300">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
    )
}
