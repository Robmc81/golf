import React from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { GolfCourse } from '@/types';
import Colors from '@/constants/colors';
import { MapPin } from 'lucide-react-native';

interface CourseCardProps {
  course: GolfCourse;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/course/${course.id}`);
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={handlePress}
    >
      <Image source={{ uri: course.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{course.name}</Text>
        <View style={styles.locationContainer}>
          <MapPin size={14} color={Colors.subtext} />
          <Text style={styles.location}>{course.location}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Par</Text>
            <Text style={styles.infoValue}>{course.par}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Rating</Text>
            <Text style={styles.infoValue}>{course.rating}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Slope</Text>
            <Text style={styles.infoValue}>{course.slope}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: Colors.subtext,
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
});