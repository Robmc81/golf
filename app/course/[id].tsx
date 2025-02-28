import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import Colors from '@/constants/colors';
import { Button } from '@/components/Button';
import { MapPin, Flag, Info, ChevronDown, ChevronUp, Play, LogOut } from 'lucide-react-native';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getCourse } = useAppStore();
  const { logout } = useAuthStore();
  const [selectedTee, setSelectedTee] = useState<string | null>(null);
  const [showAllHoles, setShowAllHoles] = useState(false);
  
  // Get course details
  const course = getCourse(id as string);
  
  if (!course) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Course not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline" 
        />
      </View>
    );
  }
  
  // Default selected tee to the first one
  if (!selectedTee && course.tees.length > 0) {
    setSelectedTee(course.tees[0].id);
  }
  
  // Get selected tee details
  const tee = course.tees.find(t => t.id === selectedTee);
  
  // Start a new round at this course
  const handleStartRound = () => {
    if (selectedTee) {
      router.push({
        pathname: '/new-round',
        params: { courseId: course.id, teeId: selectedTee }
      });
    }
  };
  
  // Toggle showing all holes
  const toggleShowAllHoles = () => {
    setShowAllHoles(!showAllHoles);
  };
  
  // Determine which holes to show
  const displayHoles = showAllHoles ? course.holes : course.holes.slice(0, 9);

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: () => {
            logout();
            router.replace('/');
          },
          style: "destructive"
        }
      ]
    );
  };

  // Logout button component for the header
  const LogoutButton = () => (
    <Pressable 
      onPress={handleLogout}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        padding: 8,
        marginRight: 8
      })}
    >
      <LogOut size={24} color={Colors.error} />
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: course.name,
          headerBackTitle: 'Courses',
          headerRight: () => <LogoutButton />
        }} 
      />
      
      {/* Course Image */}
      <Image source={{ uri: course.image }} style={styles.image} />
      
      {/* Course Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.courseName}>{course.name}</Text>
        
        <View style={styles.locationContainer}>
          <MapPin size={16} color={Colors.subtext} />
          <Text style={styles.location}>{course.location}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Par</Text>
            <Text style={styles.statValue}>{course.par}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>{course.rating}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Slope</Text>
            <Text style={styles.statValue}>{course.slope}</Text>
          </View>
        </View>
      </View>
      
      {/* Tee Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Tee</Text>
        
        <View style={styles.teeContainer}>
          {course.tees.map(tee => (
            <Pressable
              key={tee.id}
              style={[
                styles.teeButton,
                { backgroundColor: tee.color },
                selectedTee === tee.id && styles.selectedTee
              ]}
              onPress={() => setSelectedTee(tee.id)}
            >
              <Text style={[
                styles.teeName,
                { color: tee.color === '#FFFFFF' || tee.color === '#FFD700' ? '#000' : '#fff' }
              ]}>
                {tee.name}
              </Text>
            </Pressable>
          ))}
        </View>
        
        {tee && (
          <View style={styles.teeInfoContainer}>
            <View style={styles.teeInfoItem}>
              <Text style={styles.teeInfoLabel}>Rating</Text>
              <Text style={styles.teeInfoValue}>{tee.rating}</Text>
            </View>
            <View style={styles.teeInfoItem}>
              <Text style={styles.teeInfoLabel}>Slope</Text>
              <Text style={styles.teeInfoValue}>{tee.slope}</Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Course Layout */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Course Layout</Text>
          <Pressable onPress={toggleShowAllHoles} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {showAllHoles ? 'Show Front 9' : 'Show All Holes'}
            </Text>
            {showAllHoles ? (
              <ChevronUp size={16} color={Colors.primary} />
            ) : (
              <ChevronDown size={16} color={Colors.primary} />
            )}
          </Pressable>
        </View>
        
        <View style={styles.holeTableHeader}>
          <Text style={[styles.holeHeaderCell, styles.holeNumberCell]}>Hole</Text>
          <Text style={[styles.holeHeaderCell, styles.holeParCell]}>Par</Text>
          <Text style={[styles.holeHeaderCell, styles.holeDistanceCell]}>Yards</Text>
          <Text style={[styles.holeHeaderCell, styles.holeHandicapCell]}>HCP</Text>
        </View>
        
        {displayHoles.map(hole => (
          <View key={hole.number} style={styles.holeRow}>
            <Text style={[styles.holeCell, styles.holeNumberCell]}>{hole.number}</Text>
            <Text style={[styles.holeCell, styles.holeParCell]}>{hole.par}</Text>
            <Text style={[styles.holeCell, styles.holeDistanceCell]}>
              {selectedTee && hole.distance[selectedTee]}
            </Text>
            <Text style={[styles.holeCell, styles.holeHandicapCell]}>{hole.handicap}</Text>
          </View>
        ))}
        
        {/* Totals Row */}
        <View style={[styles.holeRow, styles.totalRow]}>
          <Text style={[styles.holeCell, styles.holeNumberCell, styles.totalCell]}>Total</Text>
          <Text style={[styles.holeCell, styles.holeParCell, styles.totalCell]}>
            {displayHoles.reduce((sum, hole) => sum + hole.par, 0)}
          </Text>
          <Text style={[styles.holeCell, styles.holeDistanceCell, styles.totalCell]}>
            {selectedTee && displayHoles.reduce((sum, hole) => sum + hole.distance[selectedTee], 0)}
          </Text>
          <Text style={[styles.holeCell, styles.holeHandicapCell, styles.totalCell]}></Text>
        </View>
      </View>
      
      {/* Start Round Button */}
      <View style={styles.actionContainer}>
        <Button
          title="Start Round at This Course"
          onPress={handleStartRound}
          variant="primary"
          fullWidth
          icon={<Play size={18} color="#fff" />}
        />
      </View>
      
      {/* Course Notes */}
      <View style={[styles.section, styles.notesSection]}>
        <View style={styles.notesHeader}>
          <Info size={16} color={Colors.subtext} />
          <Text style={styles.notesTitle}>Course Notes</Text>
        </View>
        <Text style={styles.notesText}>
          This is a beautiful course with challenging holes and stunning views.
          The signature hole is the par-3 7th with its island green.
          Be careful of water hazards on holes 5, 7, and 12.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  image: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: Colors.card,
  },
  courseName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: Colors.subtext,
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.darkBackground,
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  section: {
    padding: 20,
    backgroundColor: Colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  teeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  teeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedTee: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  teeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  teeInfoContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
  },
  teeInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  teeInfoLabel: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 4,
  },
  teeInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  holeTableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 10,
  },
  holeHeaderCell: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  holeNumberCell: {
    flex: 1,
  },
  holeParCell: {
    flex: 1,
  },
  holeDistanceCell: {
    flex: 1.5,
  },
  holeHandicapCell: {
    flex: 1,
  },
  holeRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  holeCell: {
    textAlign: 'center',
    color: Colors.text,
  },
  totalRow: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  totalCell: {
    fontWeight: '600',
  },
  actionContainer: {
    padding: 20,
  },
  notesSection: {
    backgroundColor: Colors.card,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 40,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.subtext,
    lineHeight: 20,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.subtext,
    marginBottom: 20,
  },
});