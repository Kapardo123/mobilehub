SELECT COUNT(*) as total_users FROM public.users WHERE deleted_at IS NULL;

SELECT id, first_name || ' ' || last_name as name, role, login, is_active 
FROM public.users 
WHERE deleted_at IS NULL 
ORDER BY role, first_name;