import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface ChatContextType {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  toggleChat: () => void;
  sendMessage: (text: string) => void;
  sendQuickAction: (action: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const addMessage = useCallback((text: string, sender: 'bot' | 'user') => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const simulateBotResponse = useCallback((userText: string) => {
    setIsTyping(true);
    
    // Simulate thinking time
    setTimeout(() => {
      let response = "I'm sorry, I'm still learning about that. How else can I help you today?";
      
      const text = userText.toLowerCase();
      if (text.includes('verify') || text.includes('batch')) {
        response = "To verify a batch, you can go to our 'Verify' page and enter your batch code or scan the QR code on your product.";
      } else if (text.includes('browse') || text.includes('herbs') || text.includes('buy')) {
        response = "You can explore our full collection of authentic herbs on the 'Browse Herbs' page. We have everything from Ashwagandha to Turmeric!";
      } else if (text.includes('track') || text.includes('order')) {
        response = "You can track your order status in your Customer Dashboard under the 'Verification History' or order tracking section.";
      } else if (text.includes('namaste') || text.includes('hello') || text.includes('hi')) {
        response = "Namaste! 🙏 How can I assist you with your Ayurvedic journey today?";
      }

      addMessage(response, 'bot');
      setIsTyping(false);
    }, 1500);
  }, [addMessage]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    addMessage(text, 'user');
    simulateBotResponse(text);
  }, [addMessage, simulateBotResponse]);

  const sendQuickAction = useCallback((action: string) => {
    addMessage(action, 'user');
    simulateBotResponse(action);
  }, [addMessage, simulateBotResponse]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      addMessage("Namaste 🙏\nI can help you verify herbs, trace batches, or answer Ayurvedic questions.", 'bot');
    }
  }, [messages.length, addMessage]);

  return (
    <ChatContext.Provider value={{ isOpen, messages, isTyping, toggleChat, sendMessage, sendQuickAction }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
