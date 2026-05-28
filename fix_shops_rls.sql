ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read" ON public.shops;
CREATE POLICY "Allow anonymous read" ON public.shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert" ON public.shops;
CREATE POLICY "Allow anonymous insert" ON public.shops FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update" ON public.shops;
CREATE POLICY "Allow anonymous update" ON public.shops FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous delete" ON public.shops;
CREATE POLICY "Allow anonymous delete" ON public.shops FOR DELETE USING (true);

SELECT '=== RLS DLA SKLEPÓW NAPRAWIONE ===' as status;