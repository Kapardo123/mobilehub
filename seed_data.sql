INSERT INTO public.users (id, first_name, last_name, initials, login, password_hash, role, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Piotr', 'Zakrzewski', 'PZ', 'wlasciciel', 'admin', 'owner', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jan', 'Kowalski', 'JK', 'pracownik', 'mobilehub', 'employee', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Kamil', 'Nowicki', 'KN', 'kamil', 'nowicki', 'employee', true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Anna', 'Nowak', 'AN', 'anna', 'nowak', 'employee', true);

INSERT INTO public.shops (id, code, name, address, city, postal_code, phone, is_active) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'KW', 'Kaufland Włocławek', 'ul. Włocławska 1', 'Włocławek', '87-800', '+48 123 456 789', true),
  ('660e8400-e29b-41d4-a716-446655440002', 'RG', 'Riviera Gdynia', 'ul. Morska 10', 'Gdynia', '81-000', '+48 234 567 890', true),
  ('660e8400-e29b-41d4-a716-446655440003', 'DW', 'Dominikańska Wrocław', 'ul. Dominikańska 5', 'Wrocław', '50-000', '+48 345 678 901', true);

INSERT INTO public.user_shops (user_id, shop_id, is_primary) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', true),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', true),
  ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', true),
  ('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', true);

INSERT INTO public.inventory (id, name, category, brand, model, memory, color, condition, purchase_price, selling_price, stock_quantity, status, shop_id, added_by) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'iPhone 13 Pro Max', 'telefon', 'Apple', 'iPhone 13 Pro Max', '256GB', 'Grafitowy', 'uzywany', 3200.00, 3999.00, 5, 'nowy', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Samsung Galaxy S22 Ultra', 'telefon', 'Samsung', 'Galaxy S22 Ultra', '128GB', 'Czarny', 'uzywany', 2800.00, 3499.00, 3, 'nowy', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440003', 'Xiaomi Mi 12', 'telefon', 'Xiaomi', 'Mi 12', '256GB', 'Biały', 'nowy', 2500.00, 2999.00, 8, 'nowy', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
  ('770e8400-e29b-41d4-a716-446655440004', 'OnePlus 10 Pro', 'telefon', 'OnePlus', '10 Pro', '256GB', 'Zielony', 'uzywany', 2200.00, 2799.00, 4, 'nowy', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003');

INSERT INTO public.customers (id, first_name, last_name, phone, email, is_active) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'Marek', 'Wiśniewski', '+48 600 123 456', 'marek@email.com', true),
  ('880e8400-e29b-41d4-a716-446655440002', 'Katarzyna', 'Lewandowska', '+48 700 987 654', 'kasia@email.com', true),
  ('880e8400-e29b-41d4-a716-446655440003', 'Tech Sp. z o.o.', NULL, NULL, 'biuro@tech.pl', true);

UPDATE public.customers SET customer_type = 'company', company_name = 'Tech Sp. z o.o.', nip = '123-456-78-90' WHERE id = '880e8400-e29b-41d4-a716-446655440003';

