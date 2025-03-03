import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  image: any; // Using require for local images
  description: string;
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
    description: 'Historic course that hosts the TOUR Championship'
  },
  {
    id: '2',
    name: 'Atlanta Athletic Club',
    location: 'Johns Creek, GA',
    rating: 4.7,
    price: '$$$',
    image: require('@/assets/images/golf-courses/atlanta-athletic.jpg'),
    description: 'Prestigious private club with two championship courses'
  },
  {
    id: '3',
    name: 'Bobby Jones Golf Course',
    location: 'Atlanta, GA',
    rating: 4.2,
    price: '$',
    image: require('@/assets/images/golf-courses/bobby-jones.jpg'),
    description: 'Historic public course recently renovated'
  },
  {
    id: '4',
    name: 'TPC Sugarloaf',
    location: 'Duluth, GA',
    rating: 4.6,
    price: '$$',
    image: require('@/assets/images/golf-courses/tpc-sugarloaf.jpg'),
    description: 'Championship course designed by Greg Norman'
  },
  {
    id: '5',
    name: 'Chastain Park Golf Course',
    location: 'Atlanta, GA',
    rating: 3.8,
    price: '$',
    image: require('@/assets/images/golf-courses/chastain-park.jpg'),
    description: 'Popular public course in the heart of Buckhead'
  }
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // 16px padding on each side

export default function GolfCoursesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = golfCourses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseItem = ({ item }: { item: GolfCourse }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => {
        // Navigate to course details (to be implemented)
        console.log('Selected course:', item.name);
      }}
    >
      <Image 
        source={item.image} 
        style={styles.courseImage}
        resizeMode="cover"
      />
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
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome name="times-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    backgroundColor: colors.card,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    width: CARD_WIDTH,
  },
  courseImage: {
    width: CARD_WIDTH,
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
  courseDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
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