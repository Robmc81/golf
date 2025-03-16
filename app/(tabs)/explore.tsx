import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Users } from 'lucide-react-native';
import { PostCard } from '@/components/post-card';
import { useAppStore } from '@/hooks/use-app-store';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const { posts, users } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  const router = useRouter();

  const filteredPosts = searchQuery
    ? posts.filter(post => 
        post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.course?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  const trendingPosts = [...filteredPosts].sort((a, b) => b.likes - a.likes);
  const recentPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const displayPosts = activeTab === 'trending' ? trendingPosts : recentPosts;

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts, courses, players..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
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
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.userCard}
                onPress={() => handleUserPress(item.id)}
              >
                <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userUsername}>@{item.username}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
          onPress={() => setActiveTab('trending')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'trending' && styles.activeTabText,
            ]}
          >
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'recent' && styles.activeTabText,
            ]}
          >
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
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
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginLeft: 4,
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
    fontWeight: 'bold',
    color: colors.text,
  },
  userUsername: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});