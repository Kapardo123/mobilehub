-- Tabela: cash_register_closings (Zamknięcia Dnia Kasy)
-- Przechowuje stan kasy na koniec każdego dnia

CREATE TABLE IF NOT EXISTS public.cash_register_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Data zamknięcia
  closing_date DATE NOT NULL,
  closed_at TIMESTAMPTZ DEFAULT now(),
  
  -- Stan kasy na koniec dnia
  opening_cash_amount DECIMAL(12,2) DEFAULT 0,      -- Stan kasy z poprzedniego dnia (otwarcie)
  closing_cash_amount DECIMAL(12,2) NOT NULL,        -- Stan gotówki na koniec dnia
  closing_card_amount DECIMAL(12,2) DEFAULT 0,       -- Stan kart na koniec dnia
  
  -- Podsumowanie sprzedaży tego dnia
  total_cash_sales DECIMAL(12,2) DEFAULT 0,
  total_card_sales DECIMAL(12,2) DEFAULT 0,
  total_costs DECIMAL(12,2) DEFAULT 0,
  total_doladowania DECIMAL(12,2) DEFAULT 0,
  
  -- Różnice i notatki
  expected_amount DECIMAL(12,2),                     -- Oczekiwana kwota (obliczona)
  difference DECIMAL(12,2),                          -- Różnica (rzeczywista - oczekiwana)
  notes TEXT,
  
  -- Metadane
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_cash_register_closings_shop_date 
  ON public.cash_register_closings(shop_id, closing_date DESC);
  
CREATE INDEX IF NOT EXISTS idx_cash_register_closings_employee 
  ON public.cash_register_closings(employee_id);

CREATE INDEX IF NOT EXISTS idx_cash_register_closings_date 
  ON public.cash_register_closings(closing_date DESC);

-- Unikalność: jeden rekord na sklep dziennie
CREATE UNIQUE INDEX IF NOT EXISTS idx_cash_register_closings_unique_shop_date 
  ON public.cash_register_closings(shop_id, closing_date) 
  WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE public.cash_register_closings ENABLE ROW LEVEL SECURITY;

-- Policy: Właściciele mogą widzieć wszystko w swoim sklepie
CREATE POLICY "Owners can view all closings in their shop"
  ON public.cash_register_closings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_shops 
      WHERE user_shops.user_id = auth.uid() 
      AND user_shops.shop_id = cash_register_closings.shop_id
      AND user_shops.is_primary = true
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'owner'
    )
  );

-- Policy: Pracownicy mogą widzieć swoje zamknięcia
CREATE POLICY "Employees can view own closings"
  ON public.cash_register_closings FOR SELECT
  USING (
    employee_id = auth.uid()
  );

-- Policy: Właściciele i menedżerowie mogą tworzyć zamknięcia
CREATE POLICY "Owners and managers can create closings"
  ON public.cash_register_closings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('owner', 'admin')
    )
  );

-- Policy: Tylko właściciel może aktualizować/modyfikować zamknięcia
CREATE POLICY "Only owners can update closings"
  ON public.cash_register_closings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'owner'
    )
  );

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_cash_register_closings
  BEFORE UPDATE ON public.cash_register_closings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Funkcja pomocnicza: Pobierz ostatni stan kasy dla sklepu
CREATE OR REPLACE FUNCTION get_last_cash_state(p_shop_id UUID)
RETURNS TABLE (
  last_closing_date DATE,
  closing_cash_amount DECIMAL(12,2),
  closing_card_amount DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    crc.closing_date,
    crc.closing_cash_amount,
    crc.closing_card_amount
  FROM public.cash_register_closings crc
  WHERE crc.shop_id = p_shop_id
    AND crc.deleted_at IS NULL
  ORDER BY crc.closing_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON TABLE public.cash_register_closings IS 'Tabela przechowująca stany kasy na koniec każdego dnia';
COMMENT ON COLUMN public.cash_register_closings.opening_cash_amount IS 'Stan kasy z poprzedniego dnia (kwota otwarcia)';
COMMENT ON COLUMN public.cash_register_closings.closing_cash_amount IS 'Stan gotówki na koniec dnia';
COMMENT ON COLUMN public.cash_register_closings.difference IS 'Różnica między oczekiwaną a rzeczywistą kwotą';
