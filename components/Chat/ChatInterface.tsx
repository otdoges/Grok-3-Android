import React, { useRef, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useChat } from '@/context/ChatContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

const ChatMessage = ({ message }: { message: { role: string; content: string; status?: 'sending' | 'error'; id: string } }) => {
  const backgroundColor = useThemeColor(
    { light: message.role === 'user' ? '#E8E8ED' : '#FFFFFF', dark: message.role === 'user' ? '#2C2C2E' : '#1C1C1E' },
    'background'
  );
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.messageContainer, { backgroundColor }]}>
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
  const flatListRef = useRef(null);

  const handleSend = async () => {
    if (inputText.trim() && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const messageText = inputText;
      setInputText('');
      await sendMessage(messageText);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      (flatListRef.current as any).scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message Grok..."
          placeholderTextColor="#666"
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.light.tint} style={styles.sendButton} />
        ) : (
          <ThemedText
            onPress={handleSend}
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
          >
            Send
          </ThemedText>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
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
    backgroundColor: Platform.OS === 'ios' ? '#f0f0f0' : Platform.select({
      light: '#f0f0f0',
      dark: '#333333'
    }),
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
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