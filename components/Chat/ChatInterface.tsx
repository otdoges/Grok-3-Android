import React, { useRef, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useChat } from '@/context/ChatContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define available modes
const CHAT_MODES = [
  { id: 'chat', label: 'Chat', icon: 'bubble.left.fill' },
  { id: 'image', label: 'Create Image', icon: 'photo.fill' },
  { id: 'search', label: 'DeepSearch', icon: 'magnifyingglass' },
  { id: 'study', label: 'Study', icon: 'book.fill' },
];

const ChatMessage = ({ message }: { message: { role: string; content: string; status?: 'sending' | 'error'; id: string } }) => {
  const backgroundColor = useThemeColor(
    { light: message.role === 'user' ? '#E8E8ED' : '#FFFFFF', dark: message.role === 'user' ? '#2C2C2E' : '#1C1C1E' },
    'background'
  );
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[
      styles.messageContainer, 
      { 
        backgroundColor,
        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
        borderTopRightRadius: message.role === 'user' ? 4 : 20,
        borderTopLeftRadius: message.role === 'user' ? 20 : 4,
      }
    ]}>
      <ThemedText style={[styles.messageText, { color: textColor }]}>{message.content}</ThemedText>
      {message.status === 'sending' && (
        <ActivityIndicator size="small" color={Colors.light.tint} style={styles.sendingIndicator} />
      )}
      {message.status === 'error' && (
        <ThemedText style={styles.errorText}>Error sending message</ThemedText>
      )}
    </View>
  );
};

export const ChatInterface = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const [inputText, setInputText] = useState('');
  const [activeMode, setActiveMode] = useState('chat');
  const flatListRef = useRef(null);

  const handleSend = async () => {
    if (inputText.trim() && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const messageText = inputText;
      setInputText('');
      await sendMessage(messageText, activeMode);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      (flatListRef.current as any).scrollToEnd({ animated: true });
    }
  };

  const handleModeChange = (modeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveMode(modeId);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      {/* Mode selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.modeScrollView}
        contentContainerStyle={styles.modeContainer}
      >
        {CHAT_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeButton,
              activeMode === mode.id && styles.activeModeButton
            ]}
            onPress={() => handleModeChange(mode.id)}
          >
            <ThemedText 
              style={[
                styles.modeButtonText,
                activeMode === mode.id && styles.activeModeText
              ]}
            >
              {mode.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item as { role: string; content: string; status?: 'sending' | 'error'; id: string }} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />
      
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={`Ask anything...`}
          placeholderTextColor="#666"
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.light.tint} style={styles.sendButton} />
        ) : (
          <TouchableOpacity 
            onPress={handleSend}
            style={[styles.sendButtonContainer, { opacity: inputText.trim() ? 1 : 0.5 }]}
            disabled={!inputText.trim()}
          >
            <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeScrollView: {
    maxHeight: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  modeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeModeButton: {
    backgroundColor: Colors.light.tint,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeModeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  messageList: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 20,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    padding: 10,
  },
  sendButtonContainer: {
    backgroundColor: Colors.light.tint,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendingIndicator: {
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});