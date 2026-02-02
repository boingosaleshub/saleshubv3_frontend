-- Migration: Add RLS Policies for ADRF and COMBA Tables
-- Created: 2026-02-02
-- Description: Enables RLS and adds policies for Equipment, Cabling Materials, AllIn, and Service Labor tables
-- Policy: All authenticated users can view, only Admins/Super Admins can modify

-- =====================================================
-- EQUIPMENT_ADRF RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public."Equipment_ADRF" ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view Equipment_ADRF"
ON public."Equipment_ADRF"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert Equipment_ADRF"
ON public."Equipment_ADRF"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update Equipment_ADRF"
ON public."Equipment_ADRF"
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete Equipment_ADRF"
ON public."Equipment_ADRF"
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- CABLING_MATERIALS_ADRF RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public."Cabling_Materials_ADRF" ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view Cabling_Materials_ADRF"
ON public."Cabling_Materials_ADRF"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert Cabling_Materials_ADRF"
ON public."Cabling_Materials_ADRF"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update Cabling_Materials_ADRF"
ON public."Cabling_Materials_ADRF"
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete Cabling_Materials_ADRF"
ON public."Cabling_Materials_ADRF"
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- ALLIN_ADRF RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public."AllIn_ADRF" ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view AllIn_ADRF"
ON public."AllIn_ADRF"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert AllIn_ADRF"
ON public."AllIn_ADRF"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update AllIn_ADRF"
ON public."AllIn_ADRF"
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete AllIn_ADRF"
ON public."AllIn_ADRF"
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- SERVICE_LABOR_ADRF RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public."Service_Labor_ADRF" ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view Service_Labor_ADRF"
ON public."Service_Labor_ADRF"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert Service_Labor_ADRF"
ON public."Service_Labor_ADRF"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update Service_Labor_ADRF"
ON public."Service_Labor_ADRF"
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete Service_Labor_ADRF"
ON public."Service_Labor_ADRF"
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- EQUIPMENT_COMBA RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public."Equipment_COMBA" ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view Equipment_COMBA"
ON public."Equipment_COMBA"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert Equipment_COMBA"
ON public."Equipment_COMBA"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update Equipment_COMBA"
ON public."Equipment_COMBA"
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete Equipment_COMBA"
ON public."Equipment_COMBA"
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- CABLING_MATERIALS_COMBA RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public."Cabling_Materials_COMBA" ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view Cabling_Materials_COMBA"
ON public."Cabling_Materials_COMBA"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert Cabling_Materials_COMBA"
ON public."Cabling_Materials_COMBA"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update Cabling_Materials_COMBA"
ON public."Cabling_Materials_COMBA"
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete Cabling_Materials_COMBA"
ON public."Cabling_Materials_COMBA"
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- ALLIN_COMBA RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public."AllIn_COMBA" ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view AllIn_COMBA"
ON public."AllIn_COMBA"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert AllIn_COMBA"
ON public."AllIn_COMBA"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update AllIn_COMBA"
ON public."AllIn_COMBA"
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete AllIn_COMBA"
ON public."AllIn_COMBA"
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- SERVICE_LABOR_COMBA RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public."Service_Labor_COMBA" ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view Service_Labor_COMBA"
ON public."Service_Labor_COMBA"
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert Service_Labor_COMBA"
ON public."Service_Labor_COMBA"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update Service_Labor_COMBA"
ON public."Service_Labor_COMBA"
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete Service_Labor_COMBA"
ON public."Service_Labor_COMBA"
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- Migration completed
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed: RLS policies added for all ADRF and COMBA tables';
END $$;
