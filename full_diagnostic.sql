SELECT '=== WSZYSTKIE UZYTKOWNICY (z deleted_at) ===' as info;
SELECT id, first_name || ' ' || last_name as name, role, login, is_active, deleted_at FROM public.users ORDER BY id;

SELECT '=== TYLKO AKTYWNI (deleted_at IS NULL) ===' as info;
SELECT id, first_name || ' ' || last_name as name, role, login FROM public.users WHERE deleted_at IS NULL ORDER BY id;

SELECT '=== POLICJA RLS DLA USERS ===' as info;
SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'users';

SELECT '=== USER_SHOPS ===' as info;
SELECT us.user_id, u.first_name || ' ' || u.last_name as name, us.shop_id, s.name as shop_name FROM public.user_shops us LEFT JOIN public.users u ON us.user_id = u.id LEFT JOIN public.shops s ON us.shop_id = s.id ORDER BY u.first_name;