-- ============================================
-- 🔧 ONLY STORAGE POLICIES (no table policies)
-- Use this if table 'documents' policies already exist
-- Date: 2025-05-27
-- ============================================

-- Drop ONLY storage policies (if they exist)
DROP POLICY IF EXISTS "Allow all uploads to documents" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete documents" ON storage.objects;

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- INSERT: Allow uploads to documents bucket
CREATE POLICY "Allow all uploads to documents"
ON storage.objects
FOR INSERT
TO authenticated, anon
WITH CHECK (
  bucket_id = 'documents'
);

-- SELECT: Public read access
CREATE POLICY "Public read access to documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
);

-- UPDATE: Authenticated can update
CREATE POLICY "Authenticated can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
);

-- DELETE: Authenticated can delete  
CREATE POLICY "Authenticated can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
);