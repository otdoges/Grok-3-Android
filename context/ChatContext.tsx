import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatContextType, ChatMessage } from '@/types/chat';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
// Import API key from environment variables
// You'll need to set up environment variables properly for your platform
// For React Native, consider using react-native-dotenv or react-native-config
// TODO: Replace with your actual API key management solution
const GROK_API_KEY = process.env.GROK_API_KEY || '';

// Create a context for the chat functionality
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Encryption key - in a real app, this should be securely stored or generated
const ENCRYPTION_KEY = 'grok-secure-key-2024';

// Encrypt message content
const encryptMessage = (content: string): string => {
  return CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString();
};

// Decrypt message content
const decryptMessage = (encryptedContent: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Provider component that wraps the app and makes chat context available
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from storage on initial load
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const savedMessages = await SecureStore.getItemAsync('chat-messages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, []);

  // Save messages to storage whenever they change
  useEffect(() => {
    const saveMessages = async () => {
      try {
        await SecureStore.setItemAsync('chat-messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save messages:', error);
      }
    };

    if (messages.length > 0) {
      saveMessages();
    }
  }, [messages]);

  // Send a message to the Grok API
  // Update the sendMessage function to accept a mode parameter
  const sendMessage = async (content: string, mode = 'chat'): Promise<void> => {
    if (!content.trim()) return;
  
    // Create a new user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      status: 'sending',
    };
  
    // Add the user message to the chat
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
  
    try {
      // Encrypt the message before sending to API
      const encryptedContent = encryptMessage(content);
      
      // Call the x.ai API
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: encryptedContent }
          ],
          model: 'grok-1',
          mode: mode, // Add the mode parameter
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorData}`);
      }
    
      const data = await response.json();
      
      // Update user message status to sent
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      // Add the assistant's response
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to Grok API:', error instanceof Error ? error.message : String(error));
      
      // Update user message status to error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all messages
  const clearMessages = async () => {
    setMessages([]);
    try {
      await SecureStore.deleteItemAsync('chat-messages');
    } catch (error) {
      console.error('Failed to clear messages from storage:', error);
    }
  };

  const value = {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={value as ChatContextType}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};