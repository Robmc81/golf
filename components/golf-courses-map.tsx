import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../app/constants/colors';

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: any;
  description: string;
  distance?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface GolfCoursesMapProps {
  courses: GolfCourse[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onCoursePress: (course: GolfCourse) => void;
}

export const GolfCoursesMap: React.FC<GolfCoursesMapProps> = ({
  courses,
  userLocation,
  onCoursePress,
}) => {
  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : {
        latitude: 33.7490, // Atlanta coordinates
        longitude: -84.3880,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        provider="google"
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="You are here"
            pinColor={colors.primary}
          />
        )}
        {courses.map((course) => (
          course.coordinates && (
            <Marker
              key={course.id}
              coordinate={{
                latitude: course.coordinates.latitude,
                longitude: course.coordinates.longitude,
              }}
              title={course.name}
              description={course.location}
              onPress={() => onCoursePress(course)}
            >
              <View style={styles.markerContainer}>
                <FontAwesome name="flag" size={24} color={colors.primary} />
              </View>
            </Marker>
          )
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: colors.white,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
}); 