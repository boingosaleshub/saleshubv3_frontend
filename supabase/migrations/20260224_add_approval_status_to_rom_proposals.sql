-- ============================================================================
-- Add Approval Status to ROM Proposals
-- Implements admin approval workflow for ROM proposals created by Users.
-- Admin/Super Admin proposals are auto-approved; User proposals start as Pending.
-- ============================================================================

-- Add the approval_status column
ALTER TABLE public.rom_proposals
ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'Pending';

-- Add CHECK constraint for valid values
ALTER TABLE public.rom_proposals
ADD CONSTRAINT chk_approval_status
CHECK (approval_status IN ('Pending', 'Approved', 'Rejected'));

-- Index for filtering by approval status
CREATE INDEX IF NOT EXISTS idx_rom_proposals_approval_status
ON public.rom_proposals(approval_status);

-- ============================================================================
-- Back-fill: Mark all existing proposals created by Admin/Super Admin as Approved
-- ============================================================================
UPDATE public.rom_proposals
SET approval_status = 'Approved'
WHERE user_id IN (
    SELECT id FROM public."Users"
    WHERE role IN ('Admin', 'Super Admin')
);

-- ============================================================================
-- RLS Policy: Admin and Super Admin can update any ROM proposal
-- (needed for approving/rejecting proposals)
-- ============================================================================

CREATE POLICY "Admins can update all ROM proposals"
ON public.rom_proposals
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public."Users"
        WHERE id = auth.uid()
        AND role IN ('Admin', 'Super Admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public."Users"
        WHERE id = auth.uid()
        AND role IN ('Admin', 'Super Admin')
    )
);

-- ============================================================================
-- RLS Policy: Admin and Super Admin can delete any ROM proposal
-- ============================================================================

CREATE POLICY "Admins can delete all ROM proposals"
ON public.rom_proposals
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public."Users"
        WHERE id = auth.uid()
        AND role IN ('Admin', 'Super Admin')
    )
);
