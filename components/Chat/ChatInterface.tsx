import React, { useRef, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useChat } from '@/context/ChatContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { BlurView } from 'expo-blur';
import { Modal } from 'react-native';
import TypeWriter from 'react-native-typewriter-effect';

// Update the chat modes
const CHAT_MODES = [
  { id: 'default', label: 'Default', icon: 'person.fill' },
  { id: 'best_friend', label: 'Best Friend', icon: 'heart.fill' },
  { id: 'genius', label: 'Genius', icon: 'brain.head.profile' },
  { id: 'stoner', label: 'Stoner', icon: 'smoke.fill' },
];

const VOICE_OPTIONS = [
  { id: 'ara', label: 'Ara', description: 'Upbeat female voice' },
  { id: 'rex', label: 'Rex', description: 'Calm male voice' },
];

const ThinkingIndicator = () => (
  <View style={styles.thinkingContainer}>
    <TypeWriter
      textArray={['Thinking', 'Thinking.', 'Thinking..', 'Thinking...']}
      loop
      typingSpeed={100}
      deleteSpeed={0}
      style={styles.thinkingText}
    />
  </View>
);

const DeepSearchIndicator = () => (
  <View style={styles.deepSearchContainer}>
    <TypeWriter
      textArray={[
        'Searching the web',
        'Analyzing results',
        'Processing information',
        'Synthesizing response'
      ]}
      loop
      typingSpeed={50}
      deleteSpeed={30}
      style={styles.deepSearchText}
    />
    <ActivityIndicator color={Colors.light.tint} style={{ marginLeft: 10 }} />
  </View>
);

export const ChatInterface = () => {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0]);
  const { messages, sendMessage, isLoading } = useChat();
  const [inputText, setInputText] = useState('');
  const [activeMode, setActiveMode] = useState('chat');
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

  const handleModeChange = (modeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveMode(modeId);
  };

  const handleVoiceSelect = (voice: typeof VOICE_OPTIONS[0]) => {
    setSelectedVoice(voice);
    setShowVoiceModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* Voice Selection Modal */}
      <Modal
        visible={showVoiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <BlurView intensity={90} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)}>
                <ThemedText style={styles.modalCancel}>Cancel</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>Select Voice</ThemedText>
              <View style={{ width: 50 }} />
            </View>
            {VOICE_OPTIONS.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[
                  styles.voiceOption,
                  selectedVoice.id === voice.id && styles.selectedVoice,
                ]}
                onPress={() => handleVoiceSelect(voice)}
              >
                <View>
                  <ThemedText style={styles.voiceLabel}>{voice.label}</ThemedText>
                  <ThemedText style={styles.voiceDescription}>
                    {voice.description}
                  </ThemedText>
                </View>
                {selectedVoice.id === voice.id && (
                  <IconSymbol name="checkmark" size={24} color={Colors.light.tint} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </Modal>

      {/* Existing ScrollView for modes */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} 
        style={styles.modeScrollView}
        contentContainerStyle={styles.modeContainer}
      >
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setShowVoiceModal(true)}
        >
          <IconSymbol name="mic.fill" size={20} color={Colors.light.tint} />
          <ThemedText style={styles.voiceButtonText}>{selectedVoice.label}</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
        </TouchableOpacity>
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
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            { alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: item.role === 'user' ? Colors.light.tint : '#f0f0f0' }
          ]}>
            <ThemedText style={[
              styles.messageText,
              { color: item.role === 'user' ? '#fff' : '#000' }
            ]}>
              {item.content}
            </ThemedText>
            {item.status === 'sending' && (
              <ActivityIndicator 
                size="small" 
                color={item.role === 'user' ? '#fff' : Colors.light.tint} 
                style={styles.sendingIndicator}
              />
            )}
            {item.status === 'error' && (
              <ThemedText style={styles.errorText}>Error sending message</ThemedText>
            )}
          </View>
        )}
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

// Add these new styles
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Platform.select({ ios: 'rgba(255,255,255,0.9)', android: '#fff' }),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCancel: {
    fontSize: 17,
    color: Colors.light.tint,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  voiceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  selectedVoice: {
    backgroundColor: Platform.select({ ios: 'rgba(0,0,0,0.05)', android: '#f0f0f0' }),
  },
  voiceLabel: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  voiceDescription: {
    fontSize: 14,
    color: '#666',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.select({ ios: 'rgba(0,0,0,0.05)', android: '#f0f0f0' }),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  voiceButtonText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  thinkingContainer: {
    padding: 12,
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  thinkingText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontStyle: 'italic',
  },
  deepSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 5,
    backgroundColor: Platform.select({ ios: 'rgba(0,0,0,0.05)', android: '#f0f0f0' }),
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  deepSearchText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '500',
  },
});