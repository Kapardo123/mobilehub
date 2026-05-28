SELECT '=== UZYTKOWNICY ===' as info;
SELECT id, first_name || ' ' || last_name as name, role, login FROM public.users WHERE deleted_at IS NULL ORDER BY role;

SELECT '=== SKLEPY ===' as info;
SELECT id, name FROM public.shops WHERE is_active = true ORDER BY name;

SELECT '=== USER_SHOPS (przed) ===' as info;
SELECT COUNT(*) as total FROM public.user_shops WHERE unassigned_at IS NULL;