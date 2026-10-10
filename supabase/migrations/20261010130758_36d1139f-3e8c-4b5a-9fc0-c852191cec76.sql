-- Anonymous chat visitors hit RLS policies that call public.has_role();
-- without EXECUTE permission Postgres raises "permission denied for function has_role".
-- has_role is SECURITY DEFINER and only reads user_roles, so granting EXECUTE is safe.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;