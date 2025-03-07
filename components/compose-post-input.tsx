import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { MapPin, X, Flag, Image as ImageIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';
import * as ImagePicker from 'expo-image-picker';
import { emitEvent } from '@/utils/event-register';

interface ComposePostInputProps {
  onPostCreated?: () => void;
}

export const ComposePostInput: React.FC<ComposePostInputProps> = ({ onPostCreated }) => {
  const { currentUser, createPost } = useAppStore();
  const [text, setText] = useState('');
  const [course, setCourse] = useState('');
  const [score, setScore] = useState('');
  const [par, setPar] = useState('');
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  
  const handlePost = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text for your post');
      return;
    }

    try {
      setIsPosting(true);
      const newPost = await createPost(
        text, 
        selectedImage ? [selectedImage] : undefined, 
        course.trim() || undefined, 
        score ? parseInt(score) : undefined, 
        par ? parseInt(par) : undefined
      );
      
      // Clear form
      setText('');
      setCourse('');
      setScore('');
      setPar('');
      setShowCourseInput(false);
      setShowScoreInput(false);
      setSelectedImage(null);
      
      // Emit event to refresh feed
      emitEvent('refreshFeed', newPost);
      
      // Call onPostCreated callback
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };
  
  const toggleCourseInput = () => {
    if (isPosting) return;
    setShowCourseInput(!showCourseInput);
    if (showCourseInput) {
      setCourse('');
    }
  };
  
  const toggleScoreInput = () => {
    if (isPosting) return;
    setShowScoreInput(!showScoreInput);
    if (showScoreInput) {
      setScore('');
      setPar('');
    }
  };

  const pickImage = async () => {
    if (isPosting) return;
    
    try {
      if (Platform.OS !== 'web') {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
          return;
        }
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'There was an error selecting the image. Please try again.');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: currentUser?.avatar || 'https://example.com/default-avatar.jpg' }} 
          style={styles.avatar} 
        />
        <Text style={styles.headerText}>What's happening on the course?</Text>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Share your golf thoughts..."
        placeholderTextColor={colors.textSecondary}
        multiline
        value={text}
        onChangeText={setText}
        editable={!isPosting}
      />
      
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={() => setSelectedImage(null)}
            disabled={isPosting}
          >
            <X size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
      
      {showCourseInput && (
        <View style={styles.additionalInputContainer}>
          <MapPin size={18} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.additionalInput}
            placeholder="Course name"
            placeholderTextColor={colors.textSecondary}
            value={course}
            onChangeText={setCourse}
            editable={!isPosting}
          />
          <TouchableOpacity onPress={toggleCourseInput} disabled={isPosting}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
      
      {showScoreInput && (
        <View style={styles.scoreInputContainer}>
          <View style={styles.additionalInputContainer}>
            <Flag size={18} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.scoreInput}
              placeholder="Your score"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={score}
              onChangeText={setScore}
              editable={!isPosting}
            />
            <Text style={styles.scoreText}>on par</Text>
            <TextInput
              style={styles.scoreInput}
              placeholder="Par"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={par}
              onChangeText={setPar}
              editable={!isPosting}
            />
            <TouchableOpacity onPress={toggleScoreInput} disabled={isPosting}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, isPosting && styles.disabledButton]} 
            onPress={pickImage}
            disabled={isPosting}
          >
            <ImageIcon size={20} color={isPosting ? colors.textSecondary : colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, showCourseInput && styles.activeAction, isPosting && styles.disabledButton]} 
            onPress={toggleCourseInput}
            disabled={isPosting}
          >
            <MapPin size={20} color={showCourseInput ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, showScoreInput && styles.activeAction, isPosting && styles.disabledButton]} 
            onPress={toggleScoreInput}
            disabled={isPosting}
          >
            <Flag size={20} color={showScoreInput ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.postButton, (!text.trim() || isPosting) && styles.disabledButton]} 
          onPress={handlePost}
          disabled={!text.trim() || isPosting}
        >
          {isPosting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  additionalInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  scoreInputContainer: {
    marginBottom: 12,
  },
  scoreInput: {
    width: 60,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  activeAction: {
    backgroundColor: colors.card,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  postButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});