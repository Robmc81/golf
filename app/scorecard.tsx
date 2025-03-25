import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import { Text, View, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionContext } from './contexts/SessionContext';

interface Player {
  id: string;
  username: string;
  scores: (number | null)[];
}

interface Props {
  courseName?: string;
  teeName?: string;
  roundId?: string;
  loadActive?: string;
}

interface DatabaseRound {
  id: string;
  user_id: string;
  date_played: string;
  course: string;
  tee_box: string;
  weather_conditions: string | null;
  playing_partners: string[] | null;
  total_score: number | null;
  total_putts: number | null;
  total_fairways: number | null;
  total_gir: number | null;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

interface DatabaseScore {
  id: string;
  round_id: string;
  hole_number: number;
  score: number;
  putts: number | null;
  fairway_hit: boolean | null;
  gir: boolean | null;
  created_at: string;
  updated_at: string;
}

interface HoleScores {
  [key: `hole_${number}_score`]: number | null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  scorecard: {
    flex: 1,
  },
  scorecardContainer: {
    flexDirection: 'row',
  },
  leftColumn: {
    width: 100,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  headerCell: {
    backgroundColor: '#F5F5F5',
    height: 40,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    padding: 8,
  },
  rowHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  playerNameCell: {
    height: 40,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    padding: 8,
  },
  playerName: {
    fontSize: 14,
  },
  gridContainer: {
    backgroundColor: '#fff',
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    backgroundColor: '#F5F5F5',  // Light gray background for header cells
  },
  gridCellData: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    backgroundColor: '#fff',  // White background for data cells
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  rowData: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  scoreButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  scoreButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  scoreButtonText: {
    fontSize: 18,
    color: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  roundIdText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  debugOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 10,
    padding: 16,
    maxHeight: '50%',
    zIndex: 9999,
  },
  debugScroll: {
    maxHeight: 300,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  debugButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 5,
    zIndex: 9999,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
  },
  debugLogEntry: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  scorecardWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  scrollableContent: {
    flex: 1,
    marginRight: 50,
  },
  totalsColumn: {
    width: 50,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5E5',
    zIndex: 2,
  },
  totalCell: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#F5F5F5',
  },
  totalCellData: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  finishRoundButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  finishRoundText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default function Scorecard({ 
  courseName = "Charlie Yates", 
  teeName = "Black",
  roundId: initialRoundId,
  loadActive
}: Props) {
  const [session] = useSessionContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [holes, setHoles] = useState<{ number: number; par: number; handicap: number }[]>([]);
  const [roundId, setRoundId] = useState<string | null>(initialRoundId || null);
  const [selectedCell, setSelectedCell] = useState<{
    playerId: string;
    holeNumber: number;
  } | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);

  // Fetch holes data from Supabase
  const fetchHoles = async () => {
    try {
      const { data, error } = await supabase
        .from('charlie_yates_holes')
        .select('number, par, handicap')
        .order('number');
      
      if (error) throw error;
      setHoles(data || []);
    } catch (error) {
      console.error('Error fetching holes:', error);
    }
  };

  // Fetch available players from Supabase profiles
  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username');
      
      if (error) throw error;
      
      const playersWithScores = (data || []).map(player => ({
        id: player.id,
        username: player.username,
        scores: Array(18).fill(null)
      }));
      
      setPlayers(playersWithScores);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Create a custom logging function
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Modify loadActiveRound function
  const loadActiveRound = async () => {
    try {
      addDebugLog('Starting loadActiveRound...');
      
      if (!session?.user) {
        addDebugLog('No user on the session!');
        return null;
      }

      const userId = session.user.id;
      addDebugLog(`User ID from session: ${userId}`);

      addDebugLog('Querying charlie_yates_scorecards table...');
      const { data, error } = await supabase
        .from('charlie_yates_scorecards')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .eq('status', 'in_progress')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          addDebugLog('No active round found in database');
          return null;
        }
        addDebugLog(`Database error: ${error.message}`);
        throw error;
      }

      if (data) {
        addDebugLog(`Found active round: ${JSON.stringify(data, null, 2)}`);
        setRoundId(data.id);
        return data.id;
      }

