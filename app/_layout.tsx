import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AuthGuard } from '@/components/auth-guard';
import { colors } from '@/constants/colors';
import { useAuth, AuthProvider } from '@/lib/auth';
import { useAppStore } from '@/hooks/use-app-store';
import { Platform } from 'react-native';

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
 * Custom hook for loading app resources
 * @returns boolean indicating if all resources are loaded
 */
const useAppResources = (): boolean => {
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    // Add your required fonts here
  });

  const prepare = useCallback(async () => {
    try {
      // Add any additional async initialization here
      await Promise.all([
        // Add other initialization promises here
      ]);
    } catch (error) {
      console.error('Error during initialization:', error);
      // You might want to show an error screen here
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  return isReady && fontsLoaded;
};

/**
 * AppContent Component
 * Handles the main app content and navigation
 */
function AppContent() {
  const colorScheme = useColorScheme();
  const resourcesLoaded = useAppResources();
  const { user } = useAuth();
  const { logout } = useAppStore();

  // Handle splash screen visibility
  useEffect(() => {
    if (resourcesLoaded) {
      SplashScreen.hideAsync().catch((error) => {
        console.error('Error hiding splash screen:', error);
      });
    }
  }, [resourcesLoaded]);

  // Show nothing while resources are loading
  if (!resourcesLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: Platform.OS === 'ios' ? 'default' : 'fade',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        >
          {/* Authentication routes */}
          <Stack.Screen name="(auth)" />
          {/* Main app tabs */}
          <Stack.Screen name="(tabs)" />
          {/* Modal screen with custom presentation */}
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              animation: 'slide_from_bottom',
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
          {/* Round settings and active round screens */}
          <Stack.Screen
            name="round-settings"
            options={{
              title: 'Round Settings',
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
            }}
          />
          <Stack.Screen
            name="active-round"
            options={{
              title: 'Active Round',
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
            }}
          />
        </Stack>
      </AuthGuard>
    </ThemeProvider>
  );
}

/**
 * RootLayout Component
 * Main application layout that handles:
 * - Theme management (light/dark mode)
 * - Authentication state
 * - Navigation structure
 * - Resource loading (fonts, etc.)
 * - Splash screen management
 */
export default function RootLayout(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}