-- =====================================================
-- CREATE COMBA TABLE
-- =====================================================

CREATE TABLE public.vendor_comba (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DAS', 'ERCES')),
    qty INTEGER,
    assumptions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_vendor_comba_section ON public.vendor_comba(section);
CREATE INDEX idx_vendor_comba_type ON public.vendor_comba(type);

-- =====================================================
-- CREATE ADRF TABLE
-- =====================================================

CREATE TABLE public.vendor_adrf (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DAS', 'ERCES')),
    qty INTEGER,
    assumptions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_vendor_adrf_section ON public.vendor_adrf(section);
CREATE INDEX idx_vendor_adrf_type ON public.vendor_adrf(type);

-- =====================================================
-- VENDOR_COMBA RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.vendor_comba ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view vendor_comba"
ON public.vendor_comba
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert vendor_comba"
ON public.vendor_comba
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update vendor_comba"
ON public.vendor_comba
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete vendor_comba"
ON public.vendor_comba
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- =====================================================
-- VENDOR_ADRF RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.vendor_adrf ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view
CREATE POLICY "Authenticated users can view vendor_adrf"
ON public.vendor_adrf
FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins and Super Admins can insert
CREATE POLICY "Admins can insert vendor_adrf"
ON public.vendor_adrf
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can update
CREATE POLICY "Admins can update vendor_adrf"
ON public.vendor_adrf
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
)
WITH CHECK (
    (SELECT role FROM public."Users" WHERE id = auth.uid()) IN ('Admin', 'Super Admin')
);

-- Policy: Admins and Super Admins can delete
CREATE POLICY "Admins can delete vendor_adrf"
ON public.vendor_adrf
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
    RAISE NOTICE 'Migration completed: vendor_comba and vendor_adrf tables created with RLS policies';
END $$;