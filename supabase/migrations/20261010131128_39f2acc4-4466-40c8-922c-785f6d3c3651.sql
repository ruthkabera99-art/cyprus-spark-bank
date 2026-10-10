-- Replace has_role() calls in chat policies with an inline user_roles check.
-- Reason: Postgres checks EXECUTE permission on functions referenced in a policy
-- at plan time, so anonymous visitors (no EXECUTE on has_role) got 42501 even
-- though the admin branch never applies to them. The inline EXISTS reads only
-- the caller's own role rows (allowed by the 'Users can view own roles' policy)
-- and returns false for anonymous visitors.

DROP POLICY IF EXISTS "View own conversations" ON public.chat_conversations;
CREATE POLICY "View own conversations"
  ON public.chat_conversations FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
    ))
    OR (
      user_id IS NULL
      AND public.current_visitor_id() IS NOT NULL
      AND visitor_id = public.current_visitor_id()
    )
  );

DROP POLICY IF EXISTS "Update conversations" ON public.chat_conversations;
CREATE POLICY "Update conversations"
  ON public.chat_conversations FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
    ))
    OR (
      user_id IS NULL
      AND public.current_visitor_id() IS NOT NULL
      AND visitor_id = public.current_visitor_id()
    )
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "View messages in own conversations" ON public.chat_messages;
CREATE POLICY "View messages in own conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND (
          (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
          ))
          OR (
            c.user_id IS NULL
            AND public.current_visitor_id() IS NOT NULL
            AND c.visitor_id = public.current_visitor_id()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Insert messages in own conversations" ON public.chat_messages;
CREATE POLICY "Insert messages in own conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND (
          (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
          ))
          OR (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR (
            c.user_id IS NULL
            AND public.current_visitor_id() IS NOT NULL
            AND c.visitor_id = public.current_visitor_id()
          )
        )
    )
  );

DROP POLICY IF EXISTS "Admins can update messages" ON public.chat_messages;
CREATE POLICY "Admins can update messages"
  ON public.chat_messages FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
    )
  );