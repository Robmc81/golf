import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { UserProfileHeader } from '@/components/user-profile-header';
import { PostCard } from '@/components/post-card';
import { useAppStore } from '@/hooks/use-app-store';
import { colors } from '@/constants/colors';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUserById, getPostsByUserId, currentUser } = useAppStore();
  const router = useRouter();
  
  const user = getUserById(id);
  const userPosts = user ? getPostsByUserId(user.id) : [];
  const isCurrentUser = user?.id === currentUser.id;
  
  if (!user) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>User not found</Text>
      </View>
    );
  }

  const handleGoBack = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={() => (
          <UserProfileHeader 
            user={user} 
            isCurrentUser={isCurrentUser}
            onFollowPress={() => console.log('Follow pressed')}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyPostsText}>No posts yet</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  backButton: {
    padding: 8,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyPosts: {
    padding: 20,
    alignItems: 'center',
  },
  emptyPostsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});