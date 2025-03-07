import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { ComposePostInput } from '@/components/compose-post-input';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';

/**
 * CreatePostScreen component that allows users to create new posts
 */
export default function CreatePostScreen() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);
  
  const handlePostCreated = useCallback(() => {
    router.replace('/(tabs)' as any);
  }, [router]);

  // Show loading state when currentUser is not available
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ComposePostInput onPostCreated={handlePostCreated} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    width: 24,
  },
}); 