'use server'

import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"

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

  // Generate a temporary random password (required by Supabase, but user will set their own)
  const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)

  // 1. Create auth user with temporary password
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: false, // User needs to confirm via password reset link
    user_metadata: {
      name
    },
    app_metadata: {
      role
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Update the public.Users table to ensure name and role are set correctly
  const { error: updateError } = await supabaseAdmin
    .from('Users')
    .update({
      name: name,
      role: role
    })
    .eq('id', authData.user.id)

  if (updateError) {
    console.error('Error updating user profile:', updateError)
    // Don't fail the whole request as auth user is created
  }

  // 3. Generate password recovery link for user to set their own password
  const { data: recoveryData, error: recoveryError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/set-password`
    }
  })

  if (recoveryError) {
    console.error('Failed to generate password reset link:', recoveryError)
    return { 
      error: 'User created but failed to send password setup email. Please use forgot password.',
      user: authData.user 
    }
  }

  // Note: Supabase automatically sends the recovery email with the link
  // For development: Print the link to console if email is not configured
  console.log('Password setup email sent to:', email)
  console.log('Password setup link (for development):', recoveryData.properties.action_link)
  console.log('User can visit this link to set their password')

  return { success: true, user: authData.user }
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
