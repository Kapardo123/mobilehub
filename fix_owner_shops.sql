DELETE FROM public.user_shops WHERE unassigned_at IS NULL;

INSERT INTO public.user_shops (user_id, shop_id, is_primary) VALUES
  ((SELECT id FROM public.users WHERE role = 'owner' LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', true),
  ((SELECT id FROM public.users WHERE role = 'owner' LIMIT 1), '550e8400-e29b-41d4-a716-446655440010', false),
  ((SELECT id FROM public.users WHERE role = 'owner' LIMIT 1), '550e8400-e29b-41d4-a716-446655440020', false);

INSERT INTO public.user_shops (user_id, shop_id, is_primary)
SELECT u.id, '550e8400-e29b-41d4-a716-446655440000', true 
FROM public.users u 
WHERE u.role IN ('employee', 'admin') AND u.deleted_at IS NULL;

SELECT u.first_name || ' ' || u.last_name as pracownik, s.name as sklep, CASE WHEN us.is_primary THEN 'GLOWNY' ELSE 'DODATKOWY' END as typ FROM public.user_shops us JOIN public.users u ON us.user_id = u.id JOIN public.shops s ON us.shop_id = s.id ORDER BY u.first_name, s.name;