-- Migration: Initial Setup - Users Table
-- Created: 2025-12-23
-- Description: Creates Users table with role-based access control and auth sync

-- Create UserRole Enum
DO $$ BEGIN
    CREATE TYPE "public"."user_role" AS ENUM ('Admin', 'User');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Users Table
CREATE TABLE IF NOT EXISTS "public"."Users" (
  "id" uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  "name" text,
  "email" text,
  "role" "public"."user_role" DEFAULT 'User' NOT NULL,
  CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."Users" ENABLE ROW LEVEL SECURITY;

-- Clear existing policies if any (to be safe)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON "public"."Users";
    DROP POLICY IF EXISTS "Admins have full access" ON "public"."Users";
EXCEPTION
    WHEN others THEN null;
END $$;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON "public"."Users" 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy 2: Admins can do everything (temporary - will be refined)
CREATE POLICY "Admins have full access" 
ON "public"."Users" 
FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM "public"."Users" WHERE id = auth.uid()) = 'Admin'
);

-- Sync Function: Create user in Users table when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."Users" (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'User')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On auth user created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync Function: Update user in Users table when auth.users is updated
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS trigger AS $$
BEGIN
  UPDATE public."Users"
  SET email = new.email,
      name = COALESCE(new.raw_user_meta_data->>'name', name)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On auth user updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();
