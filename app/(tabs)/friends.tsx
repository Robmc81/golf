import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserCheck, UserPlus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';
import { User } from '@/types';

/**
 * FriendsScreen Component
 * Displays a list of friends and suggested users to follow
 * Features:
 * - Friend list with follow/unfollow functionality
 * - Suggested users section
 * - Profile navigation
 * - Performance optimized list rendering
 */
export default function FriendsScreen(): JSX.Element {
  const { users, currentUser, followUser, unfollowUser } = useAppStore();
  const router = useRouter();
  
  // Get friends of current user
  const friendIds = useMemo(() => currentUser!.friends || [], [currentUser!.friends]);
  const friends = useMemo(() => 
    users.filter(user => friendIds.includes(user.id)),
    [users, friendIds]
  );
  
  // Get suggested users (non-friends)
  const suggestedUsers = useMemo(() => 
    users
      .filter(user => user.id !== currentUser!.id && !friendIds.includes(user.id))
      .slice(0, 5), // Limit to 5 suggestions
    [users, currentUser!.id, friendIds]
  );

  /**
   * Handles navigation to user profile
   */
  const handleUserPress = useCallback((userId: string) => {
    router.push(`/profile/${userId}`);
  }, [router]);

  /**
   * Handles follow/unfollow action
   */
  const handleFollowPress = useCallback((userId: string) => {
    const isFriend = friendIds.includes(userId);
    if (isFriend) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  }, [friendIds, followUser, unfollowUser]);
  
  /**
   * Renders a friend item
   */
  const renderFriendItem = useCallback(({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => handleUserPress(item.id)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
        <Text style={styles.userBio} numberOfLines={2}>{item.bio}</Text>
      </View>
      <TouchableOpacity 
        style={styles.followingButton}
        onPress={() => handleFollowPress(item.id)}
      >
        <UserCheck size={16} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleUserPress, handleFollowPress]);
  
  /**
   * Renders a suggested user item
   */
  const renderSuggestedItem = useCallback(({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => handleUserPress(item.id)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
        <Text style={styles.userBio} numberOfLines={2}>{item.bio}</Text>
      </View>
      <TouchableOpacity 
        style={styles.followButton}
        onPress={() => handleFollowPress(item.id)}
      >
        <UserPlus size={16} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleUserPress, handleFollowPress]);

  /**
   * Renders the header component
   */
  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.sectionTitle}>Your Friends</Text>
      <Text style={styles.sectionSubtitle}>
        {friends.length} {friends.length === 1 ? 'golfer' : 'golfers'} you follow
      </Text>
    </View>
  ), [friends.length]);

  /**
   * Renders the empty state component
   */
  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>You're not following any golfers yet</Text>
      <Text style={styles.emptySubtext}>Follow some golfers to see their updates!</Text>
    </View>
  ), []);

  /**
   * Renders the suggested users section
   */
  const renderSuggestedSection = useCallback(() => (
    <>
      <View style={styles.divider} />
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Suggested Golfers</Text>
        <Text style={styles.sectionSubtitle}>
          Players you might want to follow
        </Text>
      </View>
      <FlatList
        data={suggestedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderSuggestedItem}
        scrollEnabled={false}
      />
    </>
  ), [renderSuggestedItem, suggestedUsers]);
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {!currentUser ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderSuggestedSection}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  userUsername: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  followButton: {
    backgroundColor: colors.text,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  followingButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
  },
  divider: {
    height: 8,
    backgroundColor: colors.card,
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});