-- ============================================
-- 🔧 FIX INVOICES - ANON + AUTHENTICATED ACCESS
-- Problem: 401 Unauthorized + RLS violation
-- Date: 2025-05-27
-- ============================================

-- ============================================
-- 1. CUSTOMERS TABLE - Allow ANON + AUTH
-- ============================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on customers" ON public.customers;

CREATE POLICY "Allow all on customers"
ON public.customers
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. INVOICES TABLE - Allow ANON + AUTH  
-- ============================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on invoices" ON public.invoices;

CREATE POLICY "Allow all on invoices"
ON public.invoices
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. INVOICE_ITEMS TABLE - Allow ANON + AUTH
-- ============================================
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on invoice_items" ON public.invoice_items;

CREATE POLICY "Allow all on invoice_items"
ON public.invoice_items
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ============================================
-- ✅ VERIFICATION
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('customers', 'invoices', 'invoice_items')
ORDER BY tablename, cmd;