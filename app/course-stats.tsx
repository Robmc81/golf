import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';

interface Round {
  date: string;
  score: number;
  putts: number;
  gir: number;
  fairways: number;
}

interface FriendStats {
  name: string;
  averageScore: number;
  roundsPlayed: number;
}

interface CourseStats {
  averageScore: number;
  bestScore: number;
  roundsPlayed: number;
  averagePutts: number;
  averageGIR: number;
  averageFairways: number;
  recentRounds: Round[];
  friendsStats: FriendStats[];
}

type TimeRange = 'week' | 'month' | 'year';

/**
 * Mock data structure for course statistics
 * Contains:
 * - Overall performance metrics
 * - Recent round history
 * - Friends' performance data
 * 
 * Note: This should be replaced with actual API data in production
 */
const mockStats: CourseStats = {
  averageScore: 75,
  bestScore: 68,
  roundsPlayed: 12,
  averagePutts: 31,
  averageGIR: 65,
  averageFairways: 70,
  recentRounds: [
    { date: '2024-03-15', score: 72, putts: 30, gir: 67, fairways: 75 },
    { date: '2024-03-10', score: 74, putts: 32, gir: 61, fairways: 68 },
    { date: '2024-03-05', score: 71, putts: 29, gir: 72, fairways: 71 },
  ],
  friendsStats: [
    { name: 'John Smith', averageScore: 78, roundsPlayed: 8 },
    { name: 'Sarah Johnson', averageScore: 76, roundsPlayed: 5 },
    { name: 'Mike Wilson', averageScore: 80, roundsPlayed: 3 },
  ],
};

/**
 * CourseStatsScreen Component
 * Displays comprehensive statistics for a specific golf course including:
 * - Overall performance metrics
 * - Recent round history
 * - Friends' performance
 * - Time-based filtering options
 */
export default function CourseStatsScreen() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  
  // Get route parameters from previous screen
  const params = useLocalSearchParams<{
    courseId: string;
    courseName: string;
  }>();

  // State for time range filter
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  /**
   * Formats date string into localized display format
   * @param dateString - ISO date string to format
   * @returns Formatted date string (e.g., "Mar 15")
   */
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  // Memoize filtered stats based on time range
  const filteredStats = useMemo(() => {
    // TODO: Implement actual filtering based on time range
    return mockStats;
  }, [timeRange]);

  // Show loading state when currentUser is not available
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header section with back button and course info */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Course Statistics</Text>
          <Text style={styles.courseName}>{params.courseName}</Text>
        </View>
      </View>

      {/* Scrollable content area */}
      <ScrollView style={styles.content}>
        {/* Time range filter buttons */}
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === 'week' && styles.activeTimeRange]}
            onPress={() => handleTimeRangeChange('week')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.timeRangeText, timeRange === 'week' && styles.activeTimeRangeText]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === 'month' && styles.activeTimeRange]}
            onPress={() => handleTimeRangeChange('month')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.timeRangeText, timeRange === 'month' && styles.activeTimeRangeText]}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === 'year' && styles.activeTimeRange]}
            onPress={() => handleTimeRangeChange('year')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.timeRangeText, timeRange === 'year' && styles.activeTimeRangeText]}>Year</Text>
          </TouchableOpacity>
        </View>

        {/* Key statistics grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filteredStats.averageScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filteredStats.bestScore}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filteredStats.roundsPlayed}</Text>
            <Text style={styles.statLabel}>Rounds</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{filteredStats.averagePutts}</Text>
            <Text style={styles.statLabel}>Avg Putts</Text>
          </View>
        </View>

        {/* Recent rounds section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Rounds</Text>
          {filteredStats.recentRounds.map((round, index) => (
            <View key={index} style={styles.roundRow}>
              <Text style={styles.roundDate}>{formatDate(round.date)}</Text>
              <View style={styles.roundStats}>
                <Text style={styles.roundScore}>Score: {round.score}</Text>
                <Text style={styles.roundDetail}>Putts: {round.putts}</Text>
                <Text style={styles.roundDetail}>GIR: {round.gir}%</Text>
                <Text style={styles.roundDetail}>Fairways: {round.fairways}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Friends' performance section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends' Performance</Text>
          {filteredStats.friendsStats.map((friend, index) => (
            <View key={index} style={styles.friendRow}>
              <Text style={styles.friendName}>{friend.name}</Text>
              <View style={styles.friendStats}>
                <Text style={styles.friendStat}>Avg: {friend.averageScore}</Text>
                <Text style={styles.friendStat}>Rounds: {friend.roundsPlayed}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  activeTimeRange: {
    backgroundColor: colors.success,
  },
  timeRangeText: {
    color: colors.textSecondary,
  },
  activeTimeRangeText: {
    color: colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  roundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roundDate: {
    fontSize: 16,
    color: colors.text,
    width: 80,
  },
  roundStats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  roundScore: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  roundDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  friendName: {
    fontSize: 16,
    color: colors.text,
  },
  friendStats: {
    alignItems: 'flex-end',
  },
  friendStat: {
    fontSize: 14,
    color: '#666',
  },
}); 