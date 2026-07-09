CREATE TABLE public.artists (id bigint GENERATED ALWAYS AS IDENTITY NOT NULL, name text NOT NULL, year integer, link text, genre text, groupe text, created_at timestamp with time zone DEFAULT now());
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ADD CONSTRAINT artists_pkey PRIMARY KEY (id);
ALTER TABLE public.artists ADD CONSTRAINT artists_year_check CHECK (year > 0);
GRANT ALL ON public.artists TO anon;
GRANT ALL ON public.artists TO authenticated;
GRANT ALL ON public.artists TO service_role;
CREATE POLICY "public insert" ON public.artists FOR INSERT WITH CHECK (true);
CREATE POLICY "public read" ON public.artists FOR SELECT USING (true);