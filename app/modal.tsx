import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';
import { useCallback, useMemo } from "react";

/**
 * Interface defining the structure of a golf course
 * @property id - Unique identifier for the course
 * @property name - Name of the golf course
 * @property location - Geographic location of the course
 * @property rating - Course rating (out of 5)
 * @property price - Price category ($, $$, $$$)
 * @property image - URL of the course image
 * @property description - Brief description of the course
 */
interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: string;
  description: string;
}

/**
 * Mock data for Atlanta golf courses
 * Note: This should be replaced with actual API data in production
 */
const golfCourses: GolfCourse[] = [
  {
    id: '1',
    name: 'East Lake Golf Club',
    location: 'Atlanta, GA',
    rating: 4.8,
    price: '$$$',
    image: 'https://example.com/eastlake.jpg',
    description: 'Historic course that hosts the TOUR Championship'
  },
  {
    id: '2',
    name: 'Atlanta Athletic Club',
    location: 'Johns Creek, GA',
    rating: 4.7,
    price: '$$$',
    image: 'https://example.com/aac.jpg',
    description: 'Prestigious private club with two championship courses'
  },
  {
    id: '3',
    name: 'Bobby Jones Golf Course',
    location: 'Atlanta, GA',
    rating: 4.2,
    price: '$',
    image: 'https://example.com/bobbyjones.jpg',
    description: 'Historic public course recently renovated'
  },
  {
    id: '4',
    name: 'TPC Sugarloaf',
    location: 'Duluth, GA',
    rating: 4.6,
    price: '$$',
    image: 'https://example.com/sugarloaf.jpg',
    description: 'Championship course designed by Greg Norman'
  },
  {
    id: '5',
    name: 'Chastain Park Golf Course',
    location: 'Atlanta, GA',
    rating: 3.8,
    price: '$',
    image: 'https://example.com/chastain.jpg',
    description: 'Popular public course in the heart of Buckhead'
  }
];

/**
 * ModalScreen Component
 * Displays a modal interface with:
 * - Quick access to start a new round
 * - List of recently played courses
 * - Navigation options
 */
export default function ModalScreen() {
  const router = useRouter();
  const { currentUser } = useAppStore();

  // Memoize recent courses
  const recentCourses = useMemo(() => golfCourses.slice(0, 3), []);

  // Memoize callback functions
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handlePlayGolf = useCallback(() => {
    router.push('/(tabs)/golf-courses' as const);
  }, [router]);

  const handleCoursePress = useCallback((course: GolfCourse) => {
    router.push({
      pathname: '/course-details',
      params: {
        id: course.id,
        name: course.name,
        location: course.location,
        rating: course.rating.toString(),
        price: course.price,
        description: course.description,
        image: course.image
      }
    });
  }, [router]);

  /**
   * Renders a single golf course item in the list
   * @param item - The golf course data to render
   * @returns A TouchableOpacity component displaying course information
   */
  const renderCourseItem = useCallback(({ item }: { item: GolfCourse }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseLocation}>{item.location}</Text>
        <Text style={styles.courseDescription}>{item.description}</Text>
        <View style={styles.courseDetails}>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color={colors.warning} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleCoursePress]);

  const keyExtractor = useCallback((item: GolfCourse) => item.id, []);

  // Show loading state when currentUser is not available
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header section with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Options</Text>
      </View>

      {/* Main content area */}
      <View style={styles.content}>
        {/* Quick start button */}
        <TouchableOpacity 
          style={styles.playButton}
          onPress={handlePlayGolf}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="play-circle" size={24} color={colors.white} style={styles.playIcon} />
          <Text style={styles.playButtonText}>Play Golf</Text>
        </TouchableOpacity>

        {/* Visual separator */}
        <View style={styles.separator} />
        
        {/* Recent courses section */}
        <Text style={styles.sectionTitle}>Recent Courses</Text>
        <FlatList
          data={recentCourses}
          renderItem={renderCourseItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent courses</Text>
            </View>
          }
        />
      </View>

      {/* Platform-specific status bar */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

/**
 * Styles for the ModalScreen component
 * Defines the visual appearance of all UI elements
 */
const styles = StyleSheet.create({
  // Container styles
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
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  // Content styles
  content: {
    flex: 1,
    padding: 16,
  },
  // Play button styles
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  playIcon: {
    marginRight: 12,
  },
  playButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Separator styles
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  // Section title styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  // Course card styles
  courseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
