import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '@/components/post-card';
import { useAppStore } from '@/hooks/use-app-store';
import { colors } from '@/constants/colors';
import { Users, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { getFriendsPosts } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const friendsPosts = getFriendsPosts();
  const router = useRouter();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, you would fetch new data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleFindFriendsPress = () => {
    router.push('/friends');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={friendsPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.headerText}>Your Friends Feed</Text>
          </View>
        )}
        ListEmptyComponent={() => (
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
        )}
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
});