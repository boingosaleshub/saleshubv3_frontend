-- Run this in Supabase Dashboard → SQL Editor
-- DELETE: Admin/Super Admin can delete any row; authenticated users can delete their own row.

DROP POLICY IF EXISTS "Users can delete their own ROM proposals" ON public.rom_proposals;
DROP POLICY IF EXISTS "Only Admin and Super Admin can delete rom_proposals" ON public.rom_proposals;

CREATE POLICY "Admin or user can delete rom_proposals"
ON public.rom_proposals
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Super Admin')
  OR auth.uid() = user_id
);
