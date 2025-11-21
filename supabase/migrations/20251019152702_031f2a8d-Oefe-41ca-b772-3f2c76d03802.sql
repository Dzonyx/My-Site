-- Create profiles table for user information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects FOR DELETE
USING (auth.uid() = user_id);

-- Add project_id to builder tables
ALTER TABLE public.builder_screens ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.builder_databases ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Update RLS policies for builder_screens to be project-based
DROP POLICY IF EXISTS "Allow all access to builder_screens" ON public.builder_screens;

CREATE POLICY "Users can view screens in their projects"
ON public.builder_screens FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = builder_screens.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create screens in their projects"
ON public.builder_screens FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = builder_screens.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update screens in their projects"
ON public.builder_screens FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = builder_screens.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete screens in their projects"
ON public.builder_screens FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = builder_screens.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Update RLS policies for builder_databases
DROP POLICY IF EXISTS "Allow all access to builder_databases" ON public.builder_databases;

CREATE POLICY "Users can view databases in their projects"
ON public.builder_databases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = builder_databases.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create databases in their projects"
ON public.builder_databases FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = builder_databases.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update databases in their projects"
ON public.builder_databases FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = builder_databases.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete databases in their projects"
ON public.builder_databases FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = builder_databases.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();