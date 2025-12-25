-- Migration: Add Super Admin Role
-- Created: 2025-12-24
-- Description: Adds 'Super Admin' role to the user_role enum type

-- Step 1: Add 'Super Admin' to the user_role enum
-- Note: PostgreSQL doesn't support ALTER TYPE ... ADD VALUE in a transaction block
-- So we use a DO block to handle this safely
DO $$ 
BEGIN
    -- Check if 'Super Admin' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'Super Admin' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'user_role'
        )
    ) THEN
        -- Add 'Super Admin' to the enum
        ALTER TYPE "public"."user_role" ADD VALUE 'Super Admin';
        RAISE NOTICE 'Added Super Admin role to user_role enum';
    ELSE
        RAISE NOTICE 'Super Admin role already exists in user_role enum';
    END IF;
END $$;

-- Step 2: Update RLS policies to include Super Admin
-- Super Admins should have the same or greater permissions than Admins

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins have full access" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can view all profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can update profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can delete profiles" ON "public"."Users";
DROP POLICY IF EXISTS "Admins can insert profiles" ON "public"."Users";

-- Recreate policies with Super Admin support
-- Policy 1: Admins and Super Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON "public"."Users" 
FOR SELECT 
TO authenticated 
USING (
  (SELECT role FROM "public"."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy 2: Admins and Super Admins can update any profile
CREATE POLICY "Admins can update profiles" 
ON "public"."Users" 
FOR UPDATE 
TO authenticated 
USING (
  (SELECT role FROM "public"."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
  (SELECT role FROM "public"."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy 3: Admins and Super Admins can delete any profile
CREATE POLICY "Admins can delete profiles" 
ON "public"."Users" 
FOR DELETE 
TO authenticated 
USING (
  (SELECT role FROM "public"."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy 4: Admins and Super Admins can insert new profiles
CREATE POLICY "Admins can insert profiles" 
ON "public"."Users" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT role FROM "public"."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Step 3: Update the sync function to handle Super Admin role
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

-- Step 4: Add comment for documentation
COMMENT ON TYPE "public"."user_role" IS 'User roles: User (standard), Admin (system admin), Super Admin (highest privileges)';

-- Migration completed successfully
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed: Super Admin role added successfully';
END $$;
