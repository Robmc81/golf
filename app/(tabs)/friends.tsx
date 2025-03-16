import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserCheck, UserPlus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';

interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
}

export default function FriendsScreen() {
  const { users, currentUser, followUser, unfollowUser } = useAppStore();
  const router = useRouter();
  
  if (!currentUser) return null;
  
  // Get friends of current user
  const friendIds = currentUser.friends || [];
  const friends = users.filter(user => friendIds.includes(user.id));
  
  // Get suggested users (non-friends)
  const suggestedUsers = users.filter(user => 
    user.id !== currentUser.id && !friendIds.includes(user.id)
  ).slice(0, 5); // Limit to 5 suggestions
  
  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleFollowPress = (userId: string) => {
    const isFriend = friendIds.includes(userId);
    if (isFriend) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };
  
  const renderFriendItem = ({ item }: { item: User }) => (
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
  );
  
  const renderSuggestedItem = ({ item }: { item: User }) => (
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
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendItem}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Your Friends</Text>
            <Text style={styles.sectionSubtitle}>
              {friends.length} {friends.length === 1 ? 'golfer' : 'golfers'} you follow
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You're not following any golfers yet</Text>
            <Text style={styles.emptySubtext}>Follow some golfers to see their updates!</Text>
          </View>
        )}
        ListFooterComponent={() => (
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
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
});