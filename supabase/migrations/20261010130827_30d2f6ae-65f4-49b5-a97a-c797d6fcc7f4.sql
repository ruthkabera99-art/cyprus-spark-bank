-- Guard has_role behind CASE so anonymous visitors never execute it,
-- then revoke the anon EXECUTE grant again (keeps the security linter clean).

DROP POLICY IF EXISTS "View own conversations" ON public.chat_conversations;
CREATE POLICY "View own conversations"
  ON public.chat_conversations FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (CASE WHEN auth.uid() IS NOT NULL THEN public.has_role(auth.uid(), 'admin'::app_role) ELSE false END)
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
    (CASE WHEN auth.uid() IS NOT NULL THEN public.has_role(auth.uid(), 'admin'::app_role) ELSE false END)
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
          OR (CASE WHEN auth.uid() IS NOT NULL THEN public.has_role(auth.uid(), 'admin'::app_role) ELSE false END)
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
          (CASE WHEN auth.uid() IS NOT NULL THEN public.has_role(auth.uid(), 'admin'::app_role) ELSE false END)
          OR (auth.uid() IS NOT NULL AND c.user_id = auth.uid())
          OR (
            c.user_id IS NULL
            AND public.current_visitor_id() IS NOT NULL
            AND c.visitor_id = public.current_visitor_id()
          )
        )
    )
  );

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;