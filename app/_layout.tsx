import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Platform, Pressable, Alert } from "react-native";
import { useAuthStore } from "@/hooks/use-auth-store";
import { LogOut } from "lucide-react-native";
import Colors from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This function ensures users are directed to the right place based on auth state
function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const isMounted = useRef(false);

  useEffect(() => {
    // Set mounted ref to true after the first render
    isMounted.current = true;
  }, []);

  useEffect(() => {
    // Only run navigation logic if component is mounted
    if (!isMounted.current) return;

    const inAuthGroup = segments[0] === "(tabs)";
    
    if (!isAuthenticated && inAuthGroup) {
      // If the user is not authenticated and tries to access protected routes,
      // redirect them to the sign-in page
      router.replace("/");
    } else if (isAuthenticated && segments[0] !== "(tabs)" && segments[0] !== "modal") {
      // If the user is authenticated and on a non-protected route (like sign-in),
      // redirect them to the home page
      // Only redirect if not already in tabs and not in a modal
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { isAuthenticated } = useAuthStore();
  
  // Use the custom hook to protect routes
  useProtectedRoute(isAuthenticated);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isAuthenticated } = useAuthStore();

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: () => {
            logout();
            router.replace('/');
          },
          style: "destructive"
        }
      ]
    );
  };

  // Logout button component for the header
  const LogoutButton = () => (
    <Pressable 
      onPress={handleLogout}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        padding: 8,
        marginRight: 8
      })}
    >
      <LogOut size={24} color={Colors.error} />
    </Pressable>
  );

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen 
        name="rounds" 
        options={{ 
          headerRight: isAuthenticated ? () => <LogoutButton /> : undefined
        }} 
      />
      <Stack.Screen 
        name="new-round" 
        options={{ 
          headerRight: isAuthenticated ? () => <LogoutButton /> : undefined
        }} 
      />
      <Stack.Screen 
        name="round/[id]" 
        options={{ 
          headerRight: isAuthenticated ? () => <LogoutButton /> : undefined
        }} 
      />
      <Stack.Screen 
        name="course/[id]" 
        options={{ 
          headerRight: isAuthenticated ? () => <LogoutButton /> : undefined
        }} 
      />
    </Stack>
  );
}