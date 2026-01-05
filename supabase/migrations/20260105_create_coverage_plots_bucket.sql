-- Create coverage-plots storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coverage-plots',
  'coverage-plots',
  true,
  52428800, -- 50MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;



-- Policy: Allow authenticated users to upload to coverage-plots bucket
CREATE POLICY "Authenticated users can upload coverage plots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'coverage-plots');

-- Policy: Allow public read access to coverage-plots bucket
CREATE POLICY "Public read access to coverage plots"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'coverage-plots');

-- Policy: Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update coverage plots"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'coverage-plots')
WITH CHECK (bucket_id = 'coverage-plots');

-- Policy: Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete coverage plots"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'coverage-plots');
