import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import MapView, { Marker } from 'react-native-maps';
import Share from 'react-native-share';

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: string;
  price: string;
  description: string;
  distance?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  type?: string;
}

export default function CourseDetailsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<GolfCourse | null>(null);
  const params = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (!params.id) {
          throw new Error('Course ID is required');
        }

        // TODO: Replace with actual API call
        // For now, using mock data
        const mockCourse: GolfCourse = {
          id: params.id,
          name: "Bobby Jones Golf Course",
          location: "Atlanta, GA",
          rating: "4.5",
          price: "$75",
          description: "A historic golf course in the heart of Atlanta, offering a challenging yet enjoyable experience for golfers of all skill levels.",
          distance: "2.5",
          latitude: 33.8487,
          longitude: -84.3733,
          image: "https://example.com/bobby-jones.jpg",
          type: "Public"
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCourse(mockCourse);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course details');
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [params.id]);

  const handleStartRound = () => {
    if (!course) return;
    
    try {
      router.push({
        pathname: '/round-settings',
        params: {
          courseId: course.id,
          courseName: course.name
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Failed to navigate to round settings');
    }
  };

  const handleViewStats = () => {
    if (!course) return;
    
    try {
      router.push({
        pathname: '/course-stats',
        params: {
          courseId: course.id,
          courseName: course.name
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Failed to navigate to course stats');
    }
  };

  const handleShare = async () => {
    if (!course) return;
    
    try {
      const message = `Join me for a round at ${course.name}!\n\nLocation: ${course.location}\nRating: ${course.rating}\nPrice: ${course.price}\n\n${course.description}\n\nCheck it out on the Golf App!`;
      
      await Share.open({
        title: `Share ${course.name}`,
        message,
        type: 'text/plain',
      });
    } catch (error) {
      console.error('Share error:', error);
      setError('Failed to share course details');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Course not found'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const coordinates = course.latitude && course.longitude
    ? {
        latitude: course.latitude,
        longitude: course.longitude,
      }
    : undefined;

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
          <Text style={styles.title}>{course.name}</Text>
          <Text style={styles.courseName}>{course.location}</Text>
        </View>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {course.image ? (
          <Image 
            source={{ uri: course.image }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="golf" size={48} color={colors.textSecondary} />
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.infoText}>{course.rating}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>{course.price}</Text>
          </View>
          {course.distance && (
            <View style={styles.infoItem}>
              <Ionicons name="navigate" size={20} color="#666" />
              <Text style={styles.infoText}>{course.distance} km away</Text>
            </View>
          )}
        </View>

        <View style={styles.typeContainer}>
          <Text style={styles.typeLabel}>Course Type:</Text>
          <Text style={styles.typeValue}>{course.type || 'Public'}</Text>
        </View>

        <Text style={styles.description}>{course.description}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.startRoundButton]}
            onPress={handleStartRound}
          >
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.buttonText}>Start Round</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.statsButton]}
            onPress={handleViewStats}
          >
            <Ionicons name="stats-chart" size={24} color="#4CAF50" />
            <Text style={[styles.buttonText, styles.statsButtonText]}>Course Stats</Text>
          </TouchableOpacity>
        </View>

        {coordinates && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                ...coordinates,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              scrollEnabled={false}
            >
              <Marker
                coordinate={coordinates}
                title={course.name}
              />
            </MapView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  image: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: colors.background,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  typeContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  typeLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
  },
  typeValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  description: {
    padding: 16,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  startRoundButton: {
    backgroundColor: colors.primary,
  },
  statsButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statsButtonText: {
    color: colors.primary,
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 