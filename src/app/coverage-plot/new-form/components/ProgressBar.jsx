/**
 * ProgressBar Component
 * Reusable progress bar with smooth Tailwind animations
 */

export function ProgressBar({ progress = 0, className = '' }) {
    return (
        <div className={`w-full space-y-3 ${className}`}>
            {/* Progress Bar Track */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>

            {/* Progress Percentage */}
            <div className="text-center">
                <span className="text-2xl font-bold text-gray-700">
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
    )
}
