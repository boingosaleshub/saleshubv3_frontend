-- Create coverage_plots table
CREATE TABLE IF NOT EXISTS public.coverage_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_address TEXT NOT NULL,
    carriers TEXT[] NOT NULL,
    coverage_types TEXT[] NOT NULL,
    screenshot_urls TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_coverage_plots_user_id ON public.coverage_plots(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_coverage_plots_created_at ON public.coverage_plots(created_at DESC);

-- Enable RLS
ALTER TABLE public.coverage_plots ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own records
CREATE POLICY "Users can insert their own coverage plots"
ON public.coverage_plots
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own records
CREATE POLICY "Users can view their own coverage plots"
ON public.coverage_plots
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admin and Super Admin can view all records
CREATE POLICY "Admins can view all coverage plots"
ON public.coverage_plots
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public."Users"
        WHERE id = auth.uid()
        AND role IN ('Admin', 'Super Admin')
    )
);

-- Policy: Users can update their own records
CREATE POLICY "Users can update their own coverage plots"
ON public.coverage_plots
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own records
CREATE POLICY "Users can delete their own coverage plots"
ON public.coverage_plots
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_coverage_plots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER trigger_update_coverage_plots_updated_at
BEFORE UPDATE ON public.coverage_plots
FOR EACH ROW
EXECUTE FUNCTION public.update_coverage_plots_updated_at();
