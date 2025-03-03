import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import MapView, { Marker } from 'react-native-maps';

export default function CourseDetailsScreen() {
  const router = useRouter();
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

  const coordinates = params.latitude && params.longitude
    ? {
        latitude: parseFloat(params.latitude),
        longitude: parseFloat(params.longitude),
      }
    : undefined;

  const handleStartRound = () => {
    router.push({
      pathname: '/round-settings',
      params: {
        courseId: params.id,
        courseName: params.name
      }
    } as any);
  };

  const handleViewStats = () => {
    router.push({
      pathname: '/course-stats',
      params: {
        courseId: params.id,
        courseName: params.name
      }
    } as any);
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
          <Text style={styles.title}>{params.name}</Text>
          <Text style={styles.courseName}>{params.location}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Image 
          source={{ uri: params.image as string }} 
          style={styles.image}
        />
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.infoText}>{params.rating}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>{params.price}</Text>
          </View>
          {params.distance && (
            <View style={styles.infoItem}>
              <Ionicons name="navigate" size={20} color="#666" />
              <Text style={styles.infoText}>{params.distance} km away</Text>
            </View>
          )}
        </View>

        <View style={styles.typeContainer}>
          <Text style={styles.typeLabel}>Course Type:</Text>
          <Text style={styles.typeValue}>Public</Text>
        </View>

        <Text style={styles.description}>{params.description}</Text>

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
                title={params.name}
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
  },
  typeValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
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
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  statsButtonText: {
    color: colors.primary,
  },
  mapContainer: {
    height: 200,
    width: '100%',
    marginTop: 16,
  },
  map: {
    flex: 1,
  },
}); 