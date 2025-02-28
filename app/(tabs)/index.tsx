import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import Colors from '@/constants/colors';
import { RoundCard } from '@/components/RoundCard';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/StatCard';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user, rounds, courses } = useAppStore();
  
  // Get recent rounds (last 3)
  const recentRounds = [...rounds].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 3);
  
  // Navigate to new round screen
  const handleNewRound = () => {
    router.push('/new-round');
  };
  
  // Navigate to all rounds screen
  const handleViewAllRounds = () => {
    router.push('/rounds');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{user.name}</Text>
          </View>
          <Pressable onPress={() => router.push('/profile')}>
            <Image 
              source={{ uri: user.profileImage }} 
              style={styles.profileImage} 
            />
          </Pressable>
        </View>
      </View>
      
      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsContainer}>
          <StatCard 
            title="Handicap" 
            value={user.handicap.toFixed(1)} 
            icon={<Trophy size={24} color={Colors.secondary} />}
            color={Colors.secondary}
          />
          <View style={styles.statsRow}>
            <View style={styles.statHalf}>
              <StatCard 
                title="Avg. Score" 
                value={user.stats?.averageScore.toFixed(1) || '-'} 
                icon={<Clock size={20} color={Colors.primary} />}
                color={Colors.primary}
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
          <StatCard 
            title="Avg. Drive" 
            value={`${user.stats?.averageDriveDistance} yds`} 
            icon={<TrendingUp size={24} color={Colors.primary} />}
            color={Colors.primary}
          />
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button 
          title="Start New Round" 
          onPress={handleNewRound} 
          variant="primary"
          fullWidth
        />
      </View>
      
      {/* Recent Rounds */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Rounds</Text>
          <Pressable onPress={handleViewAllRounds}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>
        
        {recentRounds.length > 0 ? (
          recentRounds.map(round => (
            <RoundCard key={round.id} round={round} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No rounds recorded yet</Text>
            <Button 
              title="Start Your First Round" 
              onPress={handleNewRound} 
              variant="outline"
              size="small"
              style={{ marginTop: 12 }}
            />
          </View>
        )}
      </View>
      
      {/* Featured Courses */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Featured Courses</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredCoursesContainer}
        >
          {courses.map(course => (
            <Pressable 
              key={course.id}
              style={styles.featuredCourse}
              onPress={() => router.push(`/course/${course.id}`)}
            >
              <Image 
                source={{ uri: course.image }} 
                style={styles.featuredCourseImage} 
              />
              <View style={styles.featuredCourseOverlay}>
                <Text style={styles.featuredCourseName}>{course.name}</Text>
                <Text style={styles.featuredCourseLocation}>{course.location}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.darkBackground,
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
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
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
  },
  featuredCoursesContainer: {
    paddingRight: 20,
  },
  featuredCourse: {
    width: 240,
    height: 160,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  featuredCourseImage: {
    width: '100%',
    height: '100%',
  },
  featuredCourseOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  featuredCourseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  featuredCourseLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lastSection: {
    paddingBottom: 40,
  },
});