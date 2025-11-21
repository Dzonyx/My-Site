-- Create enum for platform types
CREATE TYPE public.platform_type AS ENUM ('android', 'ios', 'both');

-- Create enum for credential types
CREATE TYPE public.credential_type AS ENUM ('google_play', 'apple_app_store');

-- Create enum for publish job status
CREATE TYPE public.publish_job_status AS ENUM (
  'queued',
  'building',
  'uploading',
  'in_review',
  'published',
  'failed'
);

-- Create enum for event types
CREATE TYPE public.event_type AS ENUM ('info', 'warn', 'error');

-- Apps table
CREATE TABLE public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform platform_type NOT NULL,
  package_name TEXT,
  bundle_id TEXT,
  icon_url TEXT,
  screenshots JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Credentials table (encrypted storage)
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type credential_type NOT NULL,
  data_encrypted TEXT NOT NULL,
  account_email TEXT,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, type)
);

-- Publish jobs table
CREATE TABLE public.publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  target_track TEXT DEFAULT 'production',
  status publish_job_status DEFAULT 'queued',
  progress JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  artifact_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Publish events table (audit log)
CREATE TABLE public.publish_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publish_job_id UUID REFERENCES public.publish_jobs(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  message TEXT NOT NULL,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for apps
CREATE POLICY "Users can view their own apps"
  ON public.apps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own apps"
  ON public.apps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apps"
  ON public.apps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apps"
  ON public.apps FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for credentials
CREATE POLICY "Users can view their own credentials"
  ON public.credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credentials"
  ON public.credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON public.credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON public.credentials FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for publish_jobs
CREATE POLICY "Users can view their own publish jobs"
  ON public.publish_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own publish jobs"
  ON public.publish_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own publish jobs"
  ON public.publish_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for publish_events
CREATE POLICY "Users can view events for their publish jobs"
  ON public.publish_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.publish_jobs
      WHERE publish_jobs.id = publish_events.publish_job_id
      AND publish_jobs.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_apps_user_id ON public.apps(user_id);
CREATE INDEX idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX idx_publish_jobs_user_id ON public.publish_jobs(user_id);
CREATE INDEX idx_publish_jobs_app_id ON public.publish_jobs(app_id);
CREATE INDEX idx_publish_events_job_id ON public.publish_events(publish_job_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for apps updated_at
CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();