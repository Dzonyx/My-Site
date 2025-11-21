-- Create verification codes table
CREATE TABLE public.verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert verification codes (for signup)
CREATE POLICY "Anyone can insert verification codes"
ON public.verification_codes FOR INSERT
WITH CHECK (true);

-- Allow users to view their own verification codes
CREATE POLICY "Users can view their own verification codes"
ON public.verification_codes FOR SELECT
USING (email = auth.email());

-- Allow users to update their own verification codes
CREATE POLICY "Users can update their own verification codes"
ON public.verification_codes FOR UPDATE
USING (email = auth.email());

-- Create index for faster lookups
CREATE INDEX idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX idx_verification_codes_expires_at ON public.verification_codes(expires_at);

-- Auto-delete expired codes after 15 minutes
CREATE OR REPLACE FUNCTION public.delete_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() - interval '15 minutes';
END;
$$;