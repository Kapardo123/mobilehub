-- NAPRAWA TRIGGERA GENEROWANIA NUMERÓW SPRZEDAŻY
-- Uruchom to w Supabase Dashboard → SQL Editor

-- 1. USUŃ STARY ZEPSUTY TRIGGER
DROP TRIGGER IF EXISTS trigger_generate_sale_number ON public.sales;
DROP FUNCTION IF EXISTS public.generate_sale_number();

-- 2. STWÓRZ NOWĄ POPRAWNĄ FUNKCJĘ (SECURITY DEFINER - omija RLS)
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE 
    prefix TEXT; 
    seq_num INTEGER;
BEGIN
    prefix := 'FS-' || TO_CHAR(NEW.sale_date, 'YYYY') || '-';
    
    SELECT COALESCE(
        MAX(SUBSTRING(sale_number FROM '[0-9]+$')::INTEGER), 
        0
    ) + 1 INTO seq_num
    FROM public.sales 
    WHERE sale_date = NEW.sale_date
      AND sale_number LIKE prefix || '%';
    
    IF seq_num IS NULL THEN
        seq_num := 1;
    END IF;
    
    NEW.sale_number := prefix || LPAD(seq_num::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. STWÓRZ NOWY TRIGGER (tylko gdy sale_number NIE jest ustawione)
CREATE TRIGGER trigger_generate_sale_number
    BEFORE INSERT ON public.sales FOR EACH ROW
    WHEN (NEW.sale_number IS NULL)
    EXECUTE FUNCTION public.generate_sale_number();

-- 4. TEST: Sprawdź czy działa
-- INSERT INTO public.sales (sale_date, sale_time, payment_method, total_amount, shop_id, employee_id, status) 
-- VALUES (CURRENT_DATE, CURRENT_TIME, 'gotowka', 100.00, '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'completed')
-- RETURNING sale_number;

-- Powinno zwrócić: FS-2026-0004 (lub wyższy jeśli są już rekordy)