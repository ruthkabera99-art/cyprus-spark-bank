-- Make has_role SECURITY INVOKER so it runs with the caller's permissions.
-- The 'Users can view own roles' RLS policy lets each signed-in user read their
-- own role rows, which is all the policies need (they always pass auth.uid()).
-- Anonymous callers see no rows, so it safely returns false for them, and the
-- function no longer needs definer rights exposed to anon.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;