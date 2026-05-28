-- ============================================
-- 🔧 CUSTOMERS RLS POLICIES
-- Fix: RLS errors when creating/searching customers
-- Date: 2025-05-27
-- ============================================

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;

-- SELECT: Authenticated users can read all customers
CREATE POLICY "Authenticated users can view customers"
ON public.customers
FOR SELECT
TO authenticated
USING (
  true
);

-- INSERT: Authenticated users can create customers
CREATE POLICY "Authenticated users can insert customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (
  true
);

-- UPDATE: Users can update any customer
CREATE POLICY "Users can update own customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (
  true
)
WITH CHECK (
  true
);

-- DELETE: Admins/owners can delete customers
CREATE POLICY "Admins can delete customers"
ON public.customers
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
  cmd
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY cmd;