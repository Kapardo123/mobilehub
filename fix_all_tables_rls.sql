-- Polityki RLS dla wszystkich tabel - dostęp anonimowy (dla custom auth)

-- Tabela users
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.users;
CREATE POLICY "Allow anonymous read" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.users;
CREATE POLICY "Allow anonymous insert" ON public.users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.users;
CREATE POLICY "Allow anonymous update" ON public.users FOR UPDATE USING (true) WITH CHECK (true);

-- Tabela user_shops
ALTER TABLE IF EXISTS public.user_shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.user_shops;
CREATE POLICY "Allow anonymous read" ON public.user_shops FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.user_shops;
CREATE POLICY "Allow anonymous insert" ON public.user_shops FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.user_shops;
CREATE POLICY "Allow anonymous update" ON public.user_shops FOR UPDATE USING (true) WITH CHECK (true);

-- Tabela shops
ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.shops;
CREATE POLICY "Allow anonymous read" ON public.shops FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.shops;
CREATE POLICY "Allow anonymous insert" ON public.shops FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.shops;
CREATE POLICY "Allow anonymous update" ON public.shops FOR UPDATE USING (true) WITH CHECK (true);

-- Tabela inventory
ALTER TABLE IF EXISTS public.inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.inventory;
CREATE POLICY "Allow anonymous read" ON public.inventory FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.inventory;
CREATE POLICY "Allow anonymous insert" ON public.inventory FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.inventory;
CREATE POLICY "Allow anonymous update" ON public.inventory FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.inventory;
CREATE POLICY "Allow anonymous delete" ON public.inventory FOR DELETE USING (true);

-- Tabela sales
ALTER TABLE IF EXISTS public.sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.sales;
CREATE POLICY "Allow anonymous read" ON public.sales FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.sales;
CREATE POLICY "Allow anonymous insert" ON public.sales FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.sales;
CREATE POLICY "Allow anonymous update" ON public.sales FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.sales;
CREATE POLICY "Allow anonymous delete" ON public.sales FOR DELETE USING (true);

-- Tabela sale_items
ALTER TABLE IF EXISTS public.sale_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.sale_items;
CREATE POLICY "Allow anonymous read" ON public.sale_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.sale_items;
CREATE POLICY "Allow anonymous insert" ON public.sale_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.sale_items;
CREATE POLICY "Allow anonymous update" ON public.sale_items FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.sale_items;
CREATE POLICY "Allow anonymous delete" ON public.sale_items FOR DELETE USING (true);

-- Tabela costs
ALTER TABLE IF EXISTS public.costs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.costs;
CREATE POLICY "Allow anonymous read" ON public.costs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.costs;
CREATE POLICY "Allow anonymous insert" ON public.costs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.costs;
CREATE POLICY "Allow anonymous update" ON public.costs FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.costs;
CREATE POLICY "Allow anonymous delete" ON public.costs FOR DELETE USING (true);

-- Tabela customers
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.customers;
CREATE POLICY "Allow anonymous read" ON public.customers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.customers;
CREATE POLICY "Allow anonymous insert" ON public.customers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.customers;
CREATE POLICY "Allow anonymous update" ON public.customers FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.customers;
CREATE POLICY "Allow anonymous delete" ON public.customers FOR DELETE USING (true);

-- Tabela invoices
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.invoices;
CREATE POLICY "Allow anonymous read" ON public.invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.invoices;
CREATE POLICY "Allow anonymous insert" ON public.invoices FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.invoices;
CREATE POLICY "Allow anonymous update" ON public.invoices FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.invoices;
CREATE POLICY "Allow anonymous delete" ON public.invoices FOR DELETE USING (true);

-- Tabela invoice_items
ALTER TABLE IF EXISTS public.invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.invoice_items;
CREATE POLICY "Allow anonymous read" ON public.invoice_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.invoice_items;
CREATE POLICY "Allow anonymous insert" ON public.invoice_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.invoice_items;
CREATE POLICY "Allow anonymous update" ON public.invoice_items FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.invoice_items;
CREATE POLICY "Allow anonymous delete" ON public.invoice_items FOR DELETE USING (true);

-- Tabela shifts
ALTER TABLE IF EXISTS public.shifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.shifts;
CREATE POLICY "Allow anonymous read" ON public.shifts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.shifts;
CREATE POLICY "Allow anonymous insert" ON public.shifts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.shifts;
CREATE POLICY "Allow anonymous update" ON public.shifts FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.shifts;
CREATE POLICY "Allow anonymous delete" ON public.shifts FOR DELETE USING (true);

-- Tabela cash_register_closings
ALTER TABLE IF EXISTS public.cash_register_closings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.cash_register_closings;
CREATE POLICY "Allow anonymous read" ON public.cash_register_closings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.cash_register_closings;
CREATE POLICY "Allow anonymous insert" ON public.cash_register_closings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.cash_register_closings;
CREATE POLICY "Allow anonymous update" ON public.cash_register_closings FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.cash_register_closings;
CREATE POLICY "Allow anonymous delete" ON public.cash_register_closings FOR DELETE USING (true);

-- Tabela audit_log
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.audit_log;
CREATE POLICY "Allow anonymous read" ON public.audit_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.audit_log;
CREATE POLICY "Allow anonymous insert" ON public.audit_log FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous update" ON public.audit_log;
CREATE POLICY "Allow anonymous update" ON public.audit_log FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.audit_log;
CREATE POLICY "Allow anonymous delete" ON public.audit_log FOR DELETE USING (true);

SELECT '=== WSZYSTKIE POLITYKI RLS ZAKTUALIZOWANE ===' as info;
