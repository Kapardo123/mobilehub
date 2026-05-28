-- ============================================
-- UTWORZENIE TABELI cash_register_closings
-- ============================================

CREATE TABLE IF NOT EXISTS public.cash_register_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  closing_date DATE NOT NULL,
  opening_cash_amount DECIMAL(12,2) DEFAULT 0,
  closing_cash_amount DECIMAL(12,2) NOT NULL,
  closing_card_amount DECIMAL(12,2) DEFAULT 0,
  total_cash_sales DECIMAL(12,2) DEFAULT 0,
  total_card_sales DECIMAL(12,2) DEFAULT 0,
  total_costs DECIMAL(12,2) DEFAULT 0,
  total_doladowania DECIMAL(12,2) DEFAULT 0,
  expected_amount DECIMAL(12,2),
  difference DECIMAL(12,2),
  notes TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_cash_register_closings_shop_id ON public.cash_register_closings(shop_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_closings_employee_id ON public.cash_register_closings(employee_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_closings_closing_date ON public.cash_register_closings(closing_date);
CREATE INDEX IF NOT EXISTS idx_cash_register_closings_deleted_at ON public.cash_register_closings(deleted_at);

-- RLS Policies
ALTER TABLE public.cash_register_closings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Closings: Select own shop" ON public.cash_register_closings
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Closings: Insert with auth" ON public.cash_register_closings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Closings: Update own" ON public.cash_register_closings
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = employee_id);

CREATE POLICY "Closings: Soft delete" ON public.cash_register_closings
  FOR DELETE USING (auth.uid() = created_by OR auth.role() = 'service_role');

-- Trigger dla updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_update_cash_register_closings ON public.cash_register_closings;
CREATE TRIGGER on_update_cash_register_closings
  BEFORE UPDATE ON public.cash_register_closings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Dane testowe (opcjonalne - tylko jeśli masz już sklep i użytkownika)
-- INSERT INTO public.cash_register_closings (shop_id, employee_id, closing_date, opening_cash_amount, closing_cash_amount, total_cash_sales, total_card_sales, total_costs, expected_amount, difference, notes, created_by)
-- VALUES 
--   ((SELECT id FROM public.shops LIMIT 1), (SELECT id FROM public.users LIMIT 1), CURRENT_DATE - 1, 2698.50, 3256.78, 450.00, 120.00, 89.22, 3059.28, 197.50, 'Testowe zamknięcie dnia', (SELECT id FROM public.users LIMIT 1))
-- ON CONFLICT DO NOTHING;

SELECT 'Tabela cash_register_closings utworzona pomyślnie!' as status;