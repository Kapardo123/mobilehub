UPDATE public.users SET deleted_at = NULL, is_active = true WHERE id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004');

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

INSERT INTO public.user_shops (user_id, shop_id, is_primary) VALUES
  ((SELECT id FROM public.users WHERE role = 'owner' LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', true),
  ((SELECT id FROM public.users WHERE role = 'owner' LIMIT 1), '550e8400-e29b-41d4-a716-446655440010', false),
  ((SELECT id FROM public.users WHERE role = 'owner' LIMIT 1), '550e8400-e29b-41d4-a716-446655440020', false),
  ((SELECT id FROM public.users WHERE login = 'jan.k' LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', true),
  ((SELECT id FROM public.users WHERE login = 'kamil.n' LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', true),
  ((SELECT id FROM public.users WHERE login = 'anna.n' LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', true);

SELECT '=== AKTYWNI UZYTKOWNICY ===' as info;
SELECT id, first_name || ' ' || last_name as name, role, login, CASE WHEN deleted_at IS NULL THEN 'AKTYWNY' ELSE 'USUNIETY' END as status FROM public.users ORDER BY role, first_name;

SELECT '=== PRZYPISANIA ===' as info;
SELECT u.first_name || ' ' || u.last_name as pracownik, s.name as sklep, CASE WHEN us.is_primary THEN 'GLOWNY' ELSE 'DODATKOWY' END as typ FROM public.user_shops us JOIN public.users u ON us.user_id = u.id JOIN public.shops s ON us.shop_id = s.id ORDER BY u.first_name, s.name;