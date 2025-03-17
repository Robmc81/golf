import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './constants/colors';
import { useCourseDetails, type Course } from './hooks/use-course-details';
import { useAppStore } from './hooks/use-app-store';
import { format } from 'date-fns';

interface CourseParams {
  courseId?: string;
  courseName?: string;
}

export default function CourseDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as CourseParams;
  const { data: course, isLoading, isError } = useCourseDetails(params.courseId);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { 
    isFavoriteCourse, 
    addFavoriteCourse, 
    removeFavoriteCourse, 
    loadFavoriteCourses,
    getCourseStats,
    loadRounds,
    rounds
  } = useAppStore();

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

  const toggleFavorite = () => {
    if (!course) return;
    if (isFavoriteCourse(course._id)) {
      removeFavoriteCourse(course._id);
    } else {
      addFavoriteCourse(course._id);
    }
  };

  const renderCourseStats = () => {
    if (!course) {
      console.log('No course data available');
      return null;
    }
    
    console.log('Getting stats for course:', course._id);
    const stats = getCourseStats(course._id);
    console.log('Course stats:', stats);
    
    if (stats.roundsPlayed === 0) {
      console.log('No rounds played for this course');
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Stats</Text>
          <Text style={styles.noStatsText}>You haven't played any rounds at this course yet.</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statGridItem}>
            <Text style={styles.statGridValue}>{stats.roundsPlayed}</Text>
            <Text style={styles.statGridLabel}>Rounds Played</Text>
          </View>
          <View style={styles.statGridItem}>
            <Text style={styles.statGridValue}>{stats.averageScore}</Text>
            <Text style={styles.statGridLabel}>Avg Score</Text>
          </View>
          <View style={styles.statGridItem}>
            <Text style={styles.statGridValue}>{stats.bestScore}</Text>
            <Text style={styles.statGridLabel}>Best Score</Text>
          </View>
        </View>

        {stats.lastRound && (
          <View style={styles.lastRoundContainer}>
            <Text style={styles.lastRoundTitle}>Last Round</Text>
            <View style={styles.lastRoundStats}>
              <View style={styles.lastRoundStat}>
                <Text style={styles.lastRoundLabel}>Date</Text>
                <Text style={styles.lastRoundValue}>
                  {format(new Date(stats.lastRound.date), 'MMM d, yyyy')}
                </Text>
              </View>
              <View style={styles.lastRoundStat}>
                <Text style={styles.lastRoundLabel}>Score</Text>
                <Text style={styles.lastRoundValue}>{stats.lastRound.score}</Text>
              </View>
              <View style={styles.lastRoundStat}>
                <Text style={styles.lastRoundLabel}>vs Par</Text>
                <Text style={[
                  styles.lastRoundValue,
                  { color: stats.lastRound.score > stats.lastRound.par ? colors.error : colors.success }
                ]}>
                  {stats.lastRound.score > stats.lastRound.par ? '+' : ''}
                  {stats.lastRound.score - stats.lastRound.par}
                </Text>
              </View>
            </View>
          </View>
        )}
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

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.myCourseButton]}
          onPress={toggleFavorite}
        >
          <Ionicons 
            name={isFavoriteCourse(course._id) ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavoriteCourse(course._id) ? colors.white : colors.primary} 
          />
          <Text style={[
            styles.myCourseButtonText,
            isFavoriteCourse(course._id) && styles.myCourseButtonTextActive
          ]}>
            {isFavoriteCourse(course._id) ? 'My Course' : 'Add to My Courses'}
          </Text>
        </TouchableOpacity>
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
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  myCourseButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  myCourseButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
  },
  myCourseButtonTextActive: {
    color: colors.white,
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
  }
}); 