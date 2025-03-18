import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { CHARLIE_YATES_COORDINATES, HOLE_COORDINATES } from './config/maps';

interface HoleViewParams {
  holeNumber?: string;
  courseId?: string;
}

export default function HoleViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as HoleViewParams;
  const holeNumber = parseInt(params.holeNumber || '1');
  const holeCoordinates = HOLE_COORDINATES[holeNumber as keyof typeof HOLE_COORDINATES] || CHARLIE_YATES_COORDINATES;

  const initialRegion = {
    ...holeCoordinates,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const handleBackToScorecard = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={holeCoordinates}
          title={`Hole ${holeNumber}`}
          description="Current Hole"
        />
      </MapView>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackToScorecard}
      >
        <Text style={styles.backButtonText}>Back to Scorecard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 