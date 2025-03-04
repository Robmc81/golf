import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import * as Location from 'expo-location';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

interface FriendActivity {
  id: string;
  name: string;
  course: string;
  score: number;
  date: string;
  image?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recentActivity, setRecentActivity] = useState<FriendActivity[]>([
    {
      id: '1',
      name: 'John Doe',
      course: 'Pine Valley Golf Club',
      score: 72,
      date: '2024-03-20',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: '2',
      name: 'Jane Smith',
      course: 'Augusta National',
      score: 75,
      date: '2024-03-19',
      image: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      course: 'St Andrews Links',
      score: 78,
      date: '2024-03-18',
      image: 'https://randomuser.me/api/portraits/men/2.jpg'
    }
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    fetchWeather();
  }, [location]);

  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // In a real app, you would fetch weather data from a weather API
      // For now, we'll use mock data
      setWeather({
        temperature: 72,
        condition: 'Sunny',
        icon: 'sunny'
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchWeather().finally(() => setRefreshing(false));
  }, []);

  const handleStartRound = () => {
    router.push('/(tabs)/golf-courses');
  };

  const handleActivityPress = (activityId: string) => {
    router.push('/course-stats');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Weather Section */}
      <View style={styles.weatherContainer}>
        <View style={styles.weatherInfo}>
          <Ionicons 
            name={weather?.icon as any || 'sunny'} 
            size={40} 
            color="#FFD700" 
          />
          <View style={styles.weatherText}>
            <Text style={styles.temperature}>{weather?.temperature}°F</Text>
            <Text style={styles.condition}>{weather?.condition}</Text>
          </View>
        </View>
        <Text style={styles.location}>
          {location ? 'Current Location' : 'Location unavailable'}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.startRoundButton}
          onPress={handleStartRound}
        >
          <Ionicons name="play-circle" size={24} color="#fff" />
          <Text style={styles.startRoundText}>Start a Round</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity) => (
          <TouchableOpacity 
            key={activity.id}
            style={styles.activityCard}
            onPress={() => handleActivityPress(activity.id)}
          >
            <Image 
              source={{ uri: activity.image }} 
              style={styles.activityImage}
            />
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.activityCourse}>{activity.course}</Text>
              <Text style={styles.activityScore}>Score: {activity.score}</Text>
              <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  weatherContainer: {
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherText: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  condition: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  quickActions: {
    padding: 20,
  },
  startRoundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startRoundText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  activitySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  activityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activityCourse: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityScore: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  activityDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
}); 