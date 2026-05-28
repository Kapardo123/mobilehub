ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON public.users FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON public.users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON public.users FOR UPDATE USING (true) WITH CHECK (true);