      addDebugLog('No active round data returned');
      return null;
    } catch (error) {
      addDebugLog(`Unexpected error in loadActiveRound: ${error}`);
      return null;
    }
  };

  // Modify loadExistingScores to properly map the hole scores
  const loadExistingScores = async (roundId: string) => {
    try {
      addDebugLog(`Loading scores for round ID: ${roundId}`);
      const { data, error } = await supabase
        .from('charlie_yates_scorecards')
        .select('*')
        .eq('id', roundId)
        .single();

      if (error) {
        addDebugLog(`Error loading scores: ${error.message}`);
        throw error;
      }

      if (data) {
        addDebugLog('Found scorecard data, mapping scores...');
        // Update players with the correct scores
        setPlayers(prev => prev.map(player => {
          if (player.id === data.user_id) {
            // Map all 9 holes' scores, ensuring correct alignment
            const scores = Array(9).fill(null).map((_, index) => {
              const holeNumber = index + 1;
              const score = data[`hole_${holeNumber}_score`];
              addDebugLog(`Hole ${holeNumber}: Score = ${score}`);
              return score || null;
            });
            return { ...player, scores };
          }
          return player;
        }));
      } else {
        addDebugLog('No scorecard data found');
      }
    } catch (error) {
      addDebugLog(`Error in loadExistingScores: ${error}`);
      console.error('Error loading scores:', error);
    }
  };

  // Update finishRound function
  const finishRound = async (roundId: string) => {
    try {
      addDebugLog(`Finishing round: ${roundId}`);
      const currentTimestamp = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('charlie_yates_scorecards')
        .update({
          active: false,
          status: 'completed',
          date_round_ended: currentTimestamp,
          updated_at: currentTimestamp
        })
        .eq('id', roundId)
        .select();

      if (error) {
        addDebugLog(`Error finishing round: ${error.message}`);
        throw error;
      }

      addDebugLog('Round finished successfully');
      addDebugLog(`Round end time recorded: ${currentTimestamp}`);
      return data;
    } catch (error) {
      addDebugLog(`Unexpected error in finishRound: ${error}`);
      throw error;
    }
  };

  // Update the useEffect to check for session
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        if (!session?.user) {
          addDebugLog('No user on the session - redirecting to auth');
          router.replace('/(auth)');
          return;
        }

        let currentRoundId = null;

        if (loadActive === "true" || !initialRoundId) {
          currentRoundId = await loadActiveRound();
        } else if (initialRoundId) {
          currentRoundId = initialRoundId;
          setRoundId(initialRoundId);
        }

        await Promise.all([fetchHoles(), fetchPlayers()]);

        if (currentRoundId) {
          await loadExistingScores(currentRoundId);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        addDebugLog(`Initialization error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [session]); // Add session to dependencies

  // Update the saveScore function to be more explicit
  const saveScore = async (playerId: string, holeNumber: number, score: number) => {
    if (!roundId) {
      console.error('No roundId available');
      return;
    }

    console.log('Saving score:', { playerId, holeNumber, score, roundId });

    try {
      // First update local state for immediate UI feedback
      setPlayers(prevPlayers => {
        return prevPlayers.map(player => {
          if (player.id === playerId) {
            const newScores = [...player.scores];
            newScores[holeNumber - 1] = score;
            return { ...player, scores: newScores };
          }
          return player;
        });
      });

      // Create the column name based on the hole number
      const scoreColumn = `hole_${holeNumber}_score`;
      
      // Update the specific hole's score in the scorecard
      const { data, error } = await supabase
        .from('charlie_yates_scorecards')
        .update({
          [scoreColumn]: score,
          updated_at: new Date().toISOString()
        })
        .eq('id', roundId)
        .eq('user_id', playerId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully saved score to Supabase:', data);

    } catch (error) {
      console.error('Error saving score:', error);
      // Revert the local state if the save failed
      loadExistingScores(roundId);
      alert('Failed to save score. Please try again.');
    }
  };

  // Update the handleScoreSelect function
  const handleScoreSelect = async (score: number) => {
    if (!selectedCell) {
      console.error('No cell selected');
      return;
    }

    console.log('Score selected:', {
      playerId: selectedCell.playerId,
      holeNumber: selectedCell.holeNumber,
      score
    });

    try {
      // Prevent modal from closing before save completes
      await saveScore(selectedCell.playerId, selectedCell.holeNumber, score);
      console.log('Score saved successfully');
      setShowScoreModal(false);
      setSelectedCell(null);
    } catch (error) {
      console.error('Failed to save score:', error);
      alert('Failed to save score. Please try again.');
    }
  };

  // Add a helper function to calculate total score
  const calculateTotal = (scores: (number | null)[]): number => {
    return scores.reduce((sum: number, score) => sum + (score || 0), 0);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading scorecard...</Text>
      </View>
    );
  }

  const scoreModal = (
    <Modal
      visible={showScoreModal}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setShowScoreModal(false);
        setSelectedCell(null);
      }}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setShowScoreModal(false);
          setSelectedCell(null);
        }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedCell ? `Enter score for Hole ${selectedCell.holeNumber}` : 'Select Score'}
          </Text>
          <View style={styles.scoreButtons}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <TouchableOpacity
                key={score}
                style={styles.scoreButton}
                onPress={() => {
                  console.log('Score button pressed:', score);
                  handleScoreSelect(score);
                }}
              >
                <Text style={styles.scoreButtonText}>{score}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{courseName}</Text>
      </View>

      {/* Scorecard Grid */}
      <ScrollView style={styles.scorecard}>
        <View style={styles.scorecardContainer}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            <View style={styles.headerCell}>
              <Text style={styles.rowHeader}>Hole</Text>
            </View>
            <View style={styles.headerCell}>
              <Text style={styles.rowHeader}>HCP</Text>
            </View>
            <View style={styles.headerCell}>
              <Text style={styles.rowHeader}>Par</Text>
            </View>
            {players.map((player) => (
              <View key={player.id} style={styles.playerNameCell}>
                <Text style={styles.playerName}>{player.username}</Text>
              </View>
            ))}
          </View>

          <View style={styles.scorecardWrapper}>
            {/* Scrollable Content */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.scrollableContent}
            >
              <View style={styles.gridContainer}>
                {/* Header Row - Hole Numbers */}
                <View style={styles.gridRow}>
                  {holes.map((hole) => (
                    <View key={hole.number} style={styles.gridCell}>
                      <Text style={styles.columnHeader}>{hole.number}</Text>
                    </View>
                  ))}
                </View>

                {/* Handicap Row */}
                <View style={styles.gridRow}>
                  {holes.map((hole) => (
                    <View key={hole.number} style={styles.gridCellData}>
                      <Text style={styles.rowData}>{hole.handicap}</Text>
                    </View>
                  ))}
                </View>

                {/* Par Row */}
                <View style={styles.gridRow}>
                  {holes.map((hole) => (
                    <View key={hole.number} style={styles.gridCellData}>
                      <Text style={styles.rowData}>{hole.par}</Text>
                    </View>
                  ))}
                </View>

                {/* Player Scores */}
                {players.map((player) => (
                  <View key={player.id} style={styles.gridRow}>
                    {holes.map((hole) => (
                      <TouchableOpacity
                        key={hole.number}
                        style={styles.gridCellData}
                        onPress={() => {
                          addDebugLog(`Cell pressed - Hole ${hole.number}, Player ${player.username}`);
                          setSelectedCell({
                            playerId: player.id,
                            holeNumber: hole.number
                          });
                          setShowScoreModal(true);
                        }}
                      >
                        <Text style={styles.rowData}>
                          {player.scores[hole.number - 1] === null ? '-' : player.scores[hole.number - 1]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Fixed Totals Column */}
            <View style={styles.totalsColumn}>
              {/* Header Cell */}
              <View style={styles.totalCell}>
                <Text style={styles.totalText}>Total</Text>
              </View>

              {/* Empty Cell for Handicap Row */}
              <View style={styles.totalCellData}>
                <Text style={styles.totalText}></Text>
              </View>

              {/* Par Total */}
              <View style={styles.totalCellData}>
                <Text style={styles.totalText}>
                  {holes.reduce((sum, hole) => sum + hole.par, 0)}
                </Text>
              </View>

              {/* Player Score Totals */}
              {players.map((player) => (
                <View key={player.id} style={styles.totalCellData}>
                  <Text style={styles.totalText}>
                    {calculateTotal(player.scores)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      {scoreModal}
      
      {/* Update Finish Round Button */}
      <TouchableOpacity 
        style={styles.finishRoundButton}
        onPress={async () => {
          if (roundId) {
            try {
              await finishRound(roundId);
              router.push({
                pathname: "/round-summary",
                params: { roundId }
              });
            } catch (error) {
              console.error('Failed to finish round:', error);
              alert('Failed to finish round. Please try again.');
            }
          }
        }}
      >
        <Text style={styles.finishRoundText}>Finish Round</Text>
      </TouchableOpacity>

      {/* Existing footer */}
      <View style={styles.footer}>
        <Text style={styles.roundIdText}>Round ID: {roundId || 'Not available'}</Text>
      </View>

      {/* Debug Button */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={() => setShowDebugOverlay(!showDebugOverlay)}
      >
        <Text style={styles.debugButtonText}>
          {showDebugOverlay ? 'Hide Debug' : 'Show Debug'}
        </Text>
      </TouchableOpacity>

      {/* Debug Overlay */}
      {showDebugOverlay && (
        <View style={styles.debugOverlay}>
          <ScrollView style={styles.debugScroll}>
            {debugLogs.map((log, index) => (
              <View key={index} style={styles.debugLogEntry}>
                <Text style={styles.debugText}>{log}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}