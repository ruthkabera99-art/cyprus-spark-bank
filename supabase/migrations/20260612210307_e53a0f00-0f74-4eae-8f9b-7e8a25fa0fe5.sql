
-- ============================================
-- 1. Chat: replace anonymous loophole with visitor_id header check
-- ============================================

-- Helper to read visitor id from request header
CREATE OR REPLACE FUNCTION public.current_visitor_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(current_setting('request.headers', true)::json->>'x-visitor-id', '')
$$;

REVOKE EXECUTE ON FUNCTION public.current_visitor_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_visitor_id() TO anon, authenticated, service_role;

-- chat_conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins or visitors can update conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;

CREATE POLICY "View own conversations"
  ON public.chat_conversations FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      user_id IS NULL
      AND public.current_visitor_id() IS NOT NULL
      AND visitor_id = public.current_visitor_id()
    )
  );

CREATE POLICY "Update conversations"
  ON public.chat_conversations FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      user_id IS NULL
      AND public.current_visitor_id() IS NOT NULL
      AND visitor_id = public.current_visitor_id()
    )
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "Create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (
    -- Authenticated user creating their own
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    -- Or anonymous visitor with matching header
    OR (
      auth.uid() IS NULL
      AND user_id IS NULL
      AND public.current_visitor_id() IS NOT NULL
      AND visitor_id = public.current_visitor_id()
    )
  );

-- chat_messages
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;

CREATE POLICY "View messages in own conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND (
          (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR public.has_role(auth.uid(), 'admin'::app_role)
          OR (
            c.user_id IS NULL
            AND public.current_visitor_id() IS NOT NULL
            AND c.visitor_id = public.current_visitor_id()
          )
        )
    )
  );

CREATE POLICY "Insert messages in own conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND (
          public.has_role(auth.uid(), 'admin'::app_role)
          OR (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR (
            c.user_id IS NULL
            AND public.current_visitor_id() IS NOT NULL
            AND c.visitor_id = public.current_visitor_id()
          )
        )
    )
  );

-- ============================================
-- 2. Avatars storage: drop over-broad policies
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Note: avatars bucket remains public so image URLs continue working via CDN.
-- Owner-scoped INSERT/UPDATE policies ("Users can upload own avatar",
-- "Users can update own avatar") already exist and remain in effect.

-- ============================================
-- 3. Function hardening: search_path + revoke EXECUTE on trigger-only fns
-- ============================================
ALTER FUNCTION public.set_account_number() SET search_path = public;
ALTER FUNCTION public.generate_account_number() SET search_path = public;

-- These functions are only called by triggers; they don't need public EXECUTE
REVOKE EXECUTE ON FUNCTION public.set_account_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_account_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_conversation_on_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_recipient_transaction() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_loan_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_loan_payment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
