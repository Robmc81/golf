import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import HoleSelectionModal from './hole-selection-modal';
import { useCourses } from './hooks/use-courses';
import { colors } from './constants/colors';
import { TeeSelectionModal } from './tee-selection-modal';
import { VisibilitySelectionModal } from './visibility-selection-modal';
import { GameTypeSelectionModal } from './game-type-selection-modal';
import { supabase } from './lib/supabase';

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

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  handicap: number | null;
  avatar_url: string | null;
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
  const [selectedPlayers, setSelectedPlayers] = useState<Profile[]>([]);

  // Mock data for user groups - replace with actual data from your backend
  const userGroups: UserGroup[] = [
    { id: '1', name: 'Georgia Hackers', memberCount: 150 },
    { id: '2', name: 'Atlanta Golf Club', memberCount: 75 },
    { id: '3', name: 'Peachtree Golfers', memberCount: 200 },
  ];

  // Update the useEffect to handle selected players from params
  useEffect(() => {
    if (params.selectedPlayers) {
      try {
        const players = JSON.parse(params.selectedPlayers as string);
        setSelectedPlayers(players);
      } catch (error) {
        console.error('Error parsing selected players:', error);
      }
    }
  }, [params.selectedPlayers]);

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

  const handleStartRound = async () => {
    if (!selectedCourse) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user found');

      // First check for an active round
      const { data: activeRound, error: activeRoundError } = await supabase
        .from('charlie_yates_scorecards')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('active', true)
        .single();

      if (activeRoundError && activeRoundError.code !== 'PGRST116') {
        console.error('Error checking active round:', activeRoundError);
        throw activeRoundError;
      }

      // If there's an active round, navigate to it
      if (activeRound) {
        console.log('Found active round:', activeRound);
        router.push({
          pathname: '/hole-view',
          params: {
            roundId: activeRound.id,
            courseName: params.courseName,
            teeName: activeRound.tee_box,
            courseId: selectedCourse._id,
            holeNumber: startingHole.toString()
          }
        });
        return;
      }

      // Generate a numeric round group ID using timestamp
      const roundGroupId = Date.now();
      console.log('Creating new round with group ID:', roundGroupId);

      // Get current user's profile data
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, username')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching current user profile:', profileError);
        throw profileError;
      }

      console.log('Current user profile:', currentUserProfile);

      // Create scorecard entries for all players including the current user
      const allPlayers = [
        { 
          id: session.user.id,
          username: currentUserProfile.username || 
                   `${currentUserProfile.first_name} ${currentUserProfile.last_name}` ||
                   session.user.email
        },
        ...selectedPlayers.map(player => ({
          id: player.id,
          username: player.username || `${player.first_name} ${player.last_name}`
        }))
      ];

      console.log('All players with usernames:', allPlayers);

      const scorecardData = allPlayers.map(player => ({
        user_id: player.id,
        username: player.username, // Now using the correct username
        round_group_id: roundGroupId,
        date_played: new Date().toISOString(),
        tee_box: selectedTee?.color || 'Black',
        weather_conditions: null,
        tournament_round: false,
        active: true,
        status: 'in_progress',
        // Initialize all hole data
        hole_1_score: null,
        hole_1_putts: null,
        hole_1_fairway: null,
        hole_1_gir: null,
        hole_1_notes: null,
        hole_2_score: null,
        hole_2_putts: null,
        hole_2_fairway: null,
        hole_2_gir: null,
        hole_2_notes: null,
        hole_3_score: null,
        hole_3_putts: null,
        hole_3_fairway: null,
        hole_3_gir: null,
        hole_3_notes: null,
        hole_4_score: null,
        hole_4_putts: null,
        hole_4_fairway: null,
        hole_4_gir: null,
        hole_4_notes: null,
        hole_5_score: null,
        hole_5_putts: null,
        hole_5_fairway: null,
        hole_5_gir: null,
        hole_5_notes: null,
        hole_6_score: null,
        hole_6_putts: null,
        hole_6_fairway: null,
        hole_6_gir: null,
        hole_6_notes: null,
        hole_7_score: null,
        hole_7_putts: null,
        hole_7_fairway: null,
        hole_7_gir: null,
        hole_7_notes: null,
        hole_8_score: null,
        hole_8_putts: null,
        hole_8_fairway: null,
        hole_8_gir: null,
        hole_8_notes: null,
        hole_9_score: null,
        hole_9_putts: null,
        hole_9_fairway: null,
        hole_9_gir: null,
        hole_9_notes: null,
        total_score: 0,
        total_putts: 0,
        fairways_hit: 0,
        greens_hit: 0,
        total_fairways: 0,
        total_gir: 0
      }));

      console.log('Final scorecard data to be inserted:', scorecardData);

      // Insert all scorecards at once
      const { data: roundData, error } = await supabase
        .from('charlie_yates_scorecards')
        .insert(scorecardData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        alert(`Failed to create round: ${error.message}`);
        return;
      }

      if (!roundData || roundData.length === 0) {
        console.error('No round data returned after insert');
        alert('Failed to create round: No data returned');
        return;
      }

      console.log('Successfully created rounds:', roundData);

      // Find the current user's scorecard from the inserted data
      const userScorecard = roundData.find(card => card.user_id === session.user.id);
      if (!userScorecard) {
        console.error('Could not find user scorecard in created rounds');
        alert('Failed to create round: User scorecard not found');
        return;
      }

      console.log('Navigating to hole view with scorecard:', userScorecard);

      // Navigate to hole view with both roundId and roundGroupId
      router.push({
        pathname: '/hole-view',
        params: {
          roundId: userScorecard.id,
          roundGroupId: userScorecard.round_group_id,
          courseName: params.courseName,
          teeName: selectedTee?.color || 'Black',
          courseId: selectedCourse._id,
          holeNumber: startingHole.toString()
        }
      });

    } catch (error) {
      console.error('Error in handleStartRound:', error);
      alert(`Failed to create round: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  const handleAddPlayers = () => {
    router.push("/add-players");
  };

  const renderSelectedPlayers = () => {
    if (selectedPlayers.length === 0) {
      return (
        <Text style={styles.noPlayersText}>No players added</Text>
      );
    }

    return (
      <View style={styles.selectedPlayersContainer}>
        {selectedPlayers.map((player) => (
          <View key={player.id} style={styles.selectedPlayerItem}>
            <View style={styles.playerAvatarContainer}>
              {player.avatar_url ? (
                <Image source={{ uri: player.avatar_url }} style={styles.playerAvatar} />
              ) : (
                <View style={styles.playerAvatarPlaceholder}>
                  <Text style={styles.playerAvatarText}>
                    {player.first_name && player.last_name ? 
                      `${player.first_name[0]}${player.last_name[0]}` : 
                      '??'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {`${player.first_name} ${player.last_name}`}
              </Text>
              {player.handicap !== null && (
                <Text style={styles.playerHandicap}>
                  Handicap: {player.handicap}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleAddPlayers}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="people-outline" size={24} color={colors.text} />
              <Text style={styles.buttonText}>
                {selectedPlayers.length > 0 
                  ? `${selectedPlayers.length} Players Selected` 
                  : 'Add Players'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
          {renderSelectedPlayers()}
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedPlayersContainer: {
    marginTop: 16,
  },
  selectedPlayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  playerAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  playerAvatar: {
    width: '100%',
    height: '100%',
  },
  playerAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  playerHandicap: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noPlayersText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
}); 