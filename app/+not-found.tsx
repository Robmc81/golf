// Import necessary React Native components and navigation utilities
import React from 'react';
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

/**
 * NotFoundScreen Component
 * Displays a 404 error page when a user navigates to a non-existent route
 * Features:
 * - Clear error message
 * - Link to return to home screen
 * - Consistent styling with the app theme
 */
export default function NotFoundScreen() {
  return (
    <>
      {/* Configure the screen header */}
      <Stack.Screen options={{ title: "Oops!" }} />
      {/* Main content container */}
      <View style={styles.container}>
        {/* Error message */}
        <Text style={styles.title}>This screen doesn't exist.</Text>

        {/* Navigation link to home screen */}
        <Link href="/(tabs)" asChild style={styles.link} as any>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
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
  },
  // Title text styles
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  // Link container styles
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  // Link text styles
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
