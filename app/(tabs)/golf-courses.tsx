import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

/**
 * Type for golf course coordinates
 */
interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Type for a golf course
 */
interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: string;
  description: string;
  coordinates: Coordinates;
  distance?: number;
}

/**
 * Type for course details navigation params
 */
interface CourseDetailsParams {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: string;
  description: string;
  distance?: string;
}

// Mock data for golf courses in Atlanta
const mockGolfCourses: GolfCourse[] = [
  {
    id: '1',
    name: 'Bobby Jones Golf Course',
    location: 'Atlanta, GA',
    rating: 4.5,
    price: '$45',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=60',
    description: 'Historic 9-hole course designed by Robert Trent Jones Sr. in 1932.',
    coordinates: {
      latitude: 33.8487,
      longitude: -84.3794
    }
  },
  {
    id: '2',
    name: 'East Lake Golf Club',
    location: 'Atlanta, GA',
    rating: 4.8,
    price: '$150',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=60',
    description: 'Home of the TOUR Championship and birthplace of Bobby Jones.',
    coordinates: {
      latitude: 33.7400,
      longitude: -84.3100
    }
  },
  {
    id: '3',
    name: 'Piedmont Driving Club',
    location: 'Atlanta, GA',
    rating: 4.7,
    price: '$120',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=60',
    description: 'Private club with a challenging 18-hole championship course.',
    coordinates: {
      latitude: 33.8500,
      longitude: -84.3800
    }
  },
  {
    id: '4',
    name: 'Chastain Park Golf Course',
    location: 'Atlanta, GA',
    rating: 4.2,
    price: '$35',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=60',
    description: 'Public 9-hole course in the heart of Buckhead.',
    coordinates: {
      latitude: 33.8900,
      longitude: -84.3800
    }
  },
  {
    id: '5',
    name: 'North Fulton Golf Course',
    location: 'Atlanta, GA',
    rating: 4.3,
    price: '$40',
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=60',
    description: 'Challenging 18-hole course with beautiful tree-lined fairways.',
    coordinates: {
      latitude: 33.9200,
      longitude: -84.3500
    }
  }
];

/**
 * GolfCoursesScreen Component
 * Displays a list of nearby golf courses with search functionality
 * Features:
 * - Location-based course sorting
 * - Search functionality
 * - Course details navigation
 * - Error handling
 * - Loading states
 */
export default function GolfCoursesScreen(): JSX.Element {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCourses, setNearbyCourses] = useState<GolfCourse[]>([]);

  /**
   * Calculates the distance between two points using the Haversine formula
   */
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  /**
   * Converts degrees to radians
   */
  const toRad = useCallback((value: number): number => {
    return value * Math.PI / 180;
  }, []);

  /**
   * Fetches and processes nearby courses
   */
  const fetchNearbyCourses = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Calculate distances and sort courses
      const coursesWithDistance = mockGolfCourses.map(course => ({
        ...course,
        distance: calculateDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          course.coordinates.latitude,
          course.coordinates.longitude
        )
      }));

      const sortedCourses = coursesWithDistance.sort((a, b) => 
        (a.distance || 0) - (b.distance || 0)
      );

      setNearbyCourses(sortedCourses);
    } catch (err) {
      setError('Error getting location');
      setNearbyCourses(mockGolfCourses);
    }
  }, [calculateDistance]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    fetchNearbyCourses().finally(() => setLoading(false));
  }, [fetchNearbyCourses]);

  /**
   * Handles retry of location fetch
   */
  const handleRetryLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    await fetchNearbyCourses();
    setLoading(false);
  }, [fetchNearbyCourses]);

  /**
   * Filters courses based on search query
   */
  const filteredCourses = useMemo(() => 
    nearbyCourses.filter(course =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.location.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [nearbyCourses, searchQuery]
  );

  /**
   * Handles navigation to course details
   */
  const handleCoursePress = useCallback((course: GolfCourse) => {
    const params = {
      id: course.id,
      name: course.name,
      location: course.location,
      rating: course.rating,
      price: course.price,
      image: course.image,
      description: course.description,
      distance: course.distance?.toFixed(1)
    } as const;
    router.push({
      pathname: '/course-details',
      params
    });
  }, [router]);

  /**
   * Renders a single course card
   */
  const renderCourseCard = useCallback(({ item }: { item: GolfCourse }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.courseImage} />
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseLocation}>{item.location}</Text>
        <View style={styles.courseDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.primary} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.price}>{item.price}</Text>
          {item.distance && (
            <Text style={styles.distance}>{item.distance.toFixed(1)} km away</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [handleCoursePress]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding nearby courses...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetryLocation}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 200,
  },
  courseInfo: {
    padding: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  courseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.text,
  },
  price: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 14,
    color: colors.textSecondary,
  },
}); 