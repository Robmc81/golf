import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import { colors } from '@/constants/colors';

/**
 * LoginScreen Component
 * Handles user authentication through email-based login
 * Features:
 * - Email input validation
 * - Keyboard-aware layout
 * - Error handling with alerts
 * - Navigation after successful login
 */
export default function LoginScreen() {
  // State management for email input
  const [email, setEmail] = useState('');
  // Get login function from global app store
  const { login } = useAppStore();
  // Initialize router for navigation
  const router = useRouter();

  /**
   * Handles the login process
   * - Validates email input
   * - Attempts to login user
   * - Navigates to main app or shows error
   */
  const handleLogin = () => {
    // Validate email is not empty
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Attempt to login user
    const user = login(email);
    if (user) {
      // Navigate to main app tabs on success
      router.replace('/(tabs)' as any); // Type assertion to fix router type error
    } else {
      Alert.alert('Error', 'No user found with this email address');
    }
  };

  return (
    // KeyboardAvoidingView ensures content is visible when keyboard appears
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* App logo */}
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Welcome text */}
        <Text style={styles.title}>Welcome to Fairway Feed</Text>
        <Text style={styles.subtitle}>Connect with golfers worldwide</Text>

        {/* Login form */}
        <View style={styles.form}>
          {/* Email input field */}
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          {/* Login button */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * Styles for the LoginScreen component
 * Defines the visual appearance of all UI elements
 */
const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Content wrapper styles
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  // Logo image styles
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  // Text styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  // Form container styles
  form: {
    width: '100%',
    maxWidth: 320,
  },
  // Input field styles
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.text,
  },
  // Button styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  // Button text styles
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 