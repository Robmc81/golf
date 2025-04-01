import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './constants/colors';
import { useCourseDetails, type Course } from './hooks/use-course-details';
import { useAppStore } from './hooks/use-app-store';
import { format } from 'date-fns';
import { supabase } from './lib/supabase';
import { useSessionContext } from './contexts/SessionContext';

interface CourseParams {
  courseId?: string;
  courseName?: string;
}

interface RoundData {
  id: string;
  total_score: number;
  date_played: string;
}

interface DebugInfo {
  userId?: string;
  courseId?: string;
  rounds?: any[];
  bestRound?: any;
  error?: string;
}

export default function CourseDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as CourseParams;
  const { data: course, isLoading, isError } = useCourseDetails(params.courseId);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [courseStats, setCourseStats] = useState<{
    bestScore: number | null;
    recentRounds: RoundData[];
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { 
    isFavoriteCourse, 
    addFavoriteCourse, 
    removeFavoriteCourse, 
    loadFavoriteCourses,
    getCourseStats,
    loadRounds,
    rounds
  } = useAppStore();
  const [session] = useSessionContext();
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoadingData(true);
        console.log('Starting data initialization...');
        console.log('Course ID from params:', params.courseId);
        
        await Promise.all([loadFavoriteCourses(), loadRounds()]);
        
        console.log('Data loaded successfully:');
        console.log('- Total rounds:', rounds.length);
        if (course) {
          console.log('- Course ID:', course._id);
          const stats = getCourseStats(course._id);
          console.log('- Course stats:', stats);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    initializeData();
  }, [course, params.courseId]);

  useEffect(() => {
    const fetchCourseStats = async () => {
      if (!session?.user) {
        console.log('No user session available');
        setDebugInfo(prev => ({ ...prev, error: 'No user session available' }));
        setIsLoadingStats(false);
        return;
      }
      
      try {
        setIsLoadingStats(true);
        const userId = session.user.id;
        const currentDebugInfo: DebugInfo = {
          userId,
          courseId: params.courseId
        };
        
        setDebugInfo(currentDebugInfo);
        
        console.log('Fetching stats for user ID:', userId);

        // Fetch last 3 completed rounds for the current user, excluding rounds with total_score = 0
        const { data: rounds, error: roundsError } = await supabase
          .from('charlie_yates_scorecards')
          .select('id, total_score, date_played')
          .eq('user_id', userId)
          .eq('active', false)  // Changed: look for completed rounds where active = false
          .neq('total_score', 0)
          .order('date_played', { ascending: false })
          .limit(3);

        if (roundsError) {
          console.error('Error fetching rounds:', roundsError);
          setDebugInfo(prev => ({ ...prev, error: roundsError.message }));
          return;
        }

        console.log('Fetched rounds:', rounds);
        currentDebugInfo.rounds = rounds;

        // Get the best score (lowest non-zero total_score)
        const { data: bestRound, error: bestError } = await supabase
          .from('charlie_yates_scorecards')
          .select('total_score')
          .eq('user_id', userId)
          .eq('active', false)  // Changed: look for completed rounds where active = false
          .gt('total_score', 0)
          .order('total_score', { ascending: true })
          .limit(1)
          .single();

        if (bestError && bestError.code !== 'PGRST116') {
          console.error('Error fetching best round:', bestError);
          setDebugInfo(prev => ({ ...prev, error: bestError.message }));
        }

        console.log('Best round:', bestRound);
        currentDebugInfo.bestRound = bestRound;
        setDebugInfo(currentDebugInfo);

        setCourseStats({
          bestScore: bestRound?.total_score || null,
          recentRounds: rounds || []
        });
      } catch (error: any) {
        console.error('Error fetching course stats:', error);
        setDebugInfo(prev => ({ ...prev, error: error.message }));
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchCourseStats();
  }, [session?.user]);

  const toggleFavorite = () => {
    if (!course) return;
    if (isFavoriteCourse(course._id)) {
      removeFavoriteCourse(course._id);
    } else {
      addFavoriteCourse(course._id);
    }
  };

  const renderCourseStats = () => {
    if (isLoadingStats) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Stats</Text>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (!courseStats || courseStats.recentRounds.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Stats</Text>
          <Text style={styles.noStatsText}>You haven't played any rounds at Charlie Yates yet.</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Stats</Text>
        
        {/* Best Score Section */}
        {courseStats.bestScore !== null && (
          <View style={styles.bestScoreContainer}>
            <Text style={styles.bestScoreLabel}>Best Score</Text>
            <Text style={styles.bestScoreValue}>{courseStats.bestScore}</Text>
          </View>
        )}

        {/* Recent Rounds Section */}
        <View style={styles.recentRoundsContainer}>
          <Text style={styles.recentRoundsTitle}>Recent Rounds</Text>
          {courseStats.recentRounds.map((round) => (
            <View key={round.id} style={styles.roundItem}>
              <Text style={styles.roundDate}>
                {format(new Date(round.date_played), 'MMM d, yyyy')}
              </Text>
              <Text style={styles.roundScore}>{round.total_score}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDebugOverlay = () => {
    if (!showDebug) return null;

    return (
      <View style={styles.debugOverlay}>
        <ScrollView style={styles.debugContent}>
          <Text style={styles.debugTitle}>Debug Information</Text>
          <Text style={styles.debugText}>User ID: {debugInfo.userId || 'Not available'}</Text>
          <Text style={styles.debugText}>Course ID: {debugInfo.courseId || 'Not available'}</Text>
          <Text style={styles.debugText}>Recent Rounds: {debugInfo.rounds ? JSON.stringify(debugInfo.rounds, null, 2) : 'No rounds'}</Text>
          <Text style={styles.debugText}>Best Round: {debugInfo.bestRound ? JSON.stringify(debugInfo.bestRound, null, 2) : 'No best round'}</Text>
          {debugInfo.error && (
            <Text style={[styles.debugText, styles.debugError]}>Error: {debugInfo.error}</Text>
          )}
        </ScrollView>
        <TouchableOpacity 
          style={styles.debugCloseButton}
          onPress={() => setShowDebug(false)}
        >
          <Text style={styles.debugCloseButtonText}>Close Debug</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading || isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load course details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: course.imageUrl }} style={styles.courseImage} resizeMode="cover" />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={toggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isFavoriteCourse(course._id) ? "heart" : "heart-outline"} 
              size={28} 
              color={isFavoriteCourse(course._id) ? colors.primary : "white"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={() => setShowDebug(true)}
          >
            <Text style={styles.debugButtonText}>Debug</Text>
          </TouchableOpacity>
          <View style={styles.courseNameContainer}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseLocation}>{course.location}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>HOLES</Text>
              <Text style={styles.statValue}>{course.holes}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PAR</Text>
              <Text style={styles.statValue}>{course.par}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>DIFFICULTY</Text>
              <Text style={styles.statValue}>{course.difficulty}/5</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>PRICE</Text>
              <Text style={styles.statValue}>{course.price}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>{course.description || 'No description available.'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.sectionText}>{course.location}</Text>
          </View>

          {renderCourseStats()}
        </View>
      </ScrollView>
      {renderDebugOverlay()}

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => router.push(`/round-settings?courseId=${course._id}&courseName=${course.name}`)}
        >
          <Ionicons name="golf" size={24} color={colors.white} />
          <Text style={styles.primaryButtonText}>Start Round</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 1,
  },
  courseNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  courseName: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  courseLocation: {
    color: colors.white,
    fontSize: 16,
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  statGridValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statGridLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  lastRoundContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastRoundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  lastRoundStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastRoundStat: {
    flex: 1,
    alignItems: 'center',
  },
  lastRoundLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  lastRoundValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  noStatsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  bestScoreContainer: {
    marginBottom: 16,
  },
  bestScoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  bestScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  recentRoundsContainer: {
    marginTop: 16,
  },
  recentRoundsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  roundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roundDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  roundScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  debugButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 8,
    zIndex: 1,
  },
  debugButtonText: {
    color: colors.white,
    fontSize: 12,
  },
  debugOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 999,
  },
  debugContent: {
    padding: 20,
    flex: 1,
  },
  debugTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  debugText: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  debugError: {
    color: colors.error,
  },
  debugCloseButton: {
    backgroundColor: colors.primary,
    padding: 16,
    alignItems: 'center',
  },
  debugCloseButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 