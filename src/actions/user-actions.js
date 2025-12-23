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
  const password = formData.get('password')
  const name = formData.get('name')
  const role = formData.get('role') || 'User'

  // 1. Create auth user with email_confirm: false to trigger Supabase's invite email
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // This triggers Supabase to send confirmation email
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

  // 2. The trigger should handle creation in public.Users automatically
  // Update the public.Users table to ensure name and role are set correctly
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

  // 3. Generate and send invitation email via Supabase
  // This sends a magic link email to the user
  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      name,
      role,
      password_hint: `Your initial password is: ${password}`
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
  })

  // If invite fails because user already exists, generate a magic link instead
  if (inviteError) {
    console.log('Invite error (user may already exist), generating magic link:', inviteError.message)

    // Generate a magic link for the existing user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
        data: {
          password_hint: `Your password is: ${password}`
        }
      }
    })

    if (linkError) {
      console.error('Failed to generate magic link:', linkError)
      // Don't fail user creation, just log the error
    } else {
      console.log('Magic link generated. Supabase will send email automatically.')
    }
  }

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

  // Update password if provided (optional)
  if (data.password && data.password.trim() !== '') {
    authUpdate.password = data.password
  }

  // Update user_metadata for name
  if (data.name) {
    authUpdate.user_metadata = { name: data.name }
  }

  // Update app_metadata for role (secure)
  if (data.role) {
    authUpdate.app_metadata = { role: data.role }
  }

  // Update auth.users
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    authUpdate
  )

  if (authError) {
    return { error: authError.message }
  }

  // Update public.Users table (don't include password)
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
