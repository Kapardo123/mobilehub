ALTER TABLE public.user_shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON public.user_shops FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON public.user_shops FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON public.user_shops FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON public.shops FOR SELECT USING (true);