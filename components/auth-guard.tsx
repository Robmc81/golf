import { useEffect } from 'react';
import { Redirect, useSegments } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { View } from 'react-native';

export function AuthGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return <View />;
  }

  const inAuthGroup = segments[0] === '(auth)';

  if (!user && !inAuthGroup) {
    return <Redirect href="/login" />;
  }

  if (user && inAuthGroup) {
    return <Redirect href="/course-details" />;
  }

  return <View />;
} 