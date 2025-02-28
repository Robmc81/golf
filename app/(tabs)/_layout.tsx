import React from "react";
import { Tabs, useRouter } from "expo-router";
import { Pressable, Alert } from "react-native";
import Colors from "@/constants/colors";
import { Home, Flag, ClipboardCheck, User, LogOut } from "lucide-react-native";
import { useAuthStore } from "@/hooks/use-auth-store";

export default function TabLayout() {
  const router = useRouter();
  const { logout } = useAuthStore();

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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.subtext,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: Colors.background,
        },
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          backgroundColor: Colors.background,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: Colors.text,
        },
        // Add logout button to all tab screens
        headerRight: () => <LogoutButton />
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }) => <Flag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scorecard"
        options={{
          title: "Scorecard",
          tabBarIcon: ({ color, size }) => <ClipboardCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}