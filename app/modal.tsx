import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { colors } from './constants/colors';

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: string;
  description: string;
}

// Mock data for Atlanta golf courses
const golfCourses: GolfCourse[] = [
  {
    id: '1',
    name: 'East Lake Golf Club',
    location: 'Atlanta, GA',
    rating: 4.8,
    price: '$$$',
    image: 'https://example.com/eastlake.jpg',
    description: 'Historic course that hosts the TOUR Championship'
  },
  {
    id: '2',
    name: 'Atlanta Athletic Club',
    location: 'Johns Creek, GA',
    rating: 4.7,
    price: '$$$',
    image: 'https://example.com/aac.jpg',
    description: 'Prestigious private club with two championship courses'
  },
  {
    id: '3',
    name: 'Bobby Jones Golf Course',
    location: 'Atlanta, GA',
    rating: 4.2,
    price: '$',
    image: 'https://example.com/bobbyjones.jpg',
    description: 'Historic public course recently renovated'
  },
  {
    id: '4',
    name: 'TPC Sugarloaf',
    location: 'Duluth, GA',
    rating: 4.6,
    price: '$$',
    image: 'https://example.com/sugarloaf.jpg',
    description: 'Championship course designed by Greg Norman'
  },
  {
    id: '5',
    name: 'Chastain Park Golf Course',
    location: 'Atlanta, GA',
    rating: 3.8,
    price: '$',
    image: 'https://example.com/chastain.jpg',
    description: 'Popular public course in the heart of Buckhead'
  }
];

export default function ModalScreen() {
  const router = useRouter();

  const renderCourseItem = ({ item }: { item: GolfCourse }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => {
        // Navigate to course details (to be implemented)
        console.log('Selected course:', item.name);
      }}
    >
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseLocation}>{item.location}</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Options</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => {
            // Navigate to golf courses list
            router.push('/golf-courses' as any);
          }}
        >
          <FontAwesome name="play-circle" size={24} color={colors.white} style={styles.playIcon} />
          <Text style={styles.playButtonText}>Play Golf</Text>
        </TouchableOpacity>

        <View style={styles.separator} />
        
        <Text style={styles.sectionTitle}>Recent Courses</Text>
        <FlatList
          data={golfCourses.slice(0, 3)}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
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
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  playIcon: {
    marginRight: 12,
  },
  playButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
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
});
