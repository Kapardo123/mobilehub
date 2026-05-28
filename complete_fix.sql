ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read" ON public.users;
CREATE POLICY "Allow anonymous read" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert" ON public.users;
CREATE POLICY "Allow anonymous insert" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update" ON public.users;
CREATE POLICY "Allow anonymous update" ON public.users FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.user_shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read" ON public.user_shops;
CREATE POLICY "Allow anonymous read" ON public.user_shops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert" ON public.user_shops;
CREATE POLICY "Allow anonymous insert" ON public.user_shops FOR INSERT WITH CHECK (true);

ALTER TABLE IF EXISTS public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read" ON public.shops;
CREATE POLICY "Allow anonymous read" ON public.shops FOR SELECT USING (true);

INSERT INTO public.users (id, first_name, last_name, initials, email, role, login, password_hash, is_active, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Jan', 'Kowalski', 'JK', 'jan.kowalski@test.com', 'employee', 'jan.k', '123456', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Kamil', 'Nowicki', 'KN', 'kamil.nowicki@test.com', 'employee', 'kamil.n', '234567', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Anna', 'Nowak', 'AN', 'anna.nowak@test.com', 'employee', 'anna.n', '345678', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  deleted_at = NULL,
  is_active = true,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

DELETE FROM public.user_shops WHERE unassigned_at IS NULL;

INSERT INTO public.user_shops (user_id, shop_id, is_primary)
SELECT 
  u.id as user_id,
  s.id as shop_id,
  CASE 
    WHEN u.role = 'owner' AND s.id = '550e8400-e29b-41d4-a716-446655440000' THEN true
    WHEN u.role != 'owner' THEN true
    ELSE false 
  END as is_primary
FROM public.users u
CROSS JOIN public.shops s
WHERE s.is_active = true
AND u.deleted_at IS NULL
AND (
  (u.role = 'owner') OR
  (u.role IN ('employee', 'admin') AND s.id = '550e8400-e29b-41d4-a716-446655440000')
);

SELECT '=== WYNIK KONCOWY ===' as info;
SELECT COUNT(*) as liczba_aktywnych_userow FROM public.users WHERE deleted_at IS NULL;
SELECT u.first_name || ' ' || u.last_name as pracownik, s.name as sklep FROM public.user_shops us JOIN public.users u ON us.user_id = u.id JOIN public.shops s ON us.shop_id = s.id ORDER BY u.first_name, s.name;