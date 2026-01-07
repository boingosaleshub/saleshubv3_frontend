'use server'

import { createAdminClient } from "@/lib/supabase-admin"
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// In-memory OTP store (for production, use Redis or database)
// Format: { email: { otp: string, expiresAt: number, attempts: number } }
const otpStore = new Map()

// OTP configuration
const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS = 3

/**
 * Generate a secure random OTP
 */
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString()
}

/**
 * Create email transporter
 */
function createTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP configuration is missing')
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
}

/**
 * Send password reset OTP to user's email
 */
export async function sendPasswordResetOTP(email) {
    try {
        // Validate email format
        if (!email || !email.includes('@')) {
            return { success: false, error: 'Please enter a valid email address' }
        }

        // Check if user exists in database
        const supabase = createAdminClient()
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('id, email, name')
            .eq('email', email.toLowerCase())
            .single()

        if (userError || !user) {
            // Don't reveal if email exists for security
            return {
                success: true,
                message: 'If an account exists with this email, you will receive a verification code.'
            }
        }

        // Generate OTP
        const otp = generateOTP()
        const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000)

        // Store OTP
        otpStore.set(email.toLowerCase(), {
            otp,
            expiresAt,
            attempts: 0,
            userId: user.id
        })

        // Send email
        const transporter = createTransporter()

        await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Boingo SalesHub'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Code - Boingo SalesHub',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #3D434A; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">🔐 Password Reset</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #3D434A; font-size: 20px;">
                                Hello ${user.name || 'there'}! 👋
                            </h2>
                            <p style="margin: 0 0 20px 0; color: #3D434A; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password. Use the verification code below to continue:
                            </p>
                            
                            <!-- OTP Code -->
                            <table role="presentation" style="margin: 30px 0; width: 100%;">
                                <tr>
                                    <td style="text-align: center;">
                                        <div style="display: inline-block; padding: 20px 40px; background-color: #f8f8f8; border: 2px dashed #E2211C; border-radius: 8px;">
                                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #E2211C; font-family: monospace;">
                                                ${otp}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0 0 0; color: #999999; font-size: 13px; text-align: center;">
                                ⚠️ This code will expire in ${OTP_EXPIRY_MINUTES} minutes.<br>
                                If you didn't request this, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #3D434A; font-size: 12px;">
                                This email was sent by Boingo SalesHub.<br>
                                For security, never share this code with anyone.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
      `,
        })

        console.log(`✅ Password reset OTP sent to ${email}`)
        return {
            success: true,
            message: 'Verification code sent to your email.'
        }

    } catch (error) {
        console.error('Failed to send password reset OTP:', error)
        return { success: false, error: 'Failed to send verification code. Please try again.' }
    }
}

/**
 * Verify the OTP entered by user
 */
export async function verifyPasswordResetOTP(email, otp) {
    try {
        const emailLower = email.toLowerCase()
        const storedData = otpStore.get(emailLower)

        if (!storedData) {
            return { success: false, error: 'No verification code found. Please request a new one.' }
        }

        // Check expiry
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(emailLower)
            return { success: false, error: 'Verification code has expired. Please request a new one.' }
        }

        // Check attempts
        if (storedData.attempts >= MAX_ATTEMPTS) {
            otpStore.delete(emailLower)
            return { success: false, error: 'Too many failed attempts. Please request a new code.' }
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            storedData.attempts++
            otpStore.set(emailLower, storedData)
            const remaining = MAX_ATTEMPTS - storedData.attempts
            return {
                success: false,
                error: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
            }
        }

        // OTP is valid - generate a reset token for the next step
        const resetToken = crypto.randomBytes(32).toString('hex')
        storedData.resetToken = resetToken
        storedData.verified = true
        otpStore.set(emailLower, storedData)

        return {
            success: true,
            resetToken,
            message: 'Code verified successfully!'
        }

    } catch (error) {
        console.error('OTP verification error:', error)
        return { success: false, error: 'Verification failed. Please try again.' }
    }
}

/**
 * Reset the user's password after OTP verification
 */
export async function resetPassword(email, resetToken, newPassword) {
    try {
        const emailLower = email.toLowerCase()
        const storedData = otpStore.get(emailLower)

        // Validate reset token
        if (!storedData || !storedData.verified || storedData.resetToken !== resetToken) {
            return { success: false, error: 'Invalid or expired session. Please start over.' }
        }

        // Validate password
        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters long.' }
        }

        // Update password in Supabase Auth
        const supabase = createAdminClient()
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            storedData.userId,
            { password: newPassword }
        )

        if (updateError) {
            console.error('Password update error:', updateError)
            return { success: false, error: 'Failed to update password. Please try again.' }
        }

        // Clear OTP data
        otpStore.delete(emailLower)

        console.log(`✅ Password reset successful for ${email}`)
        return {
            success: true,
            message: 'Password reset successfully! You can now sign in with your new password.'
        }

    } catch (error) {
        console.error('Password reset error:', error)
        return { success: false, error: 'Failed to reset password. Please try again.' }
    }
}
