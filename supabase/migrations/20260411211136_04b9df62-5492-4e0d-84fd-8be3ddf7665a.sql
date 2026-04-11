
-- Drop and recreate SELECT policy for chat_conversations to support anonymous visitors
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
CREATE POLICY "Users can view own conversations"
ON public.chat_conversations
FOR SELECT
USING (
  (user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

-- Also allow anonymous visitors to update their own conversations (e.g. set user_id later)
DROP POLICY IF EXISTS "Admins can update conversations" ON public.chat_conversations;
CREATE POLICY "Admins or visitors can update conversations"
ON public.chat_conversations
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (user_id IS NULL AND auth.uid() IS NULL)
);

-- Fix chat_messages SELECT policy for anonymous visitors
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages in own conversations"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = chat_messages.conversation_id
    AND (
      (c.user_id = auth.uid())
      OR has_role(auth.uid(), 'admin'::app_role)
      OR (c.user_id IS NULL AND auth.uid() IS NULL)
    )
  )
);
