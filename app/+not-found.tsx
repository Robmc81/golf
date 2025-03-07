// Import necessary React Native components and navigation utilities
import React, { useCallback } from 'react';
import { Link, Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from '@/constants/colors';
import { FontAwesome } from '@expo/vector-icons';

/**
 * NotFoundScreen Component
 * Displays a 404 error page when a user navigates to a non-existent route
 * Features:
 * - Clear error message
 * - Link to return to home screen
 * - Consistent styling with the app theme
 */
export default function NotFoundScreen() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <>
      {/* Configure the screen header */}
      <Stack.Screen 
        options={{ 
          title: "Oops!",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      {/* Main content container */}
      <View style={styles.container}>
        {/* Error message */}
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Text style={styles.subtitle}>The page you're looking for couldn't be found.</Text>

        {/* Navigation link to home screen */}
        <TouchableOpacity 
          style={styles.link}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <FontAwesome name="home" size={20} color={colors.primary} style={styles.linkIcon} />
          <Text style={styles.linkText}>Go to home screen</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

/**
 * Styles for the NotFoundScreen component
 * Defines the visual appearance of all UI elements
 */
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  // Title text styles
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  // Link container styles
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  linkIcon: {
    marginRight: 8,
  },
  // Link text styles
  linkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
