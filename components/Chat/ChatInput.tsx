import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChatInputProps {
  onSend: (message: string, mode: string) => void;
  isLoading: boolean;
  selectedMode: string;  // Add this prop
}

export function ChatInput({ onSend, isLoading, selectedMode }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message, selectedMode);  // Pass the selected mode
      setMessage('');
    }
  };

  // ... rest of the component remains the same
}

// ... styles remain the same