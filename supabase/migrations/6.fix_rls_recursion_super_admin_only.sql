-- Migration: Fix RLS Infinite Recursion & Restrict User Management to Super Admin Only
-- Created: 2025-12-24
-- Description: 
--   1. Fixes infinite recursion in RLS policies by using a security definer function
--   2. Updates policies so ONLY Super Admins can manage users and roles (not regular Admins)

-- Step 1: Create a security definer function to get user role (bypasses RLS)
-- This function prevents infinite recursion by bypassing RLS when checking roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM public."Users" WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_role(uuid) IS 
'Security definer function to get user role without triggering RLS policies. Used to prevent infinite recursion in RLS policy checks.';

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can update profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can delete profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can insert profiles" ON "public"."Users";

-- Step 3: Recreate policies - ONLY Super Admins can manage users
-- Policy 1: Only Super Admins can view all profiles
CREATE POLICY "Super Admins can view all profiles" 
ON "public"."Users" 
FOR SELECT 
TO authenticated 
USING (
  public.get_user_role(auth.uid()) = 'Super Admin'
);

-- Policy 2: Only Super Admins can update any profile
CREATE POLICY "Super Admins can update profiles" 
ON "public"."Users" 
FOR UPDATE 
TO authenticated 
USING (
  public.get_user_role(auth.uid()) = 'Super Admin'
)
WITH CHECK (
  public.get_user_role(auth.uid()) = 'Super Admin'
);

-- Policy 3: Only Super Admins can delete any profile
CREATE POLICY "Super Admins can delete profiles" 
ON "public"."Users" 
FOR DELETE 
TO authenticated 
USING (
  public.get_user_role(auth.uid()) = 'Super Admin'
);

-- Policy 4: Only Super Admins can insert new profiles
CREATE POLICY "Super Admins can insert profiles" 
ON "public"."Users" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.get_user_role(auth.uid()) = 'Super Admin'
);

-- Step 4: Add a helper function to check if current user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN public.get_user_role(auth.uid()) = 'Super Admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_super_admin() IS 
'Helper function to check if the current authenticated user is a Super Admin. Returns true if Super Admin, false otherwise.';

-- Migration completed
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed: RLS recursion fixed and user management restricted to Super Admin only';
END $$;
