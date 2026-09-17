ALTER FUNCTION public.handle_card_requests_updated_at() SET search_path = public;
ALTER FUNCTION public.current_visitor_id() SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;