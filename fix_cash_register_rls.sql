-- ============================================
-- FIX: Cash Register RLS Policies for Custom Auth System
-- Problem: App uses custom login (sessionStorage), not Supabase Auth
--          auth.uid() is always NULL → INSERT blocked by RLS
--          Data only saved to localStorage, never reaches DB
-- Solution: Allow anonymous access (same pattern as fix_rls.sql)
-- Date: 2025-05-30
-- ============================================

ALTER TABLE public.cash_register_closings ENABLE ROW LEVEL SECURITY;

-- DROP existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Closings: Select own shop" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Closings: Insert with auth" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Closings: Update own" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Closings: Soft delete" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Owners can view all closings in their shop" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Employees can view own closings" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Owners and managers can create closings" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Only owners can update closings" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Authenticated users can view closings" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Authenticated users can create closings" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Authenticated users can update closings" ON public.cash_register_closings;
DROP POLICY IF EXISTS "Authenticated users can delete closings" ON public.cash_register_closings;

-- Policy 1: Allow anonymous SELECT
CREATE POLICY "Allow anonymous select"
ON public.cash_register_closings
FOR SELECT
USING (true);

-- Policy 2: Allow anonymous INSERT (fixes the "violates row-level security" error)
CREATE POLICY "Allow anonymous insert"
ON public.cash_register_closings
FOR INSERT
WITH CHECK (true);

-- Policy 3: Allow anonymous UPDATE
CREATE POLICY "Allow anonymous update"
ON public.cash_register_closings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy 4: Allow anonymous DELETE (soft)
CREATE POLICY "Allow anonymous delete"
ON public.cash_register_closings
FOR DELETE
USING (true);