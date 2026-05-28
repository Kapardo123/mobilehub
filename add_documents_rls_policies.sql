-- ============================================
-- RLS Policies for Documents Table
-- Migration: Add Row Level Security
-- Date: 2025-05-27
-- ============================================

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to INSERT their own documents
CREATE POLICY "Users can insert documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = uploaded_by
);

-- Policy 2: Allow all authenticated users to SELECT public documents OR their own
CREATE POLICY "Users can view documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  is_public = true 
  OR uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('owner', 'admin')
  )
);

-- Policy 3: Allow document uploader or admin/owner to UPDATE
CREATE POLICY "Document uploaders can update"
ON public.documents
FOR UPDATE
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('owner', 'admin')
  )
);

-- Policy 4: Allow document uploader or admin/owner to DELETE (soft delete via update)
CREATE POLICY "Document uploaders can delete"
ON public.documents
FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('owner', 'admin')
  )
);

-- Note: Storage bucket 'documents' should be created in Supabase Dashboard
-- with appropriate storage policies for uploads

/*
STORAGE POLICIES (run in Supabase SQL Editor):

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to documents bucket
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to documents
CREATE POLICY "Public can view documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
);

-- Allow users to update/delete their own documents
CREATE POLICY "Users can manage own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
*/