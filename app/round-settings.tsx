import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HoleSelectionModal from './hole-selection-modal';
import { useCourses } from './hooks/use-courses';
import { colors } from './constants/colors';
import { TeeSelectionModal } from './tee-selection-modal';
import { VisibilitySelectionModal } from './visibility-selection-modal';
import { GameTypeSelectionModal } from './game-type-selection-modal';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  handicap?: number;
  scores: (number | null)[];
  netScores: (number | null)[];
  gender?: 'male' | 'female';
  phone?: string;
  email?: string;
  isGuest?: boolean;
}

interface UserGroup {
  id: string;
  name: string;
  memberCount: number;
}

interface RoundSettings {
  courseId: string;
  courseName: string;
  courseSlug: string;
  startingHole: number;
  selectedTee: {
    color: string;
    gender: 'male' | 'female';
  } | null;
  visibility: Array<'everyone' | 'friends' | 'private' | 'group'>;
  selectedGroupIds: string[];
  gameType: string;
  roundType: string;
  players?: Player[];
  competitiveOptions?: {
    type: string;
    target: string;
  };
}

export default function RoundSettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { data: courses, isLoading } = useCourses();
  const [roundType, setRoundType] = useState('18');
  const [startingHole, setStartingHole] = useState(1);
  const [showHoleSelection, setShowHoleSelection] = useState(false);
  const [showTeeSelection, setShowTeeSelection] = useState(false);
  const [showVisibilitySelection, setShowVisibilitySelection] = useState(false);
  const [showGameTypeSelection, setShowGameTypeSelection] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'men' | 'women'>('men');
  const [selectedTee, setSelectedTee] = useState<{
    color: string;
    gender: 'male' | 'female';
  } | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<('everyone' | 'friends' | 'private' | 'group')[]>(['everyone']);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedGameType, setSelectedGameType] = useState('stroke');
  const [selectedCourse, setSelectedCourse] = useState(courses?.find(c => c._id === params.courseId));

  // Mock data for user groups - replace with actual data from your backend
  const userGroups: UserGroup[] = [
    { id: '1', name: 'Georgia Hackers', memberCount: 150 },
    { id: '2', name: 'Atlanta Golf Club', memberCount: 75 },
    { id: '3', name: 'Peachtree Golfers', memberCount: 200 },
  ];

  const handleGameTypeSelect = (gameType: string) => {
    setSelectedGameType(gameType);
    setShowGameTypeSelection(false);
  };

  const getGameTypeDisplay = () => {
    const gameTypes: { [key: string]: string } = {
      stroke: 'Stroke Play',
      tournament: 'Tournament',
      skins: 'Skins',
      match: 'Match Play',
      practice: 'Practice Round',
      scramble: 'Scramble',
      'me-vs-me': 'Me vs Me',
    };
    return gameTypes[selectedGameType] || 'Select Game Type';
  };

  const handleStartRound = () => {
    if (!selectedCourse) return;

    const settings: RoundSettings = {
      courseId: selectedCourse._id,
      courseName: selectedCourse.name,
      courseSlug: selectedCourse.slug,
      startingHole,
      selectedTee,
      visibility: selectedVisibility,
      selectedGroupIds,
      gameType: selectedGameType,
      roundType,
    };

    router.push({
      pathname: '/add-players' as any,
      params: { settings: JSON.stringify(settings) },
    });
  };

  const handleTeeSelect = (gender: 'men' | 'women', color: string) => {
    setSelectedGender(gender);
    setSelectedTee({
      color,
      gender: gender === 'men' ? 'male' : 'female',
    });
    setShowTeeSelection(false);
  };

  const handleVisibilitySelect = (visibility: 'everyone' | 'friends' | 'private' | 'group', groupId?: string) => {
    if (visibility === 'private') {
      // If selecting private, clear all other selections
      setSelectedVisibility(['private']);
      setSelectedGroupIds([]);
      return;
    }

    if (visibility === 'group' && groupId) {
      // Toggle group selection
      setSelectedGroupIds(prev => {
        if (prev.includes(groupId)) {
          return prev.filter(id => id !== groupId);
        }
        return [...prev, groupId];
      });
      return;
    }

    // Toggle visibility selection
    setSelectedVisibility(prev => {
      // If trying to deselect the last option, keep at least one option selected
      if (prev.length === 1 && prev.includes(visibility)) {
        return ['everyone']; // Default to 'everyone' if trying to deselect the last option
      }
      
      if (prev.includes(visibility)) {
        return prev.filter(v => v !== visibility);
      }
      return [...prev, visibility];
    });
  };

  const getTeeDisplay = () => {
    if (!selectedTee) return 'Select Tee';
    return `${selectedTee.color} Tees (${selectedTee.gender === 'male' ? 'Men' : 'Women'})`;
  };

  const getVisibilityDisplay = () => {
    if (selectedVisibility.includes('private')) {
      return 'Only Me';
    }

    const displayParts: string[] = [];
    
    if (selectedVisibility.includes('everyone')) {
      displayParts.push('Everyone');
    }
    if (selectedVisibility.includes('friends')) {
      displayParts.push('Friends');
    }
    if (selectedGroupIds.length > 0) {
      const groupNames = selectedGroupIds
        .map(id => userGroups.find(g => g.id === id)?.name)
        .filter((name): name is string => name !== undefined);
      displayParts.push(...groupNames);
    }

    return displayParts.length > 0 ? displayParts.join(', ') : 'Select Visibility';
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
          <Text style={styles.sectionTitle}>Select a Tee</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowTeeSelection(true)}
          >
            <Text style={styles.buttonText}>{getTeeDisplay()}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Round Visibility</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowVisibilitySelection(true)}
          >
            <Text style={styles.buttonText}>{getVisibilityDisplay()}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Type</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowGameTypeSelection(true)}
          >
            <Text style={styles.buttonText}>{getGameTypeDisplay()}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
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

      <TeeSelectionModal
        visible={showTeeSelection}
        onClose={() => setShowTeeSelection(false)}
        onSelect={handleTeeSelect}
        selectedGender={selectedGender}
        selectedTee={selectedTee}
      />

      <VisibilitySelectionModal
        visible={showVisibilitySelection}
        onClose={() => setShowVisibilitySelection(false)}
        onSelect={handleVisibilitySelect}
        selectedVisibility={selectedVisibility}
        selectedGroupIds={selectedGroupIds}
      />

      <GameTypeSelectionModal
        visible={showGameTypeSelection}
        onClose={() => setShowGameTypeSelection(false)}
        onSelect={handleGameTypeSelect}
        selectedGameType={selectedGameType}
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
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
}); 