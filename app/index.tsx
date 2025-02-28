import React, { useState } from 'react';
import { StyleSheet, View, Text, ImageBackground, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { Button } from '@/components/Button';
import { Mail, Lock, User, ArrowRight, Flag } from 'lucide-react-native';
import { useAuthStore } from '@/hooks/use-auth-store';

export default function AuthScreen() {
  const router = useRouter();
  const { login, register } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      let success;
      
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await register(name, email, password);
      }
      
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1587174786825-71a0b9364828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Flag size={40} color={Colors.primary} />
              </View>
              <Text style={styles.appName}>GolfTracker Pro</Text>
              <Text style={styles.tagline}>Track scores. Improve your game.</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <User size={20} color={Colors.subtext} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={Colors.subtext}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.subtext} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={Colors.subtext}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.subtext} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.subtext}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {isLogin && (
                <Pressable style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </Pressable>
              )}

              <Button
                title={isLogin ? 'Sign In' : 'Create Account'}
                onPress={handleAuth}
                variant="primary"
                fullWidth
                loading={isLoading}
                icon={!isLoading && <ArrowRight size={18} color="#fff" />}
                style={styles.authButton}
              />

              <Pressable style={styles.toggleContainer} onPress={toggleAuthMode}>
                <Text style={styles.toggleText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.toggleAction}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Text>
              </Pressable>
            </View>

            <View style={styles.demoContainer}>
              <Button
                title="Continue as Guest"
                onPress={handleAuth}
                variant="outline"
                fullWidth
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  authButton: {
    marginBottom: 16,
  },
  toggleContainer: {
    alignItems: 'center',
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  toggleAction: {
    color: Colors.primary,
    fontWeight: '600',
  },
  demoContainer: {
    marginBottom: 24,
  },
});