import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import Colors from '@/constants/colors';
import { RoundCard } from '@/components/RoundCard';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Pressable, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';

export default function RoundsHistoryScreen() {
  const { rounds } = useAppStore();
  const router = useRouter();
  const { logout } = useAuthStore();
  
  // Sort rounds by date (newest first)
  const sortedRounds = [...rounds].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Round History',
          headerBackTitle: 'Back',
          headerRight: () => <LogoutButton />
        }} 
      />
      
      <FlatList
        data={sortedRounds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RoundCard round={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No rounds recorded yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
  },
});