-- Migration: Add Timestamps to Users Table
-- Created: 2025-12-23
-- Description: Adds created_at and updated_at columns with automatic update trigger

-- Add created_at and updated_at columns to Users table
ALTER TABLE "public"."Users" 
ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now() NOT NULL,
ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now() NOT NULL;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at on row update
DROP TRIGGER IF EXISTS set_updated_at ON "public"."Users";
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON "public"."Users"
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Update existing rows to have timestamps
UPDATE "public"."Users" 
SET created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE created_at IS NULL OR updated_at IS NULL;
