import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfileHeader } from '@/components/user-profile-header';
import { PostCard } from '@/components/post-card';
import { useAppStore } from '@/hooks/use-app-store';
import { colors } from '@/constants/colors';
import { Post } from '@/types';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

interface ProfileScreenProps {
  userId?: string;
}

/**
 * ProfileScreen component that displays a user's profile and posts
 * Features:
 * - User profile header with stats
 * - List of user's posts
 * - Pull to refresh
 * - Empty state
 * - Loading state
 * - Error handling
 */
export default function ProfileScreen({ userId }: ProfileScreenProps) {
  const router = useRouter();
  const { currentUser, getPostsByUserId, getUserById, logout } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the target user (current user or specified user)
  const targetUser = useMemo(() => {
    if (userId) {
      return getUserById(userId);
    }
    return currentUser;
  }, [userId, currentUser, getUserById]);

  // Memoize user posts to prevent unnecessary recalculations
  const userPosts = useMemo(() => {
    if (!targetUser) return [];
    return getPostsByUserId(targetUser.id);
  }, [targetUser?.id, getPostsByUserId]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      // TODO: Implement refresh logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Failed to refresh profile');
      console.error('Error refreshing profile:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle edit profile
  const handleEditProfile = useCallback(() => {
    router.push('/settings' as any);
  }, [router]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  // Memoize render functions to prevent unnecessary re-renders
  const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard post={item} />
  ), []);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const ListHeaderComponent = useCallback(() => {
    if (!targetUser) return null;
    return (
      <View>
        <UserProfileHeader 
          user={targetUser} 
          isCurrentUser={!userId} 
        />
        {!userId && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [targetUser, userId, handleLogout]);

  const ListEmptyComponent = useCallback(() => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="user-circle" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>
          {!userId ? "You haven't posted anything yet" : "No posts yet"}
        </Text>
        <Text style={styles.emptySubtext}>
          {!userId 
            ? "Share your golf experiences with your friends!"
            : "This user hasn't shared any golf experiences yet"}
        </Text>
      </View>
    );
  }, [error, userId, handleRefresh]);

  // Show loading state when target user is not available
  if (!targetUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={userPosts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
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
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.error,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});