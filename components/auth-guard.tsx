import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';

export function AuthGuard() {
  const { isLoggedIn } = useAppStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    if (!isLoggedIn && !inAuthGroup) {
      // Redirect to login if not logged in and not in auth group
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      // Redirect to home if logged in and in auth group
      router.replace('/(tabs)/home');
    }
  }, [isLoggedIn, segments]);

  return null;
} 