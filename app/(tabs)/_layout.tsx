import React from 'react';
import { Tabs } from 'expo-router';
import { Home, User, Bell, Search, Send, Users, Flag, LucideIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Type for tab bar icon props 
 */ 
type TabBarIconProps = { 
  color: string;
  size?: number;
};

/**
 * Type for tab screen configuration
 */
type TabScreen = {
  name: string;
  title: string;
  icon: LucideIcon;
  headerTitle?: string;
  headerShown: boolean;
};

/**
 * Tab screen configuration
 */
const TAB_SCREENS: TabScreen[] = [
  { name: 'index', title: 'Home', icon: Home, headerTitle: 'Fairway Feed', headerShown: true },
  { name: 'explore', title: 'Explore', icon: Search, headerShown: true },
  { name: 'golf-courses', title: 'Play', icon: Flag, headerShown: true },
  { name: 'friends', title: 'Friends', icon: Users, headerShown: true },
  { name: 'notifications', title: 'Alerts', icon: Bell, headerShown: true },
  { name: 'profile', title: 'Profile', icon: User, headerShown: true },
];

/**
 * Default screen options for all tabs
 */
const defaultScreenOptions = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarStyle: { borderTopColor: colors.border },
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { fontWeight: 'bold' },
  headerTintColor: colors.text,
} as const;

export default function TabLayout(): JSX.Element {
  const router = useRouter();

  const tabBarIcons = TAB_SCREENS.reduce((acc, screen) => {
    acc[screen.name] = ({ color }: TabBarIconProps) => (
      <screen.icon size={24} color={color} />
    );
    return acc;
  }, {} as Record<string, (props: TabBarIconProps) => JSX.Element>);

  return (
    <Tabs screenOptions={defaultScreenOptions}>
      {TAB_SCREENS.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: tabBarIcons[screen.name],
            headerTitle: screen.headerTitle,
            headerShown: screen.headerShown,
          }}
        />
      ))}

      {/* Floating Post Button */}
      <TouchableOpacity
        onPress={() => router.push('/create')}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.primary,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Send size={20} color={colors.white} style={{ marginRight: 8 }} />
        <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>Post</Text>
      </TouchableOpacity>
    </Tabs>
  );
}
