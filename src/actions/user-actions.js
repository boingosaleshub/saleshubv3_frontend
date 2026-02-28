'use server'

import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"
import { sendPasswordSetupEmail } from "@/lib/email"

const SITE_URL = 'https://saleshub.boingo.com'

export async function getUsers() {
  const supabase = await createClient()

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

  // 1. Create user (confirmed) with a temp password
  const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
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
    options: { redirectTo: `${SITE_URL}/set-password` }
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

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function sendPasswordSetupLink(userId) {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const role = currentUser?.app_metadata?.role
  if (!['Admin', 'Super Admin'].includes(role)) {
    return { error: 'Only Admin or Super Admin can send password setup links.' }
  }

  const { data: targetUser, error: fetchError } = await supabaseAdmin
    .from('Users')
    .select('id, email, name')
    .eq('id', userId)
    .single()

  if (fetchError || !targetUser) {
    return { error: 'User not found.' }
  }

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: targetUser.email,
    options: { redirectTo: `${SITE_URL}/set-password` }
  })

  if (linkError) {
    console.error('Link Generation Error:', linkError)
    return { error: linkError.message || 'Failed to generate password setup link.' }
  }

  const recoveryLink = linkData.properties.action_link
  const emailResult = await sendPasswordSetupEmail(targetUser.email, targetUser.name, recoveryLink)

  if (!emailResult.success) {
    return { error: emailResult.error || 'Failed to send email.' }
  }

  return { success: true }
}

export async function setInitialPassword(accessToken, newPassword) {
  const supabaseAdmin = createAdminClient()

  if (!accessToken) {
    return { error: 'Invalid session. Please click the link in your email again.' }
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  try {
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken)

    if (userError || !user) {
      console.error('Token verification failed:', userError)
      return { error: 'Session expired or invalid. Please click the link in your email again.' }
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return { error: updateError.message || 'Failed to set password. Please try again.' }
    }

    console.log(`Password set successfully for user: ${user.email}`)
    return { success: true }
  } catch (error) {
    console.error('Error in setInitialPassword:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function updateUser(userId, data) {
  const supabaseAdmin = createAdminClient()

  const authUpdate = {}

  if (data.email) {
    authUpdate.email = data.email
  }

  if (data.name) {
    authUpdate.user_metadata = { name: data.name }
  }

  if (data.role) {
    authUpdate.app_metadata = { role: data.role }
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    authUpdate
  )

  if (authError) {
    return { error: authError.message }
  }

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