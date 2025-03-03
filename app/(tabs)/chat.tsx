import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ChatInterface } from '@/components/Chat/ChatInterface';
import { ChatProvider } from '@/context/ChatContext';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ChatScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <ChatProvider>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            headerTitle: () => (
              <ThemedText style={styles.headerTitle}>Grok</ThemedText>
            ),
            headerShadowVisible: false,
            headerStyle: { backgroundColor },
          }}
        />
        <View style={styles.chatContainer}>
          <ChatInterface />
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    </ChatProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});