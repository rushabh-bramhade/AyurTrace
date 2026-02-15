import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minus, Bot, User, CheckCircle2 } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const ChatBot: React.FC = () => {
  const { isOpen, messages, isTyping, toggleChat, sendMessage, sendQuickAction } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-open after 10 seconds if it hasn't been opened yet
    const hasOpenedBefore = localStorage.getItem('chatbot_opened_before');
    if (!hasOpenedBefore) {
      const timer = setTimeout(() => {
        if (!isOpen) {
          toggleChat();
          localStorage.setItem('chatbot_opened_before', 'true');
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, toggleChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickActions = [
    { label: 'Verify a batch', action: 'How do I verify a batch?', route: '/verify' },
    { label: 'Browse herbs', action: 'Where can I see all herbs?', route: '/browse' },
    { label: 'Track my order', action: 'How can I track my order?', route: '/customer-dashboard' },
    { label: 'Talk to support', action: 'I need to speak with support', route: null },
  ];

  const handleQuickAction = (label: string, action: string, route: string | null) => {
    sendQuickAction(action);
    if (route) {
      // Small delay before navigating to let the user see their message
      setTimeout(() => navigate(route), 1000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[340px] max-w-[90vw] h-[500px] max-h-[70vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden glass-card"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                  <Bot size={24} />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-primary rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AyurTrace Assistant</h3>
                  <p className="text-[10px] opacity-80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary-foreground hover:bg-white/10" 
                    onClick={toggleChat}
                    aria-label="Minimize chat"
                  >
                    <Minus size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary-foreground hover:bg-white/10" 
                    onClick={toggleChat}
                    aria-label="Close chat"
                  >
                    <X size={18} />
                  </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.sender === 'user' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-sm leading-relaxed",
                      msg.sender === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none border border-border"
                    )}
                  >
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions (only if bot sent the last message) */}
              {messages.length > 0 && messages[messages.length - 1].sender === 'bot' && !isTyping && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.label, action.action, action.route)}
                      className="text-xs py-1.5 px-3 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
                />
                <Button
                  size="icon"
                  disabled={!inputValue.trim()}
                  onClick={handleSend}
                  className="rounded-xl shrink-0"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-colors duration-300 relative group",
          isOpen ? "bg-muted text-foreground border border-border" : "bg-primary text-primary-foreground"
        )}
        aria-label={isOpen ? "Close chat" : "Chat with us"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
            Chat with us
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-primary" />
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default ChatBot;
