-- Migration: Allow Admin and Super Admin to Manage Users
-- Created: 2025-12-24
-- Description: 
--   Updates RLS policies to allow both Admin and Super Admin roles to manage users and roles.
--   Previously only Super Admin could manage users, now both Admin and Super Admin have full access.

-- Step 1: Drop existing Super Admin-only policies
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Super Admins can update profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Super Admins can delete profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Super Admins can insert profiles" ON "public"."Users";

-- Step 2: Create new policies allowing both Admin and Super Admin
-- Policy 1: Admins and Super Admins can view all profiles
CREATE POLICY "Admins and Super Admins can view all profiles" 
ON "public"."Users" 
FOR SELECT 
TO authenticated 
USING (
  public.get_user_role(auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy 2: Admins and Super Admins can update any profile
CREATE POLICY "Admins and Super Admins can update profiles" 
ON "public"."Users" 
FOR UPDATE 
TO authenticated 
USING (
  public.get_user_role(auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy 3: Admins and Super Admins can delete any profile
CREATE POLICY "Admins and Super Admins can delete profiles" 
ON "public"."Users" 
FOR DELETE 
TO authenticated 
USING (
  public.get_user_role(auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy 4: Admins and Super Admins can insert new profiles
CREATE POLICY "Admins and Super Admins can insert profiles" 
ON "public"."Users" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.get_user_role(auth.uid()) IN ('Admin', 'Super Admin')
);

-- Step 3: Update helper function to check for both Admin and Super Admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_user_role(auth.uid()) IN ('Admin', 'Super Admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin_or_super_admin() IS 
'Helper function to check if the current authenticated user is an Admin or Super Admin. Returns true if either role, false otherwise.';

-- Migration completed
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed: Both Admin and Super Admin can now manage users and roles';
END $$;
