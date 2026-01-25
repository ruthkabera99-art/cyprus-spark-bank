import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVisitorChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [showNameForm, setShowNameForm] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { 
    conversation, 
    messages, 
    isLoading, 
    createConversation, 
    sendMessage 
  } = useVisitorChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // If user is logged in or conversation exists, skip name form
  useEffect(() => {
    if (user || conversation) {
      setShowNameForm(false);
    }
  }, [user, conversation]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;
    
    await createConversation.mutateAsync({ 
      name: visitorName, 
      email: visitorEmail || undefined 
    });
    setShowNameForm(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    if (!conversation) {
      // Create conversation first, then send message
      const newConv = await createConversation.mutateAsync({
        name: user?.email || 'Visitor',
        email: user?.email,
      });
      await sendMessage.mutateAsync({ message: message.trim(), convId: newConv.id });
    } else {
      await sendMessage.mutateAsync({ message: message.trim() });
    }
    
    setMessage('');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
          !isOpen && "animate-bounce"
        )}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4">
            <h3 className="font-semibold">Chat Support</h3>
            <p className="text-sm opacity-90">We typically reply within minutes</p>
          </div>

          {/* Chat Content */}
          {showNameForm && !conversation ? (
            // Name/Email Form
            <form onSubmit={handleStartChat} className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Please provide your details to start chatting:
              </p>
              <Input
                placeholder="Your name *"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Your email (optional)"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={createConversation.isPending}
              >
                {createConversation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Start Chat'
                )}
              </Button>
            </form>
          ) : (
            <>
              {/* Messages Area */}
              <ScrollArea className="h-72 p-4" ref={scrollRef}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <MessageCircle className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Send a message to start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[80%] rounded-lg p-3",
                          msg.sender_type === 'visitor'
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "mr-auto bg-muted"
                        )}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                        <span 
                          className={cn(
                            "text-xs mt-1",
                            msg.sender_type === 'visitor' 
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

              {/* Message Input */}
              <form 
                onSubmit={handleSendMessage}
                className="border-t border-border p-3 flex gap-2"
              >
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendMessage.isPending}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!message.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
