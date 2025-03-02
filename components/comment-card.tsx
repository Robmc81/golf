import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Comment } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/date-formatter';
import { useAppStore } from '@/hooks/use-app-store';

interface CommentCardProps {
  comment: Comment;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const { getUserById } = useAppStore();
  const user = getUserById(comment.userId);
  
  if (!user) return null;
  
  return (
    <View style={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.date}>{formatDate(comment.date)}</Text>
        </View>
        
        <Text style={styles.text}>{comment.text}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={16} color={colors.textSecondary} />
            <Text style={styles.actionText}>{comment.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
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
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  username: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 4,
  },
  dot: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 4,
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});