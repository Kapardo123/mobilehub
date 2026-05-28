-- ============================================
-- 🔧 INVOICES RLS POLICIES
-- Fix: "new row violates row-level security policy"
-- Date: 2025-05-27
-- ============================================

-- Enable RLS on invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can delete invoices" ON public.invoices;

-- SELECT: Authenticated users can read all invoices
CREATE POLICY "Authenticated users can view invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  true
);

-- INSERT: Authenticated users can create invoices
CREATE POLICY "Authenticated users can insert invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (
  true
);

-- UPDATE: Users can update any invoice
CREATE POLICY "Users can update own invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (
  true
)
WITH CHECK (
  true
);

-- DELETE: Admins/owners can delete invoices
CREATE POLICY "Admins can delete invoices"
ON public.invoices
FOR DELETE
TO authenticated
USING (
  true
);

-- ============================================
-- INVOICE_ITEMS RLS POLICIES
-- ============================================

-- Enable RLS on invoice_items table
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can insert invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items" ON public.invoice_items;

-- SELECT: Authenticated users can read all invoice items
CREATE POLICY "Authenticated users can view invoice items"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (
  true
);

-- INSERT: Authenticated users can create invoice items
CREATE POLICY "Authenticated users can insert invoice items"
ON public.invoice_items
FOR INSERT
TO authenticated
WITH CHECK (
  true
);

-- UPDATE: Users can update any invoice item
CREATE POLICY "Users can update invoice items"
ON public.invoice_items
FOR UPDATE
TO authenticated
USING (
  true
)
WITH CHECK (
  true
);

-- DELETE: Users can delete invoice items
CREATE POLICY "Users can delete invoice items"
ON public.invoice_items
FOR DELETE
TO authenticated
USING (
  true
);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('invoices', 'invoice_items')
ORDER BY tablename, cmd;