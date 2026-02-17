-- ============================================================================
-- ROM Proposals Storage Bucket
-- Stores screenshot images (PNG) and Excel pricing files (XLSX) generated
-- during the ROM automation process.
-- ============================================================================

-- Create rom-proposals storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rom-proposals',
  'rom-proposals',
  true,              -- Public read access for serving files
  52428800,          -- 50MB file size limit
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload to rom-proposals bucket
CREATE POLICY "Authenticated users can upload ROM proposal files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rom-proposals');

-- Policy: Allow public read access to rom-proposals bucket
CREATE POLICY "Public read access to ROM proposal files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'rom-proposals');

-- Policy: Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update ROM proposal files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'rom-proposals')
WITH CHECK (bucket_id = 'rom-proposals');

-- Policy: Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete ROM proposal files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'rom-proposals');
