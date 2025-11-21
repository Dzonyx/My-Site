-- Add is_home column to builder_screens table
ALTER TABLE public.builder_screens 
ADD COLUMN IF NOT EXISTS is_home boolean DEFAULT false;