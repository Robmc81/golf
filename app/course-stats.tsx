import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data for course statistics
const mockStats = {
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

export default function CourseStatsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Course Statistics</Text>
          <Text style={styles.courseName}>{params.courseName}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === 'week' && styles.activeTimeRange]}
            onPress={() => setTimeRange('week')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'week' && styles.activeTimeRangeText]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === 'month' && styles.activeTimeRange]}
            onPress={() => setTimeRange('month')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'month' && styles.activeTimeRangeText]}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timeRangeButton, timeRange === 'year' && styles.activeTimeRange]}
            onPress={() => setTimeRange('year')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'year' && styles.activeTimeRangeText]}>Year</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockStats.averageScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockStats.bestScore}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockStats.roundsPlayed}</Text>
            <Text style={styles.statLabel}>Rounds</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockStats.averagePutts}</Text>
            <Text style={styles.statLabel}>Avg Putts</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Rounds</Text>
          {mockStats.recentRounds.map((round, index) => (
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends' Performance</Text>
          {mockStats.friendsStats.map((friend, index) => (
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#f5f5f5',
  },
  activeTimeRange: {
    backgroundColor: '#4CAF50',
  },
  timeRangeText: {
    color: '#666',
  },
  activeTimeRangeText: {
    color: '#fff',
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
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  roundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  roundDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  roundStats: {
    alignItems: 'flex-end',
  },
  roundScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  roundDetail: {
    fontSize: 14,
    color: '#666',
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  friendStats: {
    alignItems: 'flex-end',
  },
  friendStat: {
    fontSize: 14,
    color: '#666',
  },
}); 