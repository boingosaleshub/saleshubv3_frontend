-- Migration: Refined RLS Policies
-- Created: 2025-12-23
-- Description: Updates RLS policies to use app_metadata instead of user_metadata for security

-- Drop existing policies
DROP POLICY IF EXISTS "Admins have full access" ON "public"."Users";
DROP POLICY IF EXISTS "Users can view their own profile" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can view all profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can update profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can delete profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can insert profiles" ON "public"."Users";

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON "public"."Users" 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON "public"."Users" 
FOR SELECT 
TO authenticated 
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin');

-- Policy 3: Admins can update any profile
CREATE POLICY "Admins can update profiles" 
ON "public"."Users" 
FOR UPDATE 
TO authenticated 
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin');

-- Policy 4: Admins can delete any profile
CREATE POLICY "Admins can delete profiles" 
ON "public"."Users" 
FOR DELETE 
TO authenticated 
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin');

-- Policy 5: Admins can insert profiles
CREATE POLICY "Admins can insert profiles" 
ON "public"."Users" 
FOR INSERT 
TO authenticated 
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin');

-- Update sync function to prioritize app_metadata for role (more secure)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."Users" (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email,
    COALESCE(
      (new.raw_app_meta_data->>'role')::public.user_role, 
      (new.raw_user_meta_data->>'role')::public.user_role, 
      'User'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
