import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, UserCheck, UserPlus, Camera } from 'lucide-react-native';
import { User } from '@/types';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';
import { ProfilePictureModal } from './profile-picture-modal';

interface UserProfileHeaderProps {
  user: User;
  isCurrentUser?: boolean;
  onFollowPress?: () => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ 
  user, 
  isCurrentUser = false,
  onFollowPress 
}) => {
  const { currentUser, followUser, unfollowUser, updateProfilePicture } = useAppStore();
  const [profilePictureModalVisible, setProfilePictureModalVisible] = useState(false);
  
  const joinedDate = new Date(user.joinedDate);
  const formattedJoinDate = joinedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  
  const isFriend = currentUser.friends?.includes(user.id);
  
  const handleFollowPress = () => {
    if (isFriend) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
    
    if (onFollowPress) {
      onFollowPress();
    }
  };

  const handleProfilePicturePress = () => {
    if (isCurrentUser) {
      setProfilePictureModalVisible(true);
    }
  };

  const handleSelectProfilePicture = (uri: string) => {
    updateProfilePicture(uri);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: user.avatar }} 
          style={styles.avatar} 
        />
        {isCurrentUser && (
          <TouchableOpacity 
            style={styles.editAvatarButton}
            onPress={handleProfilePicturePress}
          >
            <Camera size={16} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
      </View>
      
      <Text style={styles.bio}>{user.bio}</Text>
      
      <View style={styles.details}>
        {user.location && (
          <View style={styles.detailItem}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{user.location}</Text>
          </View>
        )}
        
        <View style={styles.detailItem}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>Joined {formattedJoinDate}</Text>
        </View>
      </View>
      
      {user.handicap !== undefined && (
        <View style={styles.golfStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Handicap</Text>
            <Text style={styles.statValue}>{user.handicap}</Text>
          </View>
          
          {user.favoriteCourse && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Favorite Course</Text>
              <Text style={styles.statValue}>{user.favoriteCourse}</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.followInfo}>
        <TouchableOpacity style={styles.followItem}>
          <Text style={styles.followCount}>{user.following}</Text>
          <Text style={styles.followLabel}>Following</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.followItem}>
          <Text style={styles.followCount}>{user.followers}</Text>
          <Text style={styles.followLabel}>Followers</Text>
        </TouchableOpacity>
      </View>
      
      {!isCurrentUser && (
        <TouchableOpacity 
          style={[
            styles.followButton,
            isFriend && styles.followingButton
          ]}
          onPress={handleFollowPress}
        >
          {isFriend ? (
            <>
              <UserCheck size={16} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.followButtonText}>Following</Text>
            </>
          ) : (
            <>
              <UserPlus size={16} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.followButtonText}>Follow</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <ProfilePictureModal
        visible={profilePictureModalVisible}
        onClose={() => setProfilePictureModalVisible(false)}
        onSelectImage={handleSelectProfilePicture}
        currentImage={user.avatar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userInfo: {
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  username: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  golfStats: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    marginRight: 24,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  followInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  followItem: {
    flexDirection: 'row',
    marginRight: 20,
  },
  followCount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 4,
  },
  followLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  followButton: {
    backgroundColor: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: colors.primary,
  },
  buttonIcon: {
    marginRight: 6,
  },
  followButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});