import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Generate or get visitor ID from localStorage
const getVisitorId = (): string => {
  const stored = localStorage.getItem('chat_visitor_id');
  if (stored) return stored;
  
  const newId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('chat_visitor_id', newId);
  return newId;
};

export interface ChatConversation {
  id: string;
  visitor_id: string;
  user_id: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'visitor' | 'admin';
  sender_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useVisitorChat() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [visitorId] = useState(getVisitorId);
  const [conversationId, setConversationId] = useState<string | null>(() => {
    return localStorage.getItem('chat_conversation_id');
  });

  // Get or create conversation
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['visitor-conversation', visitorId, user?.id],
    queryFn: async () => {
      // First try to find existing conversation
      let query = supabase
        .from('chat_conversations')
        .select('*')
        .eq('status', 'open');
      
      if (user?.id) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('visitor_id', visitorId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConversationId(data.id);
        localStorage.setItem('chat_conversation_id', data.id);
        return data as ChatConversation;
      }
      
      return null;
    },
  });

  // Get messages for conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!conversationId,
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  // Create conversation mutation
  const createConversation = useMutation({
    mutationFn: async ({ name, email }: { name?: string; email?: string }) => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          visitor_id: visitorId,
          user_id: user?.id || null,
          visitor_name: name || null,
          visitor_email: email || null,
          status: 'open',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ChatConversation;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      localStorage.setItem('chat_conversation_id', data.id);
      queryClient.invalidateQueries({ queryKey: ['visitor-conversation'] });
    },
    onError: () => {
      toast.error('Failed to start conversation');
    },
  });

  // Streaming reply state
  const [isAwaitingReply, setIsAwaitingReply] = useState(false);
  const [streamingReply, setStreamingReply] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const triggerAutoReply = useCallback(async (convId: string, visitorMessage: string) => {
    setIsAwaitingReply(true);
    setStreamingReply('');

    // Cancel any prior in-flight stream
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || anonKey;

      const res = await fetch(`${supabaseUrl}/functions/v1/chat-auto-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: anonKey,
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ conversation_id: convId, visitor_message: visitorMessage }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error(`Stream failed: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            if (json.delta) {
              accumulated += json.delta;
              setStreamingReply(accumulated);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        console.error('Auto-reply stream failed:', err);
      }
    } finally {
      setIsAwaitingReply(false);
      setStreamingReply('');
      // Real-time subscription will fetch the persisted message
      queryClient.invalidateQueries({ queryKey: ['chat-messages', convId] });
    }
  }, [queryClient]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ message, convId }: { message: string; convId?: string }) => {
      const targetConvId = convId || conversationId;
      if (!targetConvId) throw new Error('No conversation');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: targetConvId,
          sender_type: 'visitor',
          sender_id: user?.id || visitorId,
          message,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;
      return { message: data as ChatMessage, convId: targetConvId, text: message };
    },
    onSuccess: ({ convId, text }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
      // Trigger AI streaming reply instantly
      triggerAutoReply(convId, text);
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Cleanup in-flight stream on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Subscribe to new messages in real-time
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return {
    conversation,
    messages,
    isLoading: conversationLoading || messagesLoading,
    isAwaitingReply,
    createConversation,
    sendMessage,
    visitorId,
  };
}

// Admin chat hooks
export function useAdminChats() {
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['admin-chat-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data as ChatConversation[];
    },
    refetchInterval: 5000, // Poll for new conversations
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-unread-messages'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_type', 'visitor')
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 5000,
  });

  // Subscribe to new conversations
  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-unread-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    conversations,
    unreadCount,
    isLoading,
  };
}

export function useAdminChatMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-chat-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  // Mark messages as read
  const markAsRead = useMutation({
    mutationFn: async () => {
      if (!conversationId) return;
      
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'visitor')
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-unread-messages'] });
    },
  });

  // Send reply
  const sendReply = useMutation({
    mutationFn: async ({ message, adminId }: { message: string; adminId: string }) => {
      if (!conversationId) throw new Error('No conversation selected');
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'admin',
          sender_id: adminId,
          message,
          is_read: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', conversationId] });
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  // Close conversation
  const closeConversation = useMutation({
    mutationFn: async () => {
      if (!conversationId) throw new Error('No conversation selected');
      
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] });
      toast.success('Conversation closed');
    },
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`admin-chat-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return {
    messages,
    isLoading,
    markAsRead,
    sendReply,
    closeConversation,
  };
}
