'use server'

import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"
import { sendPasswordSetupEmail } from "@/lib/email"

async function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')

  const h = await headers()
  const origin = h.get('origin')
  if (origin) return origin.replace(/\/$/, '')

  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  if (!host) return 'http://localhost:3000'
  return `${proto}://${host}`.replace(/\/$/, '')
}

export async function getUsers() {
  const supabase = await createClient()

  // Fetch from public.Users table which is synced with auth.users
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return { error: error.message }
  }

  return { data }
}

export async function createUser(formData) {
  const supabaseAdmin = createAdminClient()

  const email = formData.get('email')
  const name = formData.get('name')
  const role = formData.get('role') || 'User'

  const siteUrl = await getSiteUrl()

  // 1. Create user (confirmed) with a temp password
  const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, // Auto-confirm so they can just set password
    user_metadata: { name },
    app_metadata: { role }
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Sync with public.Users table
  const { error: upsertError } = await supabaseAdmin
    .from('Users')
    .upsert(
      {
        id: authData.user.id,
        email,
        name,
        role,
      },
      { onConflict: 'id' }
    )

  if (upsertError) {
    console.error('Error upserting user profile:', upsertError)
  }

  // 3. Generate password setup link
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${siteUrl}/set-password` }
  })

  if (linkError) {
    console.error('Link Generation Error:', linkError)
    return {
      success: true,
      user: authData.user,
      warning: 'User created, but failed to generate password setup link.',
      emailSent: false
    }
  }

  const recoveryLink = linkData.properties.action_link

  // 4. Send email to the NEW USER via Brevo
  const emailResult = await sendPasswordSetupEmail(email, name, recoveryLink)

  if (!emailResult.success) {
    console.warn('Email sending failed:', emailResult.error)
    // Log the link for admin fallback
    console.log('----------------------------------------')
    console.log('MANUAL RECOVERY LINK (EMAIL FAILED):')
    console.log(`User: ${email}`)
    console.log(`Link: ${recoveryLink}`)
    console.log('----------------------------------------')

    return {
      success: true,
      user: authData.user,
      emailSent: false,
      warning: `User created, but email failed to send. Share this link with them:`,
      recoveryLink
    }
  }

  return { success: true, user: authData.user, emailSent: true }
}

export async function deleteUser(userId) {
  const supabaseAdmin = createAdminClient()

  // Delete from auth.users (cascades to public.User usually)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateUser(userId, data) {
  const supabaseAdmin = createAdminClient()

  // Prepare update data for auth.users
  const authUpdate = {}

  // Update email if provided
  if (data.email) {
    authUpdate.email = data.email
  }

  // Update user_metadata for name
  if (data.name) {
    authUpdate.user_metadata = { name: data.name }
  }

  // Update app_metadata for role (secure)
  if (data.role) {
    authUpdate.app_metadata = { role: data.role }
  }

  // Update auth.users (password updates removed - users should use forgot password flow)
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    authUpdate
  )

  if (authError) {
    return { error: authError.message }
  }

  // Update public.Users table
  const { error: dbError } = await supabaseAdmin
    .from('Users')
    .update({
      name: data.name,
      email: data.email,
      role: data.role
    })
    .eq('id', userId)

  if (dbError) {
    return { error: dbError.message }
  }

  return { success: true }
}
