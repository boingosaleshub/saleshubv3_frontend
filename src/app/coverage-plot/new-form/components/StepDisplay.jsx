/**
 * StepDisplay Component
 * Display current step with fade in/out animations
 */

export function StepDisplay({ step = '', visible = true }) {
    return (
        <div className="text-center min-h-[24px]">
            <p
                className={`text-sm text-gray-600 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {step}
            </p>
        </div>
    )
}
