import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Image, 
  Alert,
  Modal,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: any;
  description: string;
  holes: number;
  par: number;
}

// Mock data for Atlanta golf courses with local images
const golfCourses: GolfCourse[] = [
  {
    id: '1',
    name: 'East Lake Golf Club',
    location: 'Atlanta, GA',
    rating: 4.8,
    price: '$$$',
    image: require('@/assets/images/golf-courses/east-lake.jpg'),
    description: 'Historic course that hosts the TOUR Championship',
    holes: 18,
    par: 72
  },
  {
    id: '2',
    name: 'Atlanta Athletic Club',
    location: 'Johns Creek, GA',
    rating: 4.7,
    price: '$$$',
    image: require('@/assets/images/golf-courses/atlanta-athletic.jpg'),
    description: 'Prestigious private club with two championship courses',
    holes: 18,
    par: 72
  },
  {
    id: '3',
    name: 'Bobby Jones Golf Course',
    location: 'Atlanta, GA',
    rating: 4.2,
    price: '$',
    image: require('@/assets/images/golf-courses/bobby-jones.jpg'),
    description: 'Historic public course recently renovated',
    holes: 9,
    par: 35
  },
  {
    id: '4',
    name: 'TPC Sugarloaf',
    location: 'Duluth, GA',
    rating: 4.6,
    price: '$$',
    image: require('@/assets/images/golf-courses/tpc-sugarloaf.jpg'),
    description: 'Championship course designed by Greg Norman',
    holes: 18,
    par: 72
  },
  {
    id: '5',
    name: 'Chastain Park Golf Course',
    location: 'Atlanta, GA',
    rating: 3.8,
    price: '$',
    image: require('@/assets/images/golf-courses/chastain-park.jpg'),
    description: 'Popular public course in the heart of Buckhead',
    holes: 18,
    par: 72
  }
];

export default function GolfCoursesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCoursePress = (course: GolfCourse) => {
    setSelectedCourse(course);
    setModalVisible(true);
  };

  const handleStartRound = () => {
    if (!selectedCourse) return;
    
    try {
      router.push({
        pathname: '/round-settings',
        params: {
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          holes: selectedCourse.holes,
          par: selectedCourse.par
        }
      });
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Unable to start round. Please try again.');
    }
  };

  const handleViewDetails = () => {
    if (!selectedCourse) return;
    
    try {
      router.push({
        pathname: '/course-details',
        params: {
          id: selectedCourse.id
        }
      });
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Unable to view course details. Please try again.');
    }
  };

  const filteredCourses = golfCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseCard = ({ item }: { item: GolfCourse }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
    >
      <Image 
        source={item.image} 
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseLocation}>{item.location}</Text>
        <View style={styles.courseDetails}>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color={colors.primary} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.priceText}>{item.price}</Text>
          <Text style={styles.holesText}>{item.holes} holes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedCourse?.name}</Text>
            <Text style={styles.modalDescription}>{selectedCourse?.description}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.viewDetailsButton]}
                onPress={handleViewDetails}
              >
                <FontAwesome name="info-circle" size={20} color={colors.primary} />
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.startRoundButton]}
                onPress={handleStartRound}
              >
                <FontAwesome name="flag" size={20} color={colors.white} />
                <Text style={styles.startRoundText}>Start Round</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 14,
    color: colors.textSecondary,
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
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.text,
  },
  priceText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  holesText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  viewDetailsButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  startRoundButton: {
    backgroundColor: colors.primary,
  },
  viewDetailsText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  startRoundText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  closeButton: {
    alignItems: 'center',
    padding: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
}); 