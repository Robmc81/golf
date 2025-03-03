import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import * as Location from 'expo-location';
import { GolfCoursesMap } from '@/components/golf-courses-map';

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: any; // Using require for local images
  description: string;
  distance?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Mock data for Atlanta golf courses with local images
const golfCourses: GolfCourse[] = [
  {
    id: '1',
    name: 'East Lake Golf Club',
    location: 'Atlanta, GA',
    rating: 4.8,
    price: '$$$',
    image: require('@/assets/images/golf-courses/east-lake.jpg'),
    description: 'Historic course that hosts the TOUR Championship',
    coordinates: {
      latitude: 33.7407,
      longitude: -84.3077
    }
  },
  {
    id: '2',
    name: 'Atlanta Athletic Club',
    location: 'Johns Creek, GA',
    rating: 4.7,
    price: '$$$',
    image: require('@/assets/images/golf-courses/atlanta-athletic.jpg'),
    description: 'Prestigious private club with two championship courses',
    coordinates: {
      latitude: 34.0289,
      longitude: -84.1987
    }
  },
  {
    id: '3',
    name: 'Bobby Jones Golf Course',
    location: 'Atlanta, GA',
    rating: 4.2,
    price: '$',
    image: require('@/assets/images/golf-courses/bobby-jones.jpg'),
    description: 'Historic public course recently renovated',
    coordinates: {
      latitude: 33.8017,
      longitude: -84.3889
    }
  },
  {
    id: '4',
    name: 'TPC Sugarloaf',
    location: 'Duluth, GA',
    rating: 4.6,
    price: '$$',
    image: require('@/assets/images/golf-courses/tpc-sugarloaf.jpg'),
    description: 'Championship course designed by Greg Norman',
    coordinates: {
      latitude: 34.0029,
      longitude: -84.1444
    }
  },
  {
    id: '5',
    name: 'Chastain Park Golf Course',
    location: 'Atlanta, GA',
    rating: 3.8,
    price: '$',
    image: require('@/assets/images/golf-courses/chastain-park.jpg'),
    description: 'Popular public course in the heart of Buckhead',
    coordinates: {
      latitude: 33.8757,
      longitude: -84.3797
    }
  }
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px padding on each side

export default function GolfCoursesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCourses, setNearbyCourses] = useState<GolfCourse[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      try {
        setLoading(true);
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Calculate distances and sort courses
        const coursesWithDistance = golfCourses.map(course => {
          if (!course.coordinates) return course;
          
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            course.coordinates.latitude,
            course.coordinates.longitude
          );
          
          return {
            ...course,
            distance
          };
        }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setNearbyCourses(coursesWithDistance);
      } catch (err) {
        setError('Error getting location');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${Math.round(distance * 10) / 10}km`;
  };

  const filteredCourses = searchQuery
    ? golfCourses.filter(course => 
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nearbyCourses;

  const renderCourseItem = ({ item }: { item: GolfCourse }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => {
        // Navigate to course details (to be implemented)
        console.log('Selected course:', item.name);
      }}
    >
      <Image 
        source={item.image} 
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseLocation}>{item.location}</Text>
        {item.distance && (
          <View style={styles.distanceContainer}>
            <FontAwesome name="map-marker" size={14} color={colors.textSecondary} />
            <Text style={styles.distance}>{formatDistance(item.distance)} away</Text>
          </View>
        )}
        <Text style={styles.courseDescription}>{item.description}</Text>
        <View style={styles.courseDetails}>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleCoursePress = (course: GolfCourse) => {
    // Navigate to course details (to be implemented)
    console.log('Selected course:', course.name);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding courses near you...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (viewMode === 'map') {
      return (
        <GolfCoursesMap
          courses={filteredCourses}
          userLocation={location?.coords}
          onCoursePress={handleCoursePress}
        />
      );
    }

    return (
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <FontAwesome name="list" size={20} color={viewMode === 'list' ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
            onPress={() => setViewMode('map')}
          >
            <FontAwesome name="map" size={20} color={viewMode === 'map' ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    width: CARD_WIDTH,
  },
  courseImage: {
    width: CARD_WIDTH,
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
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distance: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
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
    color: colors.textSecondary,
  },
  price: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
}); 