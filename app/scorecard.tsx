import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import { Text, View, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Player {
  id: string;
  username: string;
  scores: (number | null)[];
}

interface Props {
  courseName?: string;
  teeName?: string;
  roundId?: string;
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
  dataCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
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
});

export default function Scorecard({ 
  courseName = "Charlie Yates", 
  teeName = "Black",
  roundId: initialRoundId 
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [holes, setHoles] = useState<{ number: number; par: number }[]>([]);
  const [roundId, setRoundId] = useState<string | null>(initialRoundId || null);
  const [selectedCell, setSelectedCell] = useState<{
    playerId: string;
    holeNumber: number;
  } | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Fetch holes data from Supabase
  const fetchHoles = async () => {
    try {
      const { data, error } = await supabase
        .from('charlie_yates_holes')
        .select('*')
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

  // Load existing scores when round is created
  const loadExistingScores = async (roundId: string) => {
    try {
      const { data, error } = await supabase
        .from('charlie_yates_scorecards')
        .select('*')
        .eq('id', roundId);

      if (error) throw error;

      if (data && data.length > 0) {
        setPlayers(prev => prev.map(player => {
          if (player.id === data[0].user_id) {
            // Create scores array from individual hole columns
            const scores = Array(18).fill(null).map((_, index) => {
              const holeScore = data[0][`hole_${index + 1}_score`];
              return holeScore !== undefined ? holeScore : null;
            });
            return { ...player, scores };
          }
          return player;
        }));
      }
    } catch (error) {
      console.error('Error loading scores:', error);
    }
  };

  // Initialize the scorecard
  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([fetchHoles(), fetchPlayers()]);
        if (roundId) {
          await loadExistingScores(roundId);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [roundId]);

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
              <Text style={styles.rowHeader}>Par</Text>
            </View>
            {players.map((player) => (
              <View key={player.id} style={styles.playerNameCell}>
                <Text style={styles.playerName}>{player.username}</Text>
              </View>
            ))}
          </View>

          {/* Scrollable Scores Section */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.gridContainer}>
              {/* Header Row - Hole Numbers */}
              <View style={styles.gridRow}>
                {holes.map((hole) => (
                  <View key={hole.number} style={styles.headerCell}>
                    <Text style={styles.columnHeader}>{hole.number}</Text>
                  </View>
                ))}
              </View>

              {/* Par Row */}
              <View style={styles.gridRow}>
                {holes.map((hole) => (
                  <View key={hole.number} style={styles.dataCell}>
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
                      style={styles.dataCell}
                      onPress={() => {
                        console.log('Cell pressed:', {
                          playerId: player.id,
                          holeNumber: hole.number,
                          currentScore: player.scores[hole.number - 1]
                        });
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
        </View>
      </ScrollView>
      {scoreModal}
    </SafeAreaView>
  );
}