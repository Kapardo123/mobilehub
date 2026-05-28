DELETE FROM public.cash_register_closings;
DELETE FROM public.audit_log;
DELETE FROM public.shifts;
DELETE FROM public.sale_items;
DELETE FROM public.sales;
DELETE FROM public.costs;
DELETE FROM public.invoices;
DELETE FROM public.inventory;
DELETE FROM public.user_shops WHERE unassigned_at IS NULL;
DELETE FROM public.users;

INSERT INTO public.users (id, first_name, last_name, initials, email, role, login, password_hash, is_active, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Wlasciciel', '', 'W', 'wlasciciel@test.com', 'owner', 'admin', '123456', true, NOW(), NOW());

INSERT INTO public.user_shops (user_id, shop_id, is_primary)
SELECT 
  u.id as user_id,
  s.id as shop_id,
  CASE WHEN s.id = '550e8400-e29b-41d4-a716-446655440000' THEN true ELSE false END as is_primary
FROM public.users u
CROSS JOIN public.shops s
WHERE s.is_active = true AND u.role = 'owner';

SELECT id, first_name || ' ' || last_name as name, role, login, password_hash as pin FROM public.users;