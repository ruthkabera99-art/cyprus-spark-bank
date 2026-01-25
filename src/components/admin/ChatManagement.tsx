import { useState, useRef, useEffect } from 'react';
import { useAdminChats, useAdminChatMessages, ChatConversation } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  User, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function ChatManagement() {
  const { user } = useAuth();
  const { conversations, unreadCount, isLoading: conversationsLoading } = useAdminChats();
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { 
    messages, 
    isLoading: messagesLoading, 
    markAsRead, 
    sendReply,
    closeConversation 
  } = useAdminChatMessages(selectedConversation?.id || null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when selecting conversation
  useEffect(() => {
    if (selectedConversation) {
      markAsRead.mutate();
    }
  }, [selectedConversation?.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !user) return;

    await sendReply.mutateAsync({ 
      message: replyMessage.trim(),
      adminId: user.id
    });
    setReplyMessage('');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, h:mm a');
  };

  const getUnreadCountForConversation = (convId: string) => {
    // This is a simplified count - in production you might want to track this per conversation
    return messages.filter(m => m.sender_type === 'visitor' && !m.is_read).length;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Conversations
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <MessageCircle className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                      selectedConversation?.id === conv.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">
                            {conv.visitor_name || 'Anonymous'}
                          </span>
                        </div>
                        {conv.visitor_email && (
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">
                              {conv.visitor_email}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {conv.last_message_at 
                              ? formatTime(conv.last_message_at)
                              : formatTime(conv.created_at)
                            }
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={conv.status === 'open' ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {conv.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3 border-b">
          {selectedConversation ? (
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedConversation.visitor_name || 'Anonymous'}
                </CardTitle>
                {selectedConversation.visitor_email && (
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.visitor_email}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedConversation.status === 'open' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => closeConversation.mutate()}
                    disabled={closeConversation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                ) : (
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Closed
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <CardTitle className="text-lg text-muted-foreground">
              Select a conversation
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[500px]">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {!selectedConversation ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-3 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            ) : messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageCircle className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">No messages in this conversation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[70%] rounded-lg p-3",
                      msg.sender_type === 'admin'
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "mr-auto bg-muted"
                    )}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                    <span 
                      className={cn(
                        "text-xs mt-1",
                        msg.sender_type === 'admin' 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      )}
                    >
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Reply Input */}
          {selectedConversation && selectedConversation.status === 'open' && (
            <form 
              onSubmit={handleSendReply}
              className="border-t border-border p-4 flex gap-2"
            >
              <Input
                placeholder="Type your reply..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                disabled={sendReply.isPending}
              />
              <Button 
                type="submit" 
                disabled={!replyMessage.trim() || sendReply.isPending}
              >
                {sendReply.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
