import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, UserPlus, Repeat2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';
import { formatDate } from '@/utils/date-formatter';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'retweet';
  userId: string;
  postId?: string;
  timestamp: string;
  content?: string;
  read?: boolean;
}

interface NotificationItemProps {
  item: Notification;
  onPress?: (notification: Notification) => void;
}

interface NotificationContent {
  icon: React.ReactNode;
  content: React.ReactNode;
  color: string;
}

// Mock notifications data
const notifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    userId: '1',
    postId: '7',
    timestamp: '2023-04-06T10:30:00Z',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    userId: '2',
    postId: '7',
    timestamp: '2023-04-05T15:45:00Z',
    content: 'Great round! I love Pebble Beach too.',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    userId: '3',
    timestamp: '2023-04-04T09:20:00Z',
    read: true,
  },
  {
    id: '4',
    type: 'retweet',
    userId: '4',
    postId: '7',
    timestamp: '2023-04-03T14:10:00Z',
    read: true,
  },
  {
    id: '5',
    type: 'like',
    userId: '5',
    postId: '14',
    timestamp: '2023-04-02T11:05:00Z',
    read: true,
  },
  {
    id: '6',
    type: 'comment',
    userId: '6',
    postId: '14',
    timestamp: '2023-04-01T16:30:00Z',
    content: 'Your wedge game is always impressive!',
    read: true,
  },
  {
    id: '7',
    type: 'follow',
    userId: '8',
    timestamp: '2023-03-31T08:45:00Z',
    read: true,
  },
  {
    id: '8',
    type: 'retweet',
    userId: '9',
    postId: '14',
    timestamp: '2023-03-30T13:20:00Z',
    read: true,
  },
  {
    id: '9',
    type: 'like',
    userId: '10',
    postId: '14',
    timestamp: '2023-03-29T10:15:00Z',
    read: true,
  },
];

/**
 * NotificationItem component that renders a single notification
 */
const NotificationItem: React.FC<NotificationItemProps> = React.memo(({ item, onPress }) => {
  const { getUserById, posts } = useAppStore();
  const router = useRouter();
  const user = getUserById(item.userId);
  const post = useMemo(() => 
    item.postId ? posts.find(p => p.id === item.postId) : null,
    [item.postId, posts]
  );

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(item);
    } else if (item.postId) {
      router.push(`/post/${item.postId}`);
    } else if (item.userId) {
      router.push(`/profile/${item.userId}`);
    }
  }, [item, onPress, router]);

  if (!user) return null;

  const { icon, content, color }: NotificationContent = useMemo(() => {
    switch (item.type) {
      case 'like':
        return {
          icon: <Heart size={16} color={colors.error} fill={colors.error} />,
          content: <Text style={styles.notificationText}><Text style={styles.username}>{user.name}</Text> liked your post</Text>,
          color: colors.error
        };
      case 'comment':
        return {
          icon: <MessageCircle size={16} color={colors.primary} />,
          content: (
            <View>
              <Text style={styles.notificationText}>
                <Text style={styles.username}>{user.name}</Text> commented on your post
              </Text>
              {item.content && <Text style={styles.commentText}>"{item.content}"</Text>}
            </View>
          ),
          color: colors.primary
        };
      case 'follow':
        return {
          icon: <UserPlus size={16} color={colors.secondary} />,
          content: <Text style={styles.notificationText}><Text style={styles.username}>{user.name}</Text> followed you</Text>,
          color: colors.secondary
        };
      case 'retweet':
        return {
          icon: <Repeat2 size={16} color={colors.success} />,
          content: <Text style={styles.notificationText}><Text style={styles.username}>{user.name}</Text> retweeted your post</Text>,
          color: colors.success
        };
      default:
        return {
          icon: null,
          content: null,
          color: colors.text
        };
    }
  }, [item.type, user.name, item.content]);

  if (!icon || !content) return null;

  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <View style={styles.contentContainer}>
        {content}
        {post?.text && (
          <Text style={styles.postPreview} numberOfLines={1}>
            {post.text}
          </Text>
        )}
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );
});

/**
 * NotificationsScreen component that displays a list of notifications
 */
export default function NotificationsScreen() {
  const { currentUser } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement refresh logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const renderNotification = useCallback(({ item }: { item: Notification }) => (
    <NotificationItem item={item} />
  ), []);

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    []
  );

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={notifications}
        keyExtractor={keyExtractor}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        ListHeaderComponent={
          unreadCount > 0 ? (
            <View style={styles.unreadHeader}>
              <Text style={styles.unreadText}>{unreadCount} unread notifications</Text>
            </View>
          ) : null
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  unreadNotification: {
    backgroundColor: colors.card,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  username: {
    fontWeight: '600',
  },
  commentText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  postPreview: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  unreadHeader: {
    padding: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});