import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { colors } from '@/constants/colors';

/**
 * LoginScreen Component
 * Handles user authentication through email-based login
 * Features:
 * - Email input validation
 * - Keyboard-aware layout
 * - Error handling with alerts
 * - Navigation after successful login
 * - Loading state handling
 */
export default function LoginScreen() {
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuth();
  const router = useRouter();

  /**
   * Handles the login process
   * - Validates email input
   * - Attempts to login user
   * - Navigates to main app or shows error
   */
  const handleLogin = useCallback(async () => {
    // Validate email is not empty
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await signIn(email, password);
      // Auth guard will handle navigation
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password');
    }
  }, [email, password, signIn]);

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
            editable={!isLoading}
          />

          {/* Password input field */}
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!isLoading}
          />

          {/* Login button */}
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
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
  // Disabled button styles
  buttonDisabled: {
    opacity: 0.7,
  },
  // Button text styles
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 