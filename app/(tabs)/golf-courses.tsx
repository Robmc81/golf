import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { WebflowCourse } from '../lib/webflow';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useCourses } from '../hooks/use-courses';

export default function GolfCoursesScreen() {
  const router = useRouter();
  const { data: courses, isLoading, isError, error, refetch } = useCourses();

  useEffect(() => {
    if (isError) {
      console.error('Error loading courses:', error);
    }
  }, [isError, error]);

  const renderCourse = ({ item }: { item: WebflowCourse }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => router.push(`/course-details?courseId=${item._id}&courseName=${item.name}`)}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.courseImage}
            defaultSource={require('../../assets/images/course-placeholder.png')}
          />
        ) : (
          <View style={[styles.courseImage, styles.placeholderImage]}>
            <Ionicons name="golf" size={48} color={colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseLocation}>{item.location}</Text>
        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Ionicons name="flag" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{item.holes} Holes</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="golf" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>Par {item.par}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons 
              name="star" 
              size={16} 
              color={item.rating > 0 ? colors.primary : colors.textSecondary} 
            />
            <Text style={[styles.statText, item.rating > 0 && styles.ratingText]}>
              {item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="golf-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No courses found</Text>
      </View>
    );
  };

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning" size={48} color={colors.error} />
        <Text style={styles.errorText}>Failed to load courses</Text>
        {error instanceof Error && (
          <Text style={styles.errorDetails}>{error.message}</Text>
        )}
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={<EmptyListComponent />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  courseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  courseImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    padding: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    color: colors.primary,
    fontWeight: '500',
  },
  priceContainer: {
    marginLeft: 'auto',
  },
  priceText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 300,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginVertical: 16,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
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
}); 