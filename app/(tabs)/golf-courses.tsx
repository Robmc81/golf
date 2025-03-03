import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
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

export default function GolfCoursesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbyCourses, setNearbyCourses] = useState<GolfCourse[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
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

  const handleRetryLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = nearbyCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseCard = ({ item }: { item: GolfCourse }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => router.push({
        pathname: '/course-details',
        params: {
          id: item.id,
          name: item.name,
          location: item.location,
          rating: item.rating,
          price: item.price,
          image: item.image,
          description: item.description,
          distance: item.distance?.toFixed(1)
        }
      } as any)}
    >
      <Image source={{ uri: item.image }} style={styles.courseImage} />
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseLocation}>{item.location}</Text>
        <View style={styles.courseDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.price}>{item.price}</Text>
          {item.distance && (
            <Text style={styles.distance}>{item.distance.toFixed(1)} km away</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding nearby courses...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetryLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontWeight: '600',
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
  },
  price: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
}); 