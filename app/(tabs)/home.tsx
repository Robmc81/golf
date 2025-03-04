import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import * as Location from 'expo-location';
import { users, currentUser } from '@/mocks/users';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  backgroundImage: any; // Using any for require() type
}

interface FriendActivity {
  id: string;
  name: string;
  course: string;
  score: number;
  date: string;
  image?: string;
}

const WeatherSection = memo(function WeatherSection({ 
  weather, 
  location 
}: { 
  weather: WeatherData | null; 
  location: Location.LocationObject | null;
}): JSX.Element {
  return (
    <ImageBackground 
      source={weather?.backgroundImage || require('@/assets/images/weather/sunny.jpg')}
      style={styles.weatherContainer}
    >
      <View style={styles.weatherOverlay}>
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
    </ImageBackground>
  );
});

const ActivityCard = memo(function ActivityCard({ 
  activity, 
  onPress 
}: { 
  activity: FriendActivity; 
  onPress: (id: string) => void;
}): JSX.Element {
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return (
    <TouchableOpacity 
      style={styles.activityCard}
      onPress={() => onPress(activity.id)}
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
  );
});

export default function HomeScreen(): JSX.Element {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recentActivity, setRecentActivity] = useState<FriendActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const getWeatherBackground = useCallback((condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return require('@/assets/images/weather/sunny.jpg');
      case 'rain':
      case 'rainy':
        return require('@/assets/images/weather/rainy.jpg');
      case 'cloudy':
        return require('@/assets/images/weather/cloudy.jpg');
      case 'storm':
      case 'thunderstorm':
        return require('@/assets/images/weather/storm.jpg');
      case 'fog':
      case 'foggy':
        return require('@/assets/images/weather/foggy.jpg');
      default:
        return require('@/assets/images/weather/sunny.jpg');
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // In a real app, you would fetch weather data from a weather API
      // For now, we'll use mock data with different conditions
      const conditions = ['sunny', 'rainy', 'cloudy', 'storm', 'foggy'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      setWeather({
        temperature: Math.floor(Math.random() * 20) + 60, // Random temperature between 60-80
        condition: randomCondition.charAt(0).toUpperCase() + randomCondition.slice(1),
        icon: randomCondition === 'sunny' ? 'sunny' : 
              randomCondition === 'rainy' ? 'rainy' :
              randomCondition === 'cloudy' ? 'cloudy' :
              randomCondition === 'storm' ? 'thunderstorm' : 'cloudy',
        backgroundImage: getWeatherBackground(randomCondition)
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  }, [getWeatherBackground]);

  const fetchRecentActivity = useCallback(() => {
    // Get current user's friends
    const friendIds = currentUser.friends || [];
    const friends = users.filter(user => friendIds.includes(user.id));

    // Generate mock activity for friends
    const activity: FriendActivity[] = friends.map(friend => ({
      id: friend.id,
      name: friend.name,
      course: friend.favoriteCourse || 'Unknown Course', // Provide a default value
      score: Math.floor(Math.random() * 10) + 70, // Random score between 70-80
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
      image: friend.avatar
    }));

    // Sort by date (most recent first)
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setRecentActivity(activity.slice(0, 3)); // Show only the 3 most recent activities
  }, []);

  useEffect(() => {
    fetchWeather();
    fetchRecentActivity();
  }, [fetchWeather, fetchRecentActivity]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchWeather(),
      fetchRecentActivity()
    ]).finally(() => setRefreshing(false));
  }, [fetchWeather, fetchRecentActivity]);

  const handleStartRound = useCallback(() => {
    router.push('/(tabs)/golf-courses');
  }, [router]);

  const handleActivityPress = useCallback((activityId: string) => {
    router.push('/course-stats');
  }, [router]);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <WeatherSection weather={weather} location={location} />

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
          <ActivityCard 
            key={activity.id}
            activity={activity}
            onPress={handleActivityPress}
          />
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
    height: 200,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  weatherOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    paddingBottom: 20,
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