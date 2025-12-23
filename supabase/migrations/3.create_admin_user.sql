-- Migration: Create Admin User
-- Created: 2025-12-23
-- Description: Creates the initial admin user and fixes auth.users field issues

-- Step 1: Create admin user in auth.users
DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fardinahmed66@gmail.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            last_sign_in_at,
            is_super_admin,
            confirmed_at,
            -- Fix NULL string fields
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change_token_current,
            email_change,
            phone_change_token,
            phone_change,
            reauthentication_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'fardinahmed66@gmail.com',
            extensions.crypt('fardin123456', extensions.gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"],"role":"Admin"}',
            '{"name":"Fardin"}',
            now(),
            now(),
            now(),
            FALSE,
            now(),
            -- Set empty strings instead of NULL
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
        );
    END IF;
END $$;

-- Step 2: Update existing admin user metadata if already exists
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "Admin"}'::jsonb,
    raw_user_meta_data = raw_user_meta_data || '{"name": "Fardin"}'::jsonb,
    -- Fix NULL string fields for existing users
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    email_change = COALESCE(email_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    phone_change = COALESCE(phone_change, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email = 'fardinahmed66@gmail.com';

-- Step 3: Manually sync to public.Users table
INSERT INTO public."Users" (id, name, email, role)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'name', ''),
    email,
    COALESCE((raw_app_meta_data->>'role')::public.user_role, 'User')
FROM auth.users
WHERE email = 'fardinahmed66@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
