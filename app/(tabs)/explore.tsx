import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Users, TrendingUp, Clock } from 'lucide-react-native';
import { PostCard } from '@/components/post-card';
import { useAppStore } from '@/hooks/use-app-store';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { Post, User } from '@/types';

type TabType = 'trending' | 'recent';

interface UserCardProps {
  user: User;
  onPress: (userId: string) => void;
}

interface TabProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

/**
 * Tab component for switching between trending and recent posts
 */
const Tab: React.FC<TabProps> = React.memo(({ icon, label, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, isActive && styles.activeTab]}
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    {icon}
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {label}
    </Text>
  </TouchableOpacity>
));

/**
 * UserCard component that displays a user's basic information
 */
const UserCard: React.FC<UserCardProps> = React.memo(({ user, onPress }) => (
  <TouchableOpacity 
    style={styles.userCard}
    onPress={() => onPress(user.id)}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
    <View style={styles.userInfo}>
      <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
      <Text style={styles.userUsername} numberOfLines={1}>@{user.username}</Text>
    </View>
  </TouchableOpacity>
));

/**
 * ExploreScreen component that displays trending and recent posts, and allows searching for users
 * Features:
 * - Search functionality for posts and users
 * - Trending and recent posts tabs
 * - User search results
 * - Pull to refresh
 * - Empty state
 * - Loading state
 * - Error handling
 */
export default function ExploreScreen() {
  const { posts, users, currentUser } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Memoize filtered posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.text.toLowerCase().includes(query) ||
      post.course?.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  // Memoize sorted posts
  const { trendingPosts, recentPosts } = useMemo(() => ({
    trendingPosts: [...filteredPosts].sort((a, b) => b.likes - a.likes),
    recentPosts: [...filteredPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  }), [filteredPosts]);

  // Memoize display posts based on active tab
  const displayPosts = useMemo(() => 
    activeTab === 'trending' ? trendingPosts : recentPosts,
    [activeTab, trendingPosts, recentPosts]
  );

  // Memoize filtered users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      // TODO: Implement refresh logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Failed to refresh content');
      console.error('Error refreshing content:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Memoize callback functions
  const handleUserPress = useCallback((userId: string) => {
    router.push(`/profile/${userId}` as any);
  }, [router]);

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setError(null);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setError(null);
  }, []);

  const renderUserItem = useCallback(({ item }: { item: User }) => (
    <UserCard user={item} onPress={handleUserPress} />
  ), [handleUserPress]);

  const renderPostItem = useCallback(({ item }: { item: Post }) => (
    <PostCard post={item} />
  ), []);

  const keyExtractor = useCallback((item: Post | User) => item.id, []);

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
        <Text style={styles.emptyText}>No posts found</Text>
        <Text style={styles.emptySubtext}>
          {searchQuery 
            ? "Try adjusting your search query"
            : "Check back later for new content"}
        </Text>
      </View>
    );
  }, [error, searchQuery, handleRefresh]);

  // Show loading state when currentUser is not available
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts, courses, players..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity 
            onPress={handleClearSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {searchQuery && filteredUsers.length > 0 && (
        <View style={styles.usersContainer}>
          <View style={styles.usersHeader}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={styles.usersHeaderText}>Players</Text>
          </View>
          <FlatList
            data={filteredUsers.slice(0, 3)} // Show only first 3 matches
            keyExtractor={keyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderUserItem}
            contentContainerStyle={styles.usersList}
          />
        </View>
      )}

      <View style={styles.tabsContainer}>
        <Tab
          icon={<TrendingUp size={16} color={activeTab === 'trending' ? colors.primary : colors.textSecondary} />}
          label="Trending"
          isActive={activeTab === 'trending'}
          onPress={() => handleTabPress('trending')}
        />
        <Tab
          icon={<Clock size={16} color={activeTab === 'recent' ? colors.primary : colors.textSecondary} />}
          label="Recent"
          isActive={activeTab === 'recent'}
          onPress={() => handleTabPress('recent')}
        />
      </View>

      <FlatList
        data={displayPosts}
        keyExtractor={keyExtractor}
        renderItem={renderPostItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    margin: 16,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  usersContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  usersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usersHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  usersList: {
    paddingRight: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 8,
    marginRight: 8,
    width: 180,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.background,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  activeTabText: {
    color: colors.primary,
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
    marginBottom: 8,
    textAlign: 'center',
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
});