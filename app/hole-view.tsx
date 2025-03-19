import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Camera } from 'react-native-maps';
import { CHARLIE_YATES_COORDINATES, HOLE_COORDINATES } from './config/maps';

interface HoleViewParams { 
  holeNumber?: string;  
  courseId?: string;  
} 

interface MapDebugInfo {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  pitch: number;
}

interface HoleCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  heading: number;
  tilt: number;
  tee: {
    latitude: number;
    longitude: number;
  };
  green: {
    latitude: number;
    longitude: number;
  };
  hazards: {
    type: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    description: string;
  }[];
}

export default function HoleViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as HoleViewParams;
  const holeNumber = parseInt(params.holeNumber || '1');
  const holeCoordinates = HOLE_COORDINATES[holeNumber as keyof typeof HOLE_COORDINATES] || CHARLIE_YATES_COORDINATES as HoleCoordinates;
  
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('satellite');
  const [debugInfo, setDebugInfo] = useState<MapDebugInfo>({
    latitude: holeCoordinates.latitude,
    longitude: holeCoordinates.longitude,
    altitude: holeCoordinates.altitude || 0.0001, // Default altitude for zoom
    heading: holeCoordinates.heading,
    pitch: holeCoordinates.tilt,
  });

  const mapRef = useRef<MapView>(null);

  /** Ensure the map initializes with the correct 3D heading & tilt **/
  const handleMapReady = () => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: holeCoordinates.latitude,
          longitude: holeCoordinates.longitude,
        },
        heading: holeCoordinates.heading, // Rotate map correctly
        pitch: holeCoordinates.tilt, // Ensure 3D effect
        altitude: holeCoordinates.altitude || 0.0001, // Controls zoom level with default
      });

      setDebugInfo(prev => ({
        ...prev,
        heading: holeCoordinates.heading,
        pitch: holeCoordinates.tilt,
        altitude: holeCoordinates.altitude || 0.0001,
      }));
    }
  };

  /** Smoothly animate camera when the user changes holes **/
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: holeCoordinates.latitude,
          longitude: holeCoordinates.longitude,
        },
        heading: holeCoordinates.heading,
        pitch: holeCoordinates.tilt,
        altitude: holeCoordinates.altitude || 0.0001, // Controls zoom with default
      });
    }
  }, [holeNumber]); // Runs when holeNumber changes

  /** Toggle between Standard and Satellite views **/
  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

  /** Prevent UI lag by delaying region updates **/
  const handleRegionChange = (region: any) => {
    setTimeout(() => {
      setDebugInfo(prev => ({
        ...prev,
        latitude: region.latitude,
        longitude: region.longitude,
        altitude: Math.log2(40075016.685578488 / (region.latitudeDelta * 256)) || 0.0001, // Calculate zoom with fallback
      }));
    }, 500); // Delay to reduce frequent updates
  };

  /** Navigate back to Scorecard **/
  const handleBackToScorecard = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: holeCoordinates.latitude,
          longitude: holeCoordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
        mapType={mapType}
        onRegionChange={handleRegionChange}
        onMapReady={handleMapReady}
        rotateEnabled={true}
        pitchEnabled={true}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        <Marker
          coordinate={holeCoordinates.tee}
          title={`Hole ${holeNumber} Tee`}
          description="Tee Box"
        />
        <Marker
          coordinate={holeCoordinates.green}
          title={`Hole ${holeNumber} Green`}
          description="Green"
        />
        {holeCoordinates.hazards.map((hazard, index) => (
          <Marker
            key={index}
            coordinate={hazard.coordinates}
            title={`Hazard ${index + 1}`}
            description={hazard.description}
          />
        ))}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.mapTypeButton}
          onPress={toggleMapType}
        >
          <Text style={styles.buttonText}>
            {mapType === 'standard' ? 'Satellite View' : 'Standard View'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToScorecard}
        >
          <Text style={styles.backButtonText}>Back to Scorecard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.debugPanel}>
        <ScrollView style={styles.debugScroll}>
          <Text style={styles.debugTitle}>Map Debug Info</Text>
          <Text style={styles.debugText}>Latitude: {debugInfo.latitude.toFixed(6)}°</Text>
          <Text style={styles.debugText}>Longitude: {debugInfo.longitude.toFixed(6)}°</Text>
          <Text style={styles.debugText}>Altitude (Zoom): {(debugInfo.altitude || 0.0001).toFixed(2)}</Text>
          <Text style={styles.debugText}>Heading: {debugInfo.heading.toFixed(2)}°</Text>
          <Text style={styles.debugText}>Pitch: {debugInfo.pitch.toFixed(2)}°</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 12,
  },
  mapTypeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  debugPanel: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
  },
  debugScroll: { maxHeight: 200 },
  debugTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  debugText: { color: '#fff', fontSize: 12, marginBottom: 4 },
});
