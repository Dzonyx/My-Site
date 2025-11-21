-- Create function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'owner'
  )
$$;

-- Update RLS policies to allow owners to manage roles
DROP POLICY IF EXISTS Only admins can insert roles ON public.user_roles;
DROP POLICY IF EXISTS Only admins can update roles ON public.user_roles;
DROP POLICY IF EXISTS Only admins can delete roles ON public.user_roles;

CREATE POLICY Only owners can insert roles 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY Only owners can update roles 
ON public.user_roles 
FOR UPDATE 
USING (public.is_owner(auth.uid()));

CREATE POLICY Only owners can delete roles 
ON public.user_roles 
FOR DELETE 
USING (public.is_owner(auth.uid()));

-- Allow owners to view all user roles
CREATE POLICY Owners can view all roles
ON public.user_roles
FOR SELECT
USING (public.is_owner(auth.uid()) OR auth.uid() = user_id);