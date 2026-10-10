-- Anonymous chat visitors still hit 42501 because chat policies reference
-- public.user_roles, whose own RLS policies call has_role(); Postgres checks
-- EXECUTE permission on has_role at plan time for every role that can run the
-- query. has_role is a read-only SECURITY DEFINER boolean check, so granting
-- EXECUTE to anon is the correct fix (same level as authenticated).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;