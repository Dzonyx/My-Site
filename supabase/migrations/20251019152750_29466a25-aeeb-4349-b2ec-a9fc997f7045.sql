-- Update RLS policies for builder_components to be project-based
DROP POLICY IF EXISTS "Allow all access to builder_components" ON public.builder_components;

CREATE POLICY "Users can view components in their projects"
ON public.builder_components FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.builder_screens
    JOIN public.projects ON projects.id = builder_screens.project_id
    WHERE builder_screens.id = builder_components.screen_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create components in their projects"
ON public.builder_components FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.builder_screens
    JOIN public.projects ON projects.id = builder_screens.project_id
    WHERE builder_screens.id = builder_components.screen_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update components in their projects"
ON public.builder_components FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.builder_screens
    JOIN public.projects ON projects.id = builder_screens.project_id
    WHERE builder_screens.id = builder_components.screen_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete components in their projects"
ON public.builder_components FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.builder_screens
    JOIN public.projects ON projects.id = builder_screens.project_id
    WHERE builder_screens.id = builder_components.screen_id
    AND projects.user_id = auth.uid()
  )
);

-- Update RLS policies for builder_database_records to be project-based
DROP POLICY IF EXISTS "Allow all access to builder_database_records" ON public.builder_database_records;

CREATE POLICY "Users can view database records in their projects"
ON public.builder_database_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.builder_databases
    JOIN public.projects ON projects.id = builder_databases.project_id
    WHERE builder_databases.database_id = builder_database_records.database_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create database records in their projects"
ON public.builder_database_records FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.builder_databases
    JOIN public.projects ON projects.id = builder_databases.project_id
    WHERE builder_databases.database_id = builder_database_records.database_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update database records in their projects"
ON public.builder_database_records FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.builder_databases
    JOIN public.projects ON projects.id = builder_databases.project_id
    WHERE builder_databases.database_id = builder_database_records.database_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete database records in their projects"
ON public.builder_database_records FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.builder_databases
    JOIN public.projects ON projects.id = builder_databases.project_id
    WHERE builder_databases.database_id = builder_database_records.database_id
    AND projects.user_id = auth.uid()
  )
);