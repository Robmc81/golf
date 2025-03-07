import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * RoundSettingsScreen Component
 * Allows users to configure settings for their golf round including:
 * - Game type (competitive/casual)
 * - Statistics tracking preferences
 * - Number of players
 * 
 * These settings are passed to the active round screen when starting a new round.
 */
export default function RoundSettingsScreen() {
  // Initialize router for navigation
  const router = useRouter();
  // Get route parameters from previous screen
  const params = useLocalSearchParams();
  
  // State management for round settings
  const [isCompetitive, setIsCompetitive] = useState(false);
  const [trackPutts, setTrackPutts] = useState(true);
  const [trackGIR, setTrackGIR] = useState(true);
  const [trackFairways, setTrackFairways] = useState(true);
  const [numberOfPlayers, setNumberOfPlayers] = useState(1);

  /**
   * Handles starting a new round with selected settings
   * Navigates to active round screen with all settings passed as parameters
   */
  const handleStartRound = () => {
    router.push({
      pathname: '/active-round',
      params: {
        courseId: params.courseId,
        courseName: params.courseName,
        settings: JSON.stringify({
          isCompetitive,
          trackPutts,
          trackGIR,
          trackFairways,
          numberOfPlayers
        })
      }
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header section with back button and course info */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Round Settings</Text>
          <Text style={styles.courseName}>{params.courseName}</Text>
        </View>
      </View>

      {/* Scrollable content area */}
      <ScrollView style={styles.content}>
        {/* Game Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Type</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Competitive Round</Text>
            <Switch
              value={isCompetitive}
              onValueChange={setIsCompetitive}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isCompetitive ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Statistics Tracking Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics to Track</Text>
          {/* Putts tracking toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Putts</Text>
            <Switch
              value={trackPutts}
              onValueChange={setTrackPutts}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={trackPutts ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
          {/* Greens in Regulation tracking toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Greens in Regulation (GIR)</Text>
            <Switch
              value={trackGIR}
              onValueChange={setTrackGIR}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={trackGIR ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
          {/* Fairways hit tracking toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Fairways Hit</Text>
            <Switch
              value={trackFairways}
              onValueChange={setTrackFairways}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={trackFairways ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Number of Players Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Players</Text>
          <View style={styles.playerCountContainer}>
            {/* Decrease player count button */}
            <TouchableOpacity 
              style={styles.playerCountButton}
              onPress={() => setNumberOfPlayers(Math.max(1, numberOfPlayers - 1))}
            >
              <Ionicons name="remove" size={24} color="#4CAF50" />
            </TouchableOpacity>
            {/* Player count display */}
            <Text style={styles.playerCount}>{numberOfPlayers}</Text>
            {/* Increase player count button */}
            <TouchableOpacity 
              style={styles.playerCountButton}
              onPress={() => setNumberOfPlayers(Math.min(4, numberOfPlayers + 1))}
            >
              <Ionicons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Round Button */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartRound}
        >
          <Text style={styles.startButtonText}>Start Round</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Styles for the RoundSettingsScreen component
 * Defines the visual appearance of all UI elements
 */
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  // Text styles
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: '#666',
  },
  // Content styles
  content: {
    flex: 1,
  },
  // Section styles
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  // Setting row styles
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  // Player count styles
  playerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  playerCountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerCount: {
    fontSize: 24,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  // Start button styles
  startButton: {
    margin: 16,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 