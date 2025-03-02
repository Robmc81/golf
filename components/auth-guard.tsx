import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';

export function AuthGuard() {
  const { isLoggedIn } = useAppStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inProtectedRoute = segments[0] !== '(auth)';
    
    if (!isLoggedIn && inProtectedRoute) {
      router.replace('/(auth)/login' as any);
    } else if (isLoggedIn && !inProtectedRoute) {
      router.replace('/(tabs)' as any);
    }
  }, [isLoggedIn, segments]);

  return null;
} 