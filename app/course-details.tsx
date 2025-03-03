import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import MapView, { Marker } from 'react-native-maps';

export default function CourseDetailsScreen() {
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
  }>();

  const coordinates = params.latitude && params.longitude
    ? {
        latitude: parseFloat(params.latitude),
        longitude: parseFloat(params.longitude),
      }
    : undefined;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{params.name}</Text>
        <Text style={styles.location}>{params.location}</Text>
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

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{params.rating}</Text>
          </View>
          <Text style={styles.price}>{params.price}</Text>
        </View>

        {params.distance && (
          <View style={styles.distanceContainer}>
            <FontAwesome name="map-marker" size={14} color={colors.textSecondary} />
            <Text style={styles.distance}>{params.distance} away</Text>
          </View>
        )}

        <Text style={styles.description}>{params.description}</Text>
      </View>
    </ScrollView>
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
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  mapContainer: {
    height: 200,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  distance: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
}); 