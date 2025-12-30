'use server'

import * as Brevo from '@getbrevo/brevo'

/**
 * Sends a password setup email to a newly created user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} setupLink - Password setup link
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendPasswordSetupEmail(email, name, setupLink) {
    if (!process.env.BREVO_API_KEY) {
        console.error('BREVO_API_KEY is not configured')
        return { success: false, error: 'Email service not configured' }
    }

    // Initialize API instance inside the function to ensure env vars are loaded
    const apiInstance = new Brevo.TransactionalEmailsApi()

    // Set API key - use the correct method for @getbrevo/brevo
    apiInstance.setApiKey(
        Brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
    )

    const sendSmtpEmail = new Brevo.SendSmtpEmail()

    sendSmtpEmail.subject = 'Set Up Your Password - Boingo SalesHub'
    sendSmtpEmail.sender = {
        name: 'Boingo SalesHub',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@boingosaleshub.com'
    }
    sendSmtpEmail.to = [{ email, name }]
    sendSmtpEmail.htmlContent = `
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
                        <td style="background-color: #E41F26; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                Welcome to Boingo SalesHub
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">
                                Hello ${name || 'there'}! 👋
                            </h2>
                            <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                An account has been created for you on Boingo SalesHub. To get started, please set up your password by clicking the button below.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #E41F26; border-radius: 6px;">
                                        <a href="${setupLink}" style="display: inline-block; padding: 14px 30px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                                            Set Up Your Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px 0; color: #777777; font-size: 14px; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 20px 0; color: #E41F26; font-size: 14px; word-break: break-all;">
                                <a href="${setupLink}" style="color: #E41F26;">${setupLink}</a>
                            </p>
                            
                            <p style="margin: 20px 0 0 0; color: #999999; font-size: 13px;">
                                ⚠️ This link will expire in 24 hours for security reasons.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                This email was sent by Boingo SalesHub.<br>
                                If you didn't expect this email, please ignore it.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `

    try {
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log(`✅ Password setup email sent successfully to ${email}`, response)
        return { success: true }
    } catch (error) {
        console.error('Failed to send email via Brevo:', error)
        // Log more details for debugging
        if (error.response) {
            console.error('Response status:', error.response.status)
            console.error('Response body:', error.response.body)
        }
        return { success: false, error: error.message || 'Failed to send email' }
    }
}
