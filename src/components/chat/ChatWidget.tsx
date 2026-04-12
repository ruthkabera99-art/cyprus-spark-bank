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
  const [visitorPhone, setVisitorPhone] = useState('');
  const [showNameForm, setShowNameForm] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { 
    conversation, 
    messages, 
    isLoading, 
    isAwaitingReply,
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
      {/* WhatsApp-style Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 left-6 z-50 w-[60px] h-[60px] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
          isOpen
            ? "bg-[hsl(0,0%,40%)]"
            : "bg-[hsl(142,70%,41%)] animate-bounce"
        )}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white">
            <path d="M16.004 3.2C8.93 3.2 3.2 8.73 3.2 15.56c0 2.18.59 4.3 1.7 6.16L3.2 28.8l7.32-1.93a13.1 13.1 0 0 0 5.48 1.21h.01c7.07 0 12.8-5.53 12.8-12.36S23.08 3.2 16 3.2Zm0 22.56a10.9 10.9 0 0 1-5.22-1.34l-.37-.22-3.88 1.02 1.04-3.77-.24-.39A10.38 10.38 0 0 1 5.6 15.56c0-5.74 4.86-10.4 10.83-10.4 5.96 0 10.37 4.66 10.37 10.4 0 5.74-4.81 10.4-10.77 10.4Zm5.94-7.78c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.74.17-.22.32-.85 1.06-1.04 1.28-.19.22-.39.24-.72.08-.33-.16-1.39-.51-2.64-1.63-.98-.87-1.63-1.94-1.83-2.27-.19-.33-.02-.5.14-.67.15-.15.33-.39.49-.59.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.17-.74-1.77-1.01-2.42-.27-.63-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41s-1.14 1.11-1.14 2.71 1.17 3.15 1.33 3.36c.17.22 2.3 3.52 5.58 4.93.78.34 1.39.54 1.86.69.78.25 1.49.21 2.06.13.63-.09 1.93-.79 2.2-1.55.27-.77.27-1.42.19-1.55-.08-.14-.3-.22-.63-.38Z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-scale-in">
          {/* WhatsApp-style Header */}
          <div className="bg-[hsl(142,70%,41%)] text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
                <path d="M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 17a9 9 0 0 1-7-3.36C9.03 19.21 14 18 16 18s6.97 1.21 7 3.64A9 9 0 0 1 16 25Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">MorganFinance Support</h3>
              <p className="text-xs text-white/80">Online · Replies within minutes</p>
            </div>
          </div>

          {/* Chat Content */}
          {showNameForm && !conversation ? (
            // Name/Email Form
            <form onSubmit={handleStartChat} className="p-4 space-y-3">
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
              <Input
                type="tel"
                placeholder="Your phone number (optional)"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
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
                        {msg.sender_type === 'admin' && (
                          <span className="text-[10px] font-medium text-muted-foreground mb-1">
                            MorganFinance Support
                          </span>
                        )}
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
                    {/* Typing indicator */}
                    {isAwaitingReply && (
                      <div className="mr-auto bg-muted rounded-lg p-3 max-w-[80%] animate-fade-in">
                        <span className="text-[10px] font-medium text-muted-foreground mb-1 block">
                          MorganFinance Support
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
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
