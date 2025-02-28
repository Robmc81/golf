import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import Colors from '@/constants/colors';
import { StatCard } from '@/components/StatCard';
import { 
  User, 
  Trophy, 
  Flag, 
  Target, 
  TrendingUp, 
  Clock, 
  Settings, 
  LogOut 
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const { logout } = useAuthStore();
  
  // Handle logout with direct navigation
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
            // First logout to clear the auth state
            logout();
            // Then force navigation to the sign-in page
            router.replace('/');
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: user.profileImage }} 
            style={styles.profileImage} 
          />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        
        <View style={styles.handicapContainer}>
          <Trophy size={16} color="#fff" />
          <Text style={styles.handicapText}>Handicap: {user.handicap.toFixed(1)}</Text>
        </View>
      </View>
      
      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        
        <View style={styles.statsContainer}>
          <StatCard 
            title="Average Score" 
            value={user.stats?.averageScore.toFixed(1) || '-'} 
            icon={<Flag size={24} color={Colors.primary} />}
            color={Colors.primary}
          />
          
          <View style={styles.statsRow}>
            <View style={styles.statHalf}>
              <StatCard 
                title="Fairways Hit" 
                value={`${(user.stats?.fairwaysHit * 100).toFixed(0)}%`} 
                icon={<Target size={20} color={Colors.secondary} />}
                color={Colors.secondary}
              />
            </View>
            <View style={styles.statHalf}>
              <StatCard 
                title="GIR" 
                value={`${(user.stats?.greensInRegulation * 100).toFixed(0)}%`} 
                icon={<Target size={20} color={Colors.secondary} />}
                color={Colors.secondary}
              />
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statHalf}>
              <StatCard 
                title="Putts/Round" 
                value={user.stats?.puttsPerRound.toFixed(1) || '-'} 
                icon={<Clock size={20} color={Colors.primary} />}
                color={Colors.primary}
              />
            </View>
            <View style={styles.statHalf}>
              <StatCard 
                title="Avg. Drive" 
                value={`${user.stats?.averageDriveDistance} yds`} 
                icon={<TrendingUp size={20} color={Colors.primary} />}
                color={Colors.primary}
              />
            </View>
          </View>
        </View>
      </View>
      
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.menuCard}>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <User size={20} color={Colors.text} />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
          </Pressable>
          
          <View style={styles.menuDivider} />
          
          <Pressable style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Settings size={20} color={Colors.text} />
            </View>
            <Text style={styles.menuText}>Settings</Text>
          </Pressable>
          
          <View style={styles.menuDivider} />
          
          <Pressable 
            style={styles.menuItem}
            onPress={handleLogout}
            testID="logoutButton"
          >
            <View style={styles.menuIconContainer}>
              <LogOut size={20} color={Colors.error} />
            </View>
            <Text style={[styles.menuText, { color: Colors.error }]}>Log Out</Text>
          </Pressable>
        </View>
      </View>
      
      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>Golf Scorecard v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.darkBackground,
    padding: 24,
    alignItems: 'center',
    paddingBottom: 32,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  handicapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  handicapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statHalf: {
    width: '48%',
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.darkBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  appInfo: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.subtext,
  },
});