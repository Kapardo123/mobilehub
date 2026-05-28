UPDATE public.users 
SET password_hash = '123456',
    updated_at = NOW()
WHERE role = 'owner' 
AND deleted_at IS NULL
RETURNING id, first_name || ' ' || last_name as name, login, password_hash as pin;

SELECT '=== WŁAŚCICIEL ZAKTUALIZOWANY ===' as info;
SELECT 'Teraz możesz się zalogować:' as instruction;
SELECT 'Login: ' || login as login_info,
       'PIN: 123456' as pin_info
FROM public.users 
WHERE role = 'owner' 
AND deleted_at IS NULL;