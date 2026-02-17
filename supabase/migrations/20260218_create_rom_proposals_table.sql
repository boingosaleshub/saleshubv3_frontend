-- ============================================================================
-- ROM Proposals Table
-- Stores all information from completed ROM Generation processes including
-- venue details, system configuration, and generated file URLs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rom_proposals (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User who created the ROM proposal
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- =========================================================================
    -- VENUE INFORMATION
    -- =========================================================================
    venue_name TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    venue_type TEXT NOT NULL,                          -- Apartments/Condos, Student Housing, Hospital, Clinic/Outpatient Facility, Office, Shopping Mall, Hotel, Warehouse, Airport
    num_floors INTEGER NOT NULL,
    gross_sq_ft NUMERIC NOT NULL,                     -- Total gross square footage

    -- Parking
    has_parking_garage BOOLEAN NOT NULL DEFAULT true,
    parking_sq_ft NUMERIC,                            -- NULL when has_parking_garage is false

    -- Population
    pops INTEGER NOT NULL,                            -- Populations Covered (PoPs)

    -- Third Party
    is_third_party BOOLEAN NOT NULL DEFAULT false,
    third_party_name TEXT,                            -- NULL when is_third_party is false
    third_party_fee NUMERIC,                         -- NULL when is_third_party is false

    -- AHJ & Schedule
    ahj_requirements TEXT[] NOT NULL DEFAULT '{}',    -- Array: e.g. ['700MHz', '850MHz', '450MHz']
    building_density TEXT NOT NULL,                   -- Open Space, Light, Medium, Dense, High Density
    sales_manager TEXT NOT NULL,
    construction_date DATE NOT NULL,                  -- Expected Construction Start Date
    close_date DATE NOT NULL,                         -- Expected Close Date
    on_air_date DATE NOT NULL,                        -- Expected On Air Date

    -- Map Coordinates (from address selection)
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    zoom_level INTEGER,

    -- =========================================================================
    -- SYSTEM INFORMATION
    -- =========================================================================
    system_type TEXT NOT NULL,                        -- DAS, ERCES, DAS & ERCES
    das_architecture TEXT,                            -- DAS (Distributed Antenna System), Part 20 (BDA only) — NULL when not DAS
    oem_criteria TEXT NOT NULL,                       -- performance, cost, legacy
    das_vendor TEXT,                                  -- Comba, ADRF — NULL when not DAS
    bda_vendor TEXT,                                  -- Comba, ADRF — NULL when not ERCES
    erces_coverage TEXT,                              -- full, critical — NULL when not ERCES
    sector_criteria TEXT NOT NULL,                    -- capacity, coverage
    num_sectors INTEGER NOT NULL DEFAULT 3,
    signal_source TEXT NOT NULL,                      -- BDA, eFento, One Cell, BTS
    carrier_requirements TEXT[] NOT NULL,             -- Array: e.g. ['AT&T', 'Verizon', 'T-Mobile']
    tech_supported TEXT[] NOT NULL,                   -- Array: e.g. ['4G LTE', '4G LTE & 5G NR']
    additional_info TEXT,                             -- Free-form additional notes

    -- =========================================================================
    -- GENERATED FILES (stored as Supabase Storage public URLs)
    -- =========================================================================
    screenshot_urls TEXT[] NOT NULL DEFAULT '{}',     -- Array of Supabase Storage URLs for coverage screenshots
    excel_file_urls TEXT[] NOT NULL DEFAULT '{}',     -- Array of Supabase Storage URLs for pricing Excel files

    -- =========================================================================
    -- METADATA
    -- =========================================================================
    status TEXT NOT NULL DEFAULT 'completed',         -- completed, partial (some files missing)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast lookup by user
CREATE INDEX IF NOT EXISTS idx_rom_proposals_user_id
ON public.rom_proposals(user_id);

-- Sorting by creation date (newest first)
CREATE INDEX IF NOT EXISTS idx_rom_proposals_created_at
ON public.rom_proposals(created_at DESC);

-- Search by venue name
CREATE INDEX IF NOT EXISTS idx_rom_proposals_venue_name
ON public.rom_proposals(venue_name);

-- Filter by system type
CREATE INDEX IF NOT EXISTS idx_rom_proposals_system_type
ON public.rom_proposals(system_type);

-- Filter by status
CREATE INDEX IF NOT EXISTS idx_rom_proposals_status
ON public.rom_proposals(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.rom_proposals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own ROM proposals
CREATE POLICY "Users can insert their own ROM proposals"
ON public.rom_proposals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own ROM proposals
CREATE POLICY "Users can view their own ROM proposals"
ON public.rom_proposals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admin and Super Admin can view all ROM proposals
CREATE POLICY "Admins can view all ROM proposals"
ON public.rom_proposals
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public."Users"
        WHERE id = auth.uid()
        AND role IN ('Admin', 'Super Admin')
    )
);

-- Policy: Users can update their own ROM proposals
CREATE POLICY "Users can update their own ROM proposals"
ON public.rom_proposals
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own ROM proposals
CREATE POLICY "Users can delete their own ROM proposals"
ON public.rom_proposals
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_rom_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rom_proposals_updated_at
BEFORE UPDATE ON public.rom_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_rom_proposals_updated_at();
