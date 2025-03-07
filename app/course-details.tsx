import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import MapView, { Marker, Region } from 'react-native-maps';
import { useAppStore } from '@/hooks/use-app-store';

interface CourseParams {
  id: string;
  name: string;
  location: string;
  rating: string;
  price: string;
  description: string;
  distance?: string;
  latitude?: string;
  longitude?: string;
  image?: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * CourseDetailsScreen Component
 * Displays detailed information about a golf course including:
 * - Course name and location
 * - Rating and pricing
 * - Course description
 * - Interactive map
 * - Options to start a round or view course statistics
 */
export default function CourseDetailsScreen() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  
  // Get route parameters with type safety
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    location: string;
    rating: string;
    price: string;
    description: string;
    distance?: string;
    latitude?: string;
    longitude?: string;
    image?: string;
  }>();

  // Parse coordinates for map display if available
  const coordinates = useMemo(() => {
    if (!params.latitude || !params.longitude) return undefined;
    
    return {
      latitude: parseFloat(params.latitude),
      longitude: parseFloat(params.longitude),
    } as Coordinates;
  }, [params.latitude, params.longitude]);

  // Calculate initial region for map
  const initialRegion = useMemo(() => {
    if (!coordinates) return undefined;
    
    return {
      ...coordinates,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    } as Region;
  }, [coordinates]);

  /**
   * Navigate to round settings screen
   * Passes course information as route parameters
   */
  const handleStartRound = useCallback(() => {
    router.push({
      pathname: '/round-settings',
      params: {
        courseId: params.id,
        courseName: params.name
      }
    });
  }, [router, params.id, params.name]);

  /**
   * Navigate to course statistics screen
   * Passes course information as route parameters
   */
  const handleViewStats = useCallback(() => {
    router.push({
      pathname: '/course-stats',
      params: {
        courseId: params.id,
        courseName: params.name
      }
    });
  }, [router, params.id, params.name]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

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
          <Text style={styles.title}>{params.name}</Text>
          <Text style={styles.courseName}>{params.location}</Text>
        </View>
      </View>

      {/* Scrollable content area */}
      <ScrollView style={styles.content}>
        {/* Course image */}
        {params.image && (
          <Image 
            source={{ uri: params.image }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        {/* Course information section */}
        <View style={styles.infoContainer}>
          {/* Rating display */}
          <View style={styles.infoItem}>
            <Ionicons name="star" size={20} color={colors.warning} />
            <Text style={styles.infoText}>{params.rating}</Text>
          </View>
          {/* Price display */}
          <View style={styles.infoItem}>
            <Ionicons name="cash" size={20} color={colors.success} />
            <Text style={styles.infoText}>{params.price}</Text>
          </View>
          {/* Distance display (if available) */}
          {params.distance && (
            <View style={styles.infoItem}>
              <Ionicons name="navigate" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{params.distance} km away</Text>
            </View>
          )}
        </View>

        {/* Course type information */}
        <View style={styles.typeContainer}>
          <Text style={styles.typeLabel}>Course Type:</Text>
          <Text style={styles.typeValue}>Public</Text>
        </View>

        {/* Course description */}
        <Text style={styles.description}>{params.description}</Text>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          {/* Start round button */}
          <TouchableOpacity 
            style={[styles.button, styles.startRoundButton]}
            onPress={handleStartRound}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="play-circle" size={24} color={colors.white} />
            <Text style={styles.buttonText}>Start Round</Text>
          </TouchableOpacity>

          {/* View stats button */}
          <TouchableOpacity 
            style={[styles.button, styles.statsButton]}
            onPress={handleViewStats}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="stats-chart" size={24} color={colors.success} />
            <Text style={[styles.buttonText, styles.statsButtonText]}>Course Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Interactive map (if coordinates are available) */}
        {coordinates && initialRegion && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={initialRegion}
              scrollEnabled={false}
            >
              <Marker
                coordinate={coordinates}
                title={params.name}
              />
            </MapView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Styles for the CourseDetailsScreen component
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
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  // Text styles
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
  // Content styles
  content: {
    flex: 1,
  },
  // Image styles
  image: {
    width: '100%',
    height: 250,
  },
  // Info container styles
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 4,
    color: colors.textSecondary,
  },
  // Type container styles
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: colors.text,
  },
  typeValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  // Description styles
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  // Button container styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  startRoundButton: {
    backgroundColor: colors.primary,
  },
  statsButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.success,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: colors.white,
  },
  statsButtonText: {
    color: colors.success,
  },
  // Map styles
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
}); 