import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { View } from 'react-native';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === '(auth)';

      if (!user && !inAuthGroup) {
        // Redirect to login if not authenticated
        router.replace('/login');
      }

      if (user && inAuthGroup) {
        // Redirect to tabs if authenticated and in auth group
        router.replace('/(tabs)' as any);
      }
    }
  }, [user, isLoading, segments, router]);

  // Show nothing while loading
  if (isLoading) {
    return <View />;
  }

  return children;
}
