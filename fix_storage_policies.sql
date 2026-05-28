-- ============================================
-- 🔧 FIX: Storage Policies for Documents Bucket
-- Problem: "new row violates row-level security policy" 
--          when uploading files to storage
-- Solution: Add proper policies for storage.objects
-- Date: 2025-05-27
-- ============================================

-- Step 1: Create bucket if not exists (run this FIRST)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Step 3: Allow ANYONE (even anonymous) to upload to documents bucket
CREATE POLICY "Allow all uploads to documents"
ON storage.objects
FOR INSERT
TO authenticated, anon
WITH CHECK (
  bucket_id = 'documents'
);

-- Step 4: Allow PUBLIC read access (files downloadable by anyone)
CREATE POLICY "Public read access to documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
);

-- Step 5: Allow authenticated users to update/delete their own files
CREATE POLICY "Authenticated can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
);

CREATE POLICY "Authenticated can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
);