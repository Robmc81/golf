import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, Platform, Alert } from 'react-native';
import { MapPin, X, Flag, Image as ImageIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';
import * as ImagePicker from 'expo-image-picker';

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
  
  const handlePost = () => {
    if (text.trim()) {
      createPost(
        text, 
        selectedImage ? [selectedImage] : undefined, 
        course.trim() || undefined, 
        score ? parseInt(score) : undefined, 
        par ? parseInt(par) : undefined
      );
      
      setText('');
      setCourse('');
      setScore('');
      setPar('');
      setShowCourseInput(false);
      setShowScoreInput(false);
      setSelectedImage(null);
      
      if (onPostCreated) {
        onPostCreated();
      }
    }
  };
  
  const toggleCourseInput = () => {
    setShowCourseInput(!showCourseInput);
    if (showCourseInput) {
      setCourse('');
    }
  };
  
  const toggleScoreInput = () => {
    setShowScoreInput(!showScoreInput);
    if (showScoreInput) {
      setScore('');
      setPar('');
    }
  };

  const pickImage = async () => {
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
        <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
        <Text style={styles.headerText}>What's happening on the course?</Text>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Share your golf thoughts..."
        placeholderTextColor={colors.textSecondary}
        multiline
        value={text}
        onChangeText={setText}
      />
      
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={() => setSelectedImage(null)}
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
          />
          <TouchableOpacity onPress={toggleCourseInput}>
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
            />
            <Text style={styles.scoreText}>on par</Text>
            <TextInput
              style={styles.scoreInput}
              placeholder="Par"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={par}
              onChangeText={setPar}
            />
            <TouchableOpacity onPress={toggleScoreInput}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <ImageIcon size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, showCourseInput && styles.activeAction]} 
            onPress={toggleCourseInput}
          >
            <MapPin size={20} color={showCourseInput ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, showScoreInput && styles.activeAction]} 
            onPress={toggleScoreInput}
          >
            <Flag size={20} color={showScoreInput ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.postButton, !text.trim() && styles.disabledButton]} 
          onPress={handlePost}
          disabled={!text.trim()}
        >
          <Text style={styles.postButtonText}>Post</Text>
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
    fontSize: 14,
    color: colors.text,
  },
  scoreInputContainer: {
    marginBottom: 4,
  },
  scoreInput: {
    width: 60,
    fontSize: 14,
    color: colors.text,
  },
  scoreText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 16,
    padding: 4,
  },
  activeAction: {
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: colors.primaryLight,
  },
  postButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});