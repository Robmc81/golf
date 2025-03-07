import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AuthGuard } from '@/components/auth-guard';
import { colors } from '@/constants/colors';
import { useAuth, AuthProvider } from '@/lib/auth';

/**
 * Error Boundary export for handling layout-level errors
 */
export {
  ErrorBoundary,
} from 'expo-router';

/**
 * Navigation settings to ensure proper modal behavior
 * Sets the initial route to the tabs section
 */
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent splash screen from auto-hiding during app initialization
SplashScreen.preventAutoHideAsync();

/**
 * RootLayout Component
 * Main application layout that handles:
 * - Theme management (light/dark mode)
 * - Authentication state
 * - Navigation structure
 * - Resource loading (fonts, etc.)
 * - Splash screen management
 */
export default function RootLayout() {
  // State management for app initialization
  const [isReady, setIsReady] = useState(false);
  // Get system color scheme for theme management
  const colorScheme = useColorScheme();
  // Get authentication loading state
  const { isLoading: isAuthLoading } = useAuth();
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    // Add your required fonts here
  });

  /**
   * Initialize app resources and configurations
   * Runs once when component mounts
   */
  useEffect(() => {
    async function prepare() {
      try {
        // Add any additional async initialization here
        await Promise.all([
          // Add other initialization promises here
        ]);
      } catch (e) {
        console.warn('Error during initialization:', e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  /**
   * Handle splash screen visibility
   * Hides splash screen when all resources are loaded
   */
  useEffect(() => {
    if (isReady && !isAuthLoading && fontsLoaded) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [isReady, isAuthLoading, fontsLoaded]);

  // Show nothing while resources are loading
  if (!isReady || !fontsLoaded || isAuthLoading) {
    return null;
  }

  return (
    // Theme provider for light/dark mode support
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Authentication context provider */}
      <AuthProvider>
        {/* Guard component for protected routes */}
        <AuthGuard />
        {/* Main navigation stack */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* Authentication routes */}
          <Stack.Screen name="(auth)" />
          {/* Main app tabs */}
          <Stack.Screen name="(tabs)" />
          {/* Modal screen with custom presentation */}
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              headerShown: true 
            }} 
          />
          {/* Dynamic routes for posts and profiles */}
          <Stack.Screen name="post/[id]" />
          <Stack.Screen name="profile/[id]" />
          {/* Course details screen with custom styling */}
          <Stack.Screen
            name="course-details"
            options={{
              title: 'Course Details',
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
            }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}