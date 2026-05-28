-- ============================================
-- 🔧 COMPLETE RLS POLICIES FOR INVOICES
-- Run this in Supabase SQL Editor
-- Date: 2025-05-27
-- ============================================

-- ============================================
-- 1. CUSTOMERS TABLE
-- ============================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;

CREATE POLICY "Authenticated users can view customers"
ON public.customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert customers"
ON public.customers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own customers"
ON public.customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete customers"
ON public.customers FOR DELETE TO authenticated USING (true);

-- ============================================
-- 2. INVOICES TABLE
-- ============================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can delete invoices" ON public.invoices;

CREATE POLICY "Authenticated users can view invoices"
ON public.invoices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert invoices"
ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own invoices"
ON public.invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can delete invoices"
ON public.invoices FOR DELETE TO authenticated USING (true);

-- ============================================
-- 3. INVOICE_ITEMS TABLE
-- ============================================
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Authenticated users can insert invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items" ON public.invoice_items;

CREATE POLICY "Authenticated users can view invoice items"
ON public.invoice_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert invoice items"
ON public.invoice_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update invoice items"
ON public.invoice_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Users can delete invoice items"
ON public.invoice_items FOR DELETE TO authenticated USING (true);

-- ============================================
-- ✅ VERIFICATION - Check all policies
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('customers', 'invoices', 'invoice_items')
ORDER BY tablename, cmd;