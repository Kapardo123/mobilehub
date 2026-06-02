-- Dodaje 6 testowych telefonów do magazynu
-- Używa nowych UUID i IMEI żeby uniknąć duplikatów
-- shop_id: Kaufland Włocławek (660e8400-e29b-41d4-a716-446655440001)
-- added_by: Jan Kowalski (550e8400-e29b-41d4-a716-446655440002)

INSERT INTO public.inventory (
  id, name, category, brand, model, memory, color, condition,
  battery_health, imei, purchase_price, selling_price, profit_margin,
  tax_type, stock_quantity, is_sold, status, warranty_months,
  set_includes, purchase_date, notes, shop_id, added_by
) VALUES
  (
    'a11e8400-e29b-41d4-a716-446655440001',
    'iPhone 14 Pro', 'telefon', 'Apple', 'iPhone 14 Pro', '256GB', 'Space Black', 'uzywany',
    '94%', '359111111111001', 3600.00, 4299.00, 699.00,
    'marza', 1, false, 'uzywany', 6,
    'pudełko, kabel USB-C', '2024-09-15', 'Lekkie ślady na obudowie, ekran idealny',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a11e8400-e29b-41d4-a716-446655440002',
    'iPhone 15', 'telefon', 'Apple', 'iPhone 15', '128GB', 'Blue', 'uzywany',
    '96%', '359111111111002', 3100.00, 3699.00, 599.00,
    'marza', 1, false, 'uzywany', 9,
    'pudełko, kabel', '2024-10-20', 'Stan bardzo dobry, brak rys',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a11e8400-e29b-41d4-a716-446655440003',
    'Samsung Galaxy S23', 'telefon', 'Samsung', 'Galaxy S23', '256GB', 'Phantom Black', 'uzywany',
    '91%', '359111111111003', 2400.00, 2899.00, 499.00,
    'marza', 1, false, 'uzywany', 6,
    'pudełko, kabel', '2024-08-10', 'Drobne ryski na rogach',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a11e8400-e29b-41d4-a716-446655440004',
    'Xiaomi 14', 'telefon', 'Xiaomi', '14', '256GB', 'Titan Black', 'nowy',
    '100%', '359111111111004', 2800.00, 3299.00, 499.00,
    'VAT', 1, false, 'nowy', 24,
    'pełne pudełko, ładowarka 90W', '2025-01-05', 'Fabrycznie zafoliowany',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a11e8400-e29b-41d4-a716-446655440005',
    'Google Pixel 8', 'telefon', 'Google', 'Pixel 8', '128GB', 'Hazel', 'uzywany',
    '97%', '359111111111005', 2200.00, 2599.00, 399.00,
    'marza', 1, false, 'uzywany', 3,
    'pudełko, kabel', '2024-11-12', 'Stan idealny, kupiony w Polsce',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a11e8400-e29b-41d4-a716-446655440006',
    'iPhone 13', 'telefon', 'Apple', 'iPhone 13', '128GB', 'Pink', 'uzywany',
    '88%', '359111111111006', 1700.00, 2099.00, 399.00,
    'marza', 1, false, 'uzywany', 3,
    'kabel', '2024-06-25', 'Bateria 88%, sprawny 100%',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  );

-- Dodaje 4 akcesoria testowe
INSERT INTO public.inventory (
  id, name, category, brand, purchase_price, selling_price, profit_margin,
  tax_type, stock_quantity, is_sold, status, shop_id, added_by
) VALUES
  (
    'a22e8400-e29b-41d4-a716-446655440001',
    'Szkło hartowane iPhone 15 Pro', 'akcesoria', 'Apple', 18.00, 49.00, 31.00,
    'marza', 25, false, 'nowy',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a22e8400-e29b-41d4-a716-446655440002',
    'Etui silikonowe MagSafe', 'akcesoria', 'Apple', 55.00, 129.00, 74.00,
    'marza', 15, false, 'nowy',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a22e8400-e29b-41d4-a716-446655440003',
    'Ładowarka indukcyjna 15W', 'akcesoria', 'Samsung', 60.00, 119.00, 59.00,
    'marza', 12, false, 'nowy',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a22e8400-e29b-41d4-a716-446655440004',
    'Kabel USB-C 2m', 'akcesoria', 'Baseus', 25.00, 59.00, 34.00,
    'marza', 30, false, 'nowy',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  );

-- Dodaje 3 usługi testowe
INSERT INTO public.inventory (
  id, name, category, purchase_price, selling_price, profit_margin,
  tax_type, stock_quantity, is_sold, status, shop_id, added_by
) VALUES
  (
    'a33e8400-e29b-41d4-a716-446655440001',
    'Wymiana baterii iPhone', 'usluga', 30.00, 149.00, 119.00,
    'marza', 999, false, 'nowy',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a33e8400-e29b-41d4-a716-446655440002',
    'Wymiana ekranu', 'usluga', 80.00, 299.00, 219.00,
    'marza', 999, false, 'nowy',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  ),
  (
    'a33e8400-e29b-41d4-a716-446655440003',
    'Diagnostyka telefonu', 'usluga', 0.00, 50.00, 50.00,
    'marza', 999, false, 'nowy',
    '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'
  );
