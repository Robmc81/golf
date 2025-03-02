import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, UserPlus, Repeat2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';
import { formatDate } from '@/utils/date-formatter';

// Mock notifications data
const notifications = [
  {
    id: '1',
    type: 'like',
    userId: '1',
    postId: '7',
    timestamp: '2023-04-06T10:30:00Z',
  },
  {
    id: '2',
    type: 'comment',
    userId: '2',
    postId: '7',
    timestamp: '2023-04-05T15:45:00Z',
    content: 'Great round! I love Pebble Beach too.',
  },
  {
    id: '3',
    type: 'follow',
    userId: '3',
    timestamp: '2023-04-04T09:20:00Z',
  },
  {
    id: '4',
    type: 'retweet',
    userId: '4',
    postId: '7',
    timestamp: '2023-04-03T14:10:00Z',
  },
  {
    id: '5',
    type: 'like',
    userId: '5',
    postId: '14',
    timestamp: '2023-04-02T11:05:00Z',
  },
  {
    id: '6',
    type: 'comment',
    userId: '6',
    postId: '14',
    timestamp: '2023-04-01T16:30:00Z',
    content: 'Your wedge game is always impressive!',
  },
  {
    id: '7',
    type: 'follow',
    userId: '8',
    timestamp: '2023-03-31T08:45:00Z',
  },
  {
    id: '8',
    type: 'retweet',
    userId: '9',
    postId: '14',
    timestamp: '2023-03-30T13:20:00Z',
  },
  {
    id: '9',
    type: 'like',
    userId: '10',
    postId: '14',
    timestamp: '2023-03-29T10:15:00Z',
  },
];

export default function NotificationsScreen() {
  const { getUserById, posts } = useAppStore();

  const renderNotification = ({ item }) => {
    const user = getUserById(item.userId);
    if (!user) return null;

    const post = item.postId ? posts.find(p => p.id === item.postId) : null;
    
    let icon;
    let content;
    let color;
    
    switch (item.type) {
      case 'like':
        icon = <Heart size={16} color={colors.error} fill={colors.error} />;
        content = <Text style={styles.notificationText}><Text style={styles.username}>{user.name}</Text> liked your post</Text>;
        color = colors.error;
        break;
      case 'comment':
        icon = <MessageCircle size={16} color={colors.primary} />;
        content = (
          <View>
            <Text style={styles.notificationText}>
              <Text style={styles.username}>{user.name}</Text> commented on your post
            </Text>
            {item.content && <Text style={styles.commentText}>"{item.content}"</Text>}
          </View>
        );
        color = colors.primary;
        break;
      case 'follow':
        icon = <UserPlus size={16} color={colors.secondary} />;
        content = <Text style={styles.notificationText}><Text style={styles.username}>{user.name}</Text> followed you</Text>;
        color = colors.secondary;
        break;
      case 'retweet':
        icon = <Repeat2 size={16} color={colors.success} />;
        content = <Text style={styles.notificationText}><Text style={styles.username}>{user.name}</Text> retweeted your post</Text>;
        color = colors.success;
        break;
      default:
        return null;
    }

    return (
      <TouchableOpacity style={styles.notificationItem}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.contentContainer}>
          {content}
          {post && post.text && (
            <Text style={styles.postPreview} numberOfLines={1}>
              {post.text}
            </Text>
          )}
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
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
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  postPreview: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 8,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});