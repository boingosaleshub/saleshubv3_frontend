'use server'

import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(data) {
    const supabase = await createClient()

    // 1. Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Unauthorized' }
    }

    const userId = user.id
    const supabaseAdmin = createAdminClient()

    // 2. Prepare updates
    const authUpdate = {}
    const dbUpdate = {}

    if (typeof data.name === 'string') {
        authUpdate.user_metadata = { ...user.user_metadata, name: data.name }
        dbUpdate.name = data.name
    }

    if (typeof data.email === 'string' && data.email !== user.email) {
        authUpdate.email = data.email
        dbUpdate.email = data.email
    }

    // 3. Update auth.users using Admin client (avoids email confirm flow for internal tools if desired, 
    // but strictly safer to use standard update. adhering to "saved to database" request implies direct update)
    // We'll use Admin to ensure it "just works" as requested, but be aware it bypasses verification.
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdate
    )

    if (authError) {
        return { error: authError.message }
    }

    // 4. Update public.Users table
    const { error: dbError } = await supabaseAdmin
        .from('Users')
        .update(dbUpdate)
        .eq('id', userId)

    if (dbError) {
        return { error: dbError.message }
    }

    revalidatePath('/profile')
    revalidatePath('/', 'layout') // Update top bar avatar/name everywhere

    return { success: true }
}

export async function changePassword(currentPassword, newPassword) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'Unauthorized' }
    }

    // 2. Verify current password by attempting to sign in
    // We use a fresh client or just the current one. 
    // Since we are already logged in, signing in again with same creds just refreshes verification.
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
    })

    if (signInError) {
        return { error: 'Incorrect current password' }
    }

    // 3. Update password
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (updateError) {
        return { error: updateError.message }
    }

    return { success: true }
}
