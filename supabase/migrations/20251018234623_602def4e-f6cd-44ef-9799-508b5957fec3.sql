-- Create builder_screens table
CREATE TABLE IF NOT EXISTS public.builder_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_default_logged_in BOOLEAN DEFAULT false,
  is_default_logged_out BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create builder_components table
CREATE TABLE IF NOT EXISTS public.builder_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id UUID REFERENCES public.builder_screens(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  styles JSONB,
  actions JSONB,
  database_connection JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create builder_databases table
CREATE TABLE IF NOT EXISTS public.builder_databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create builder_database_records table
CREATE TABLE IF NOT EXISTS public.builder_database_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id TEXT NOT NULL,
  record_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.builder_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_database_records ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now - can be restricted later)
CREATE POLICY "Allow all access to builder_screens" ON public.builder_screens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to builder_components" ON public.builder_components FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to builder_databases" ON public.builder_databases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to builder_database_records" ON public.builder_database_records FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for builder images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('builder-images', 'builder-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for image uploads
CREATE POLICY "Allow public upload to builder-images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'builder-images');

CREATE POLICY "Allow public read from builder-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'builder-images');

CREATE POLICY "Allow public delete from builder-images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'builder-images');