INSERT INTO public.sales (sale_number, sale_date, sale_time, payment_method, total_amount, shop_id, employee_id, status) VALUES
  ('FS-2026-0001', CURRENT_DATE, CURRENT_TIME, 'gotowka', 3999.00, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'completed'),
  ('FS-2026-0002', CURRENT_DATE, CURRENT_TIME - INTERVAL '2 hours', 'karta', 3499.00, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'completed'),
  ('FS-2026-0003', CURRENT_DATE - INTERVAL '1 day', CURRENT_TIME, 'gotowka', 2799.00, '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'completed');

INSERT INTO public.sale_items (sale_id, product_name, category, inventory_id, unit_price, quantity, purchase_cost) VALUES
  ((SELECT id FROM public.sales WHERE sale_number = 'FS-2026-0001'), 'iPhone 13 Pro Max', 'telefon', '770e8400-e29b-41d4-a716-446655440001', 3999.00, 1, 3200.00),
  ((SELECT id FROM public.sales WHERE sale_number = 'FS-2026-0002'), 'Samsung Galaxy S22 Ultra', 'telefon', '770e8400-e29b-41d4-a716-446655440002', 3499.00, 1, 2800.00),
  ((SELECT id FROM public.sales WHERE sale_number = 'FS-2026-0003'), 'OnePlus 10 Pro', 'telefon', '770e8400-e29b-41d4-a716-446655440004', 2799.00, 1, 2200.00);

INSERT INTO public.costs (cost_date, cost_time, category, amount, description, payment_method, shop_id, employee_id) VALUES
  (CURRENT_DATE, CURRENT_TIME - INTERVAL '3 hours', 'skup', 1500.00, 'Skup iPhone 12', 'gotowka', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
  (CURRENT_DATE, CURRENT_TIME - INTERVAL '5 hours', 'paczki', 35.00, 'Przesyłka kurierska', 'gotowka', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
  (CURRENT_DATE - INTERVAL '1 day', CURRENT_TIME, 'zaliczka', 500.00, 'Zaliczka za Samsung', 'przelew', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003');

INSERT INTO public.invoices (invoice_number, issue_date, due_date, sale_date, sale_time, status, total_amount, net_amount, vat_amount, customer_id, shop_id, employee_id) VALUES
  ('FV-2026-00001', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE, CURRENT_TIME, 'wydana', 3999.00, 3251.22, 747.78, '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
  ('FV-2026-00002', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '13 days', CURRENT_DATE - INTERVAL '1 day', CURRENT_TIME, 'oplacona', 3499.00, 2844.72, 654.28, '880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO public.invoice_items (invoice_id, item_name, unit_price, quantity, vat_rate) VALUES
  ((SELECT id FROM public.invoices WHERE invoice_number = 'FV-2026-00001'), 'iPhone 13 Pro Max', 3999.00, 1, 23.00),
  ((SELECT id FROM public.invoices WHERE invoice_number = 'FV-2026-00002'), 'Samsung Galaxy S22 Ultra', 3499.00, 1, 23.00);

INSERT INTO public.shifts (shift_date, start_time, end_time, status, shift_type, shop_id, employee_id) VALUES
  (CURRENT_DATE, '08:00', '16:00', 'zrealizowany', 'pełny', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
  (CURRENT_DATE, '10:00', '18:00', 'zrealizowany', 'pełny', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
  (CURRENT_DATE + INTERVAL '1 day', '08:00', '16:00', 'planowany', 'pełny', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004');

INSERT INTO public.audit_log (action_type, description, actor_id, actor_name, shop_id, shop_name) VALUES
  ('logowanie', 'Piotr Zakrzewski zalogował się', '550e8400-e29b-41d4-a716-446655440001', 'Piotr Zakrzewski', '660e8400-e29b-41d4-a716-446655440003', 'Dominikańska Wrocław'),
  ('logowanie', 'Jan Kowalski zalogował się', '550e8400-e29b-41d4-a716-446655440002', 'Jan Kowalski', '660e8400-e29b-41d4-a716-446655440001', 'Kaufland Włocławek'),
  ('sprzedaz', 'Sprzedano iPhone 13 Pro Max - 3999 PLN', '550e8400-e29b-41d4-a716-446655440002', 'Jan Kowalski', '660e8400-e29b-41d4-a716-446655440001', 'Kaufland Włocławek'),
  ('koszt', 'Skup iPhone 12 - 1500 PLN', '550e8400-e29b-41d4-a716-446655440002', 'Jan Kowalski', '660e8400-e29b-41d4-a716-446655440001', 'Kaufland Włocławek'),
  ('sprzedaz', 'Sprzedano Samsung Galaxy S22 Ultra - 3499 PLN', '550e8400-e29b-41d4-a716-446655440002', 'Jan Kowalski', '660e8400-e29b-41d4-a716-446655440001', 'Kaufland Włocławek');
