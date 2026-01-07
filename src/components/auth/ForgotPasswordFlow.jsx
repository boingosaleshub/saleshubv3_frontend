"use client"

import { useState } from "react"
import { toast } from "sonner"
import BoingoGradientButton from "@/components/ui/boingo-gradient-button"
import LoadingIcon from "@/components/ui/loading-icon"
import { ArrowLeft, Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from "@/actions/password-reset-actions"

/**
 * ForgotPasswordFlow - Multi-step forgot password component
 * 
 * Step 1: Enter email → sends OTP via custom Nodemailer
 * Step 2: Enter OTP → verifies token
 * Step 3: Enter new password → resets password via Supabase admin
 */
export default function ForgotPasswordFlow({ onBackToLogin }) {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [resetToken, setResetToken] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    // Step 1: Send OTP to email
    const handleSendOTP = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await sendPasswordResetOTP(email)

            if (!result.success) {
                toast.error(result.error)
                setLoading(false)
                return
            }

            toast.success("Verification code sent!", {
                description: "Please check your inbox for the code."
            })
            setStep(2)
            startResendCooldown()
        } catch (err) {
            toast.error("Failed to send verification code. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await verifyPasswordResetOTP(email, otp)

            if (!result.success) {
                toast.error(result.error)
                setLoading(false)
                return
            }

            setResetToken(result.resetToken)
            toast.success("Code verified successfully!")
            setStep(3)
        } catch (err) {
            toast.error("Verification failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.")
            return
        }

        setLoading(true)

        try {
            const result = await resetPassword(email, resetToken, newPassword)

            if (!result.success) {
                toast.error(result.error)
                setLoading(false)
                return
            }

            toast.success("Password reset successfully!", {
                description: "You can now sign in with your new password."
            })

            // Return to login after a short delay
            setTimeout(() => {
                onBackToLogin()
            }, 1500)
        } catch (err) {
            toast.error("Failed to reset password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Resend OTP with cooldown
    const startResendCooldown = () => {
        setResendCooldown(60)
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleResendOTP = async () => {
        if (resendCooldown > 0) return

        setLoading(true)
        try {
            const result = await sendPasswordResetOTP(email)

            if (!result.success) {
                toast.error(result.error)
                return
            }

            toast.success("Verification code resent!")
            startResendCooldown()
        } catch (err) {
            toast.error("Failed to resend code.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-lg animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-6">
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${step === s
                                    ? "bg-gradient-to-r from-[var(--boingo-red)] to-[var(--boingo-red-dark)] text-white shadow-md"
                                    : step > s
                                        ? "bg-green-500 text-white"
                                        : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                        </div>
                    ))}
                </div>

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-5 animate-in fade-in duration-200">
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-[var(--boingo-red)] to-[var(--boingo-red-dark)] rounded-full flex items-center justify-center mx-auto mb-3">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold">Forgot Password?</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enter your email address and we&apos;ll send you a verification code.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="reset-email" className="text-sm font-medium">Email Address</label>
                            <input
                                id="reset-email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <BoingoGradientButton
                            type="submit"
                            disabled={loading || !email}
                            className="w-full h-10"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <LoadingIcon size={20} />
                                    <span>Sending code…</span>
                                </span>
                            ) : (
                                "Send Verification Code"
                            )}
                        </BoingoGradientButton>

                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in fade-in duration-200">
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-[var(--boingo-red)] to-[var(--boingo-red-dark)] rounded-full flex items-center justify-center mx-auto mb-3">
                                <KeyRound className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold">Verify Code</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                We sent a verification code to <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="otp" className="text-sm font-medium">Verification Code</label>
                            <input
                                id="otp"
                                type="text"
                                required
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring text-center text-lg tracking-widest font-mono"
                                maxLength={6}
                            />
                        </div>

                        <BoingoGradientButton
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full h-10"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <LoadingIcon size={20} />
                                    <span>Verifying…</span>
                                </span>
                            ) : (
                                "Verify Code"
                            )}
                        </BoingoGradientButton>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resendCooldown > 0 || loading}
                                className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                            >
                                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Change Email
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in duration-200">
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-[var(--boingo-red)] to-[var(--boingo-red-dark)] rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold">Set New Password</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create a strong password for your account.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-xs text-destructive">Passwords do not match</p>
                            )}
                        </div>

                        <BoingoGradientButton
                            type="submit"
                            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                            className="w-full h-10"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <LoadingIcon size={20} />
                                    <span>Saving…</span>
                                </span>
                            ) : (
                                "Save Password"
                            )}
                        </BoingoGradientButton>
                    </form>
                )}
            </div>
        </div>
    )
}
