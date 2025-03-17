import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HoleSelectionModal from './hole-selection-modal';

export default function RoundSettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isCompetitive, setIsCompetitive] = useState(false);
  const [trackPutts, setTrackPutts] = useState(true);
  const [trackGIR, setTrackGIR] = useState(true);
  const [trackFairways, setTrackFairways] = useState(true);
  const [numberOfPlayers, setNumberOfPlayers] = useState(1);
  const [roundType, setRoundType] = useState('18');
  const [startingHole, setStartingHole] = useState(1);
  const [showHoleSelection, setShowHoleSelection] = useState(false);

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
          numberOfPlayers,
          roundType,
          startingHole
        })
      }
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Round Type</Text>
          <View style={styles.roundTypeContainer}>
            <TouchableOpacity 
              style={[styles.roundTypeButton, roundType === '18' && styles.roundTypeButtonActive]}
              onPress={() => setRoundType('18')}
            >
              <Text style={[styles.roundTypeText, roundType === '18' && styles.roundTypeTextActive]}>18 Holes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roundTypeButton, roundType === 'front9' && styles.roundTypeButtonActive]}
              onPress={() => setRoundType('front9')}
            >
              <Text style={[styles.roundTypeText, roundType === 'front9' && styles.roundTypeTextActive]}>Front 9</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roundTypeButton, roundType === 'back9' && styles.roundTypeButtonActive]}
              onPress={() => setRoundType('back9')}
            >
              <Text style={[styles.roundTypeText, roundType === 'back9' && styles.roundTypeTextActive]}>Back 9</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Starting From</Text>
          <TouchableOpacity 
            style={styles.startingHoleButton}
            onPress={() => setShowHoleSelection(true)}
          >
            <Text style={styles.startingHoleText}>Hole {startingHole}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics to Track</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Putts</Text>
            <Switch
              value={trackPutts}
              onValueChange={setTrackPutts}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={trackPutts ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Greens in Regulation (GIR)</Text>
            <Switch
              value={trackGIR}
              onValueChange={setTrackGIR}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={trackGIR ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Players</Text>
          <View style={styles.playerCountContainer}>
            <TouchableOpacity 
              style={styles.playerCountButton}
              onPress={() => setNumberOfPlayers(Math.max(1, numberOfPlayers - 1))}
            >
              <Ionicons name="remove" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.playerCount}>{numberOfPlayers}</Text>
            <TouchableOpacity 
              style={styles.playerCountButton}
              onPress={() => setNumberOfPlayers(Math.min(4, numberOfPlayers + 1))}
            >
              <Ionicons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartRound}
        >
          <Text style={styles.startButtonText}>Start Round</Text>
        </TouchableOpacity>
      </ScrollView>

      <HoleSelectionModal
        visible={showHoleSelection}
        onClose={() => setShowHoleSelection(false)}
        onSelect={setStartingHole}
        currentHole={startingHole}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
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
  roundTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roundTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  roundTypeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  roundTypeText: {
    fontSize: 16,
    color: '#333',
  },
  roundTypeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  startingHoleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  startingHoleText: {
    fontSize: 16,
    color: '#333',
  },
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