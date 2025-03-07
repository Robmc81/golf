import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '@/components/post-card';
import { useAppStore } from '@/hooks/use-app-store';
import { colors } from '@/constants/colors';
import { Users, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Post } from '@/types';
import { addEventListener, removeEventListener } from '@/utils/event-register';

/**
 * HomeScreen Component
 * Displays a feed of posts from the user's friends
 * Features:
 * - Pull-to-refresh functionality
 * - Empty state handling
 * - Navigation to friends screen
 * - Performance optimized list rendering
 */
export default function HomeScreen(): JSX.Element {
  const { getFriendsPosts, posts, fetchPosts } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [localPosts, setLocalPosts] = useState(posts);

  useEffect(() => {
    // Initial fetch
    fetchPosts();

    // Listen for refresh events
    const refreshListener = addEventListener('refreshFeed', (newPost?: Post) => {
      if (newPost) {
        // Update local posts immediately with the new post
        setLocalPosts(currentPosts => [newPost, ...currentPosts]);
      }
      // Then fetch all posts to ensure everything is in sync
      fetchPosts();
    });

    // Cleanup listener on unmount
    return () => {
      if (refreshListener) {
        removeEventListener(refreshListener);
      }
    };
  }, [fetchPosts]);

  // Update local posts when posts change
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  /**
   * Handles the refresh action
   * Fetches new posts from friends
   */
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await fetchPosts();
    } catch (err) {
      setError('Failed to refresh feed. Please try again.');
      console.error('Error refreshing feed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handles navigation to the friends screen
   */
  const handleFindFriendsPress = () => {
    router.push('/friends');
  };

  /**
   * Renders the header component for the feed
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <Users size={20} color={colors.primary} />
      <Text style={styles.headerText}>Your Friends Feed</Text>
    </View>
  );

  /**
   * Renders the empty state component
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No posts from your friends yet.</Text>
      <Text style={styles.emptySubtext}>Follow more golfers to see their updates!</Text>
      <TouchableOpacity 
        style={styles.findFriendsButton}
        onPress={handleFindFriendsPress}
      >
        <UserPlus size={16} color={colors.white} style={styles.buttonIcon} />
        <Text style={styles.findFriendsText}>Find Friends</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renders a single post item
   */
  const renderItem = ({ item }: { item: Post }) => (
    <PostCard post={item} />
  );

  /**
   * Renders the error state
   */
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={onRefresh}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={localPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={error ? renderError : renderEmpty}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  findFriendsButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  findFriendsText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});