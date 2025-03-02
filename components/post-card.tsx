import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react-native';
import { Post, User } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/date-formatter';
import { useAppStore } from '@/hooks/use-app-store';

interface PostCardProps {
  post: Post;
  showActions?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, showActions = true }) => {
  const router = useRouter();
  const { getUserById, likePost, unlikePost, retweetPost, unretweetPost, likedPosts, retweetedPosts } = useAppStore();
  
  const user = getUserById(post.userId);
  if (!user) return null;
  
  const isLiked = likedPosts.includes(post.id);
  const isRetweeted = retweetedPosts.includes(post.id);
  
  const handleUserPress = () => {
    router.push(`/profile/${user.id}`);
  };
  
  const handlePostPress = () => {
    router.push(`/post/${post.id}`);
  };
  
  const handleLikePress = () => {
    if (isLiked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
  };
  
  const handleRetweetPress = () => {
    if (isRetweeted) {
      unretweetPost(post.id);
    } else {
      retweetPost(post.id);
    }
  };
  
  const handleCommentPress = () => {
    router.push(`/post/${post.id}`);
  };
  
  const handleSharePress = () => {
    // Share functionality would go here
    console.log('Share post:', post.id);
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePostPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <TouchableOpacity onPress={handleUserPress}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        </TouchableOpacity>
        
        <View style={styles.postContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleUserPress}>
              <Text style={styles.name}>{user.name}</Text>
            </TouchableOpacity>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>{formatDate(post.date)}</Text>
          </View>
          
          <Text style={styles.text}>{post.text}</Text>
          
          {post.course && (
            <View style={styles.courseContainer}>
              <Text style={styles.courseLabel}>Course:</Text>
              <Text style={styles.courseText}>{post.course}</Text>
            </View>
          )}
          
          {post.score !== undefined && post.par !== undefined && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Score: {post.score} ({post.score > post.par ? '+' : ''}{post.score - post.par})
              </Text>
            </View>
          )}
          
          {post.images && post.images.length > 0 && (
            <Image 
              source={{ uri: post.images[0] }} 
              style={styles.postImage} 
              resizeMode="cover"
            />
          )}
          
          {showActions && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleCommentPress}
              >
                <MessageCircle 
                  size={18} 
                  color={colors.textSecondary} 
                  style={styles.actionIcon} 
                />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleRetweetPress}
              >
                <Repeat2 
                  size={18} 
                  color={isRetweeted ? colors.success : colors.textSecondary} 
                  style={styles.actionIcon} 
                />
                <Text 
                  style={[
                    styles.actionText, 
                    isRetweeted && { color: colors.success }
                  ]}
                >
                  {post.retweets}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleLikePress}
              >
                <Heart 
                  size={18} 
                  color={isLiked ? colors.error : colors.textSecondary} 
                  fill={isLiked ? colors.error : 'transparent'}
                  style={styles.actionIcon} 
                />
                <Text 
                  style={[
                    styles.actionText, 
                    isLiked && { color: colors.error }
                  ]}
                >
                  {post.likes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleSharePress}
              >
                <Share 
                  size={18} 
                  color={colors.textSecondary} 
                  style={styles.actionIcon} 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  content: {
    flexDirection: 'row',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  postContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.text,
    marginRight: 4,
  },
  username: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  dot: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  text: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  courseContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  courseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 4,
  },
  courseText: {
    fontSize: 14,
    color: colors.text,
  },
  scoreContainer: {
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingRight: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});