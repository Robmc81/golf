import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Camera } from 'react-native-maps';
import { HOLE_COORDINATES } from './config/maps';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './utils/supabaseClient';
import { useSessionContext } from './contexts/SessionContext';

interface HoleViewParams { 
  holeNumber?: string;  
  courseId?: string;  
  settings?: string;
} 

interface HoleCoordinates {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  tilt: number;
  tee: {
    latitude: number;
    longitude: number;
  };
  green: {
    latitude: number;
    longitude: number;
  };
  hazards: {
    type: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    description: string;
  }[];
}

interface ScoreEntry {
  playerId: string;
  playerName: string;
  score: number | null;
  putts: number | null;
  greenInRegulation: boolean | null;
  chipShots: number | null;
  greensideSand: number | null;
  penalties: number | null;
}

interface Player {
  id: string;
  username: string;
  scores: (number | null)[];
  roundId: string;
}

const saveScoresToBackend = async ({
  holeNumber,
  scores,
  courseId
}: {
  holeNumber: number;
  scores: ScoreEntry[];
  courseId?: string;
}) => {
  // TODO: Replace with actual API call
  console.log('Saving scores:', { holeNumber, scores, courseId });
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};

export default function HoleViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as HoleViewParams;
  const settings = params.settings ? JSON.parse(params.settings as string) : null;
  const holeNumber = parseInt(params.holeNumber || '1');
  const holeCoordinates = HOLE_COORDINATES[holeNumber as keyof typeof HOLE_COORDINATES];
  
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('satellite');
  const mapRef = useRef<MapView>(null);

  const [showGreenView, setShowGreenView] = useState(false);
  const [showWindSlope, setShowWindSlope] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [players] = useState<Player[]>([
    { id: '1', username: 'Player 1', scores: [], roundId: '' },
    { id: '2', username: 'Player 2', scores: [], roundId: '' },
    { id: '3', username: 'Player 3', scores: [], roundId: '' },
    { id: '4', username: 'Player 4', scores: [], roundId: '' },
  ]);
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0].id);
  const [showNextHolePrompt, setShowNextHolePrompt] = useState(false);

  // Update the state type to make altitude optional
  const [debugInfo, setDebugInfo] = useState({
    latitude: holeCoordinates.latitude,
    longitude: holeCoordinates.longitude,
    latitudeDelta: holeCoordinates.latitudeDelta,
    longitudeDelta: holeCoordinates.longitudeDelta,
    heading: holeCoordinates.heading,
    altitude: null,  // or undefined
  });

  const [session] = useSessionContext();
  const [selectedCell, setSelectedCell] = useState<{
    playerId: string;
    holeNumber: number;
  } | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);

  // Add state for hole data
  const [holeData, setHoleData] = useState<{
    par: number;
    handicap: number;
  } | null>(null);

  // Add to your state declarations
  const [teeBox, setTeeBox] = useState<string>('');

  // Add this state for all players in the round
  const [roundPlayers, setRoundPlayers] = useState<Player[]>([]);

  /** Initialize map view when ready **/
  const handleMapReady = () => {
    if (mapRef.current) {
      const exactValues = {
        latitude: holeCoordinates.latitude,
        longitude: holeCoordinates.longitude,
        latitudeDelta: holeCoordinates.latitudeDelta,
        longitudeDelta: holeCoordinates.longitudeDelta,
      };

      // Set exact values from maps.ts
      setDebugInfo({
        ...exactValues,
        heading: holeCoordinates.heading,
        altitude: null,
      });

      // Use exact same values for animation
      mapRef.current.animateToRegion(exactValues, 1000);

      // Set the camera heading and pitch separately
      mapRef.current.setCamera({
        center: {
          latitude: holeCoordinates.latitude,
          longitude: holeCoordinates.longitude,
        },
        heading: holeCoordinates.heading,
        pitch: holeCoordinates.tilt,
      });
    }
  };

  /** Update view when hole changes **/
  useEffect(() => {
    handleMapReady();
  }, [holeNumber]);

  /** Toggle between Standard and Satellite views **/
  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

  /** Update debug info when region changes **/
  const handleRegionChange = (region: any) => {
    setDebugInfo(prev => ({
      ...prev,
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
      heading: region.heading || prev.heading,
    }));
  };

  /** Navigate back to Scorecard **/
  const handleBackToScorecard = () => {
    router.push({
      pathname: "/scorecard",
      params: {
        loadActive: "true"
      }
    });
  };

  /** Handle score entry **/
  const handleScoreEntry = () => {
    console.log('handleScoreEntry called');
    if (!roundId) {
      console.error('No active round found in handleScoreEntry');
      alert('No active round found. Please start a round first.');
      return;
    }
    
    setShowScoreModal(true);
  };

  const handleScoreSelect = async (score: number) => {
    if (!selectedCell) {
      console.error('No cell selected');
      return;
    }

    if (!session?.user) {
      console.error('No user session');
      return;
    }

    if (!roundId) {
      console.error('No round ID available');
      return;
    }

    console.log('Score selected:', {
      playerId: selectedCell.playerId,
      holeNumber: selectedCell.holeNumber,
      score,
      roundId
    });

    try {
      await saveScore(selectedCell.playerId, selectedCell.holeNumber, score);
      console.log('Score saved successfully');
      setShowScoreModal(false);
      setSelectedCell(null);
      setShowNextHolePrompt(true);
    } catch (error) {
      console.error('Failed to save score:', error);
      alert('Failed to save score. Please try again.');
    }
  };

  const handleSaveScore = async () => {
    try {
      // TODO: Implement API call to save scores
      await saveScoresToBackend({
        holeNumber,
        scores: players.map(player => ({
          playerId: player.id,
          playerName: player.username,
          score: player.scores[holeNumber - 1],
          putts: null,
          greenInRegulation: null,
          chipShots: null,
          greensideSand: null,
          penalties: null
        })),
        courseId: params.courseId
      });
      
      setShowScoreModal(false);
      setShowNextHolePrompt(true);
    } catch (error) {
      console.error('Failed to save scores:', error);
      // TODO: Show error message to user
    }
  };

  const handleNextHole = () => {
    const nextHole = holeNumber + 1;
    if (nextHole <= 18) {
      router.replace({
        pathname: "/hole-view",
        params: {
          holeNumber: nextHole.toString(),
          ...(params.courseId ? { courseId: params.courseId } : {})
        }
      });
    }
  };

  const handlePreviousHole = () => {
    if (holeNumber > 1) {
      const prevHole = holeNumber - 1;
      router.replace({
        pathname: "/hole-view",
        params: {
          holeNumber: prevHole.toString(),
          ...(params.courseId ? { courseId: params.courseId } : {})
        }
      });
    }
  };

  const handleEndRound = () => {
    router.push({
      pathname: "/scorecard",
      params: {
        loadActive: "true",
        endRound: "true"
      }
    });
  };

  const handleGreenView = () => {
    setShowGreenView(!showGreenView);
  };

  const handleWindSlope = () => {
    setShowWindSlope(!showWindSlope);
  };

  // Add this function to save scores to Supabase
  const saveScore = async (playerId: string, holeNumber: number, score: number) => {
    console.log('saveScore called with:', { playerId, holeNumber, score });

    try {
      if (!roundId) {
        console.error('No active round ID available in saveScore');
        return;
      }

      // Find the player's specific round ID from roundPlayers
      const player = roundPlayers.find(p => p.id === playerId);
      if (!player) {
        console.error('Player not found in round group');
        return;
      }

      const scoreColumn = `hole_${holeNumber}_score`;
      console.log('Updating score column:', scoreColumn);
      
      // Use the player's specific roundId instead of the session user's roundId
      const { data, error } = await supabase
        .from('charlie_yates_scorecards')
        .update({
          [scoreColumn]: score,
          updated_at: new Date().toISOString()
        })
        .eq('id', player.roundId) // Use player's specific roundId
        .eq('user_id', playerId)
        .select();

      console.log('Supabase update response:', { data, error });

      if (error) {
        console.error('Supabase error in saveScore:', error);
        throw error;
      }

      console.log('Successfully saved score to Supabase:', data);
      return data;

    } catch (error) {
      console.error('Error in saveScore:', error);
      alert('Failed to save score. Please try again.');
      throw error;
    }
  };

  // Update the loadActiveRound function with more detailed logging
  const loadActiveRound = async () => {
    try {
      console.log('Starting loadActiveRound...');
      
      if (!session?.user) {
        console.error('No user session found in loadActiveRound');
        return;
      }

      const userId = session.user.id;
      console.log('Attempting to load active round for user:', userId);

      const { data, error } = await supabase
        .from('charlie_yates_scorecards')
        .select('*') // Change to select all fields for better debugging
        .eq('user_id', userId)
        .eq('active', 'true') // Change to explicitly check for 'true'
        .single();

      console.log('Supabase query response:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No active round found for user');
          return;
        }
        console.error('Supabase error in loadActiveRound:', error);
        return;
      }

      if (data) {
        console.log('Found active round with ID:', data.id);
        setRoundId(data.id);
        if (data.tee_box) {
          setTeeBox(data.tee_box);
        }
      } else {
        console.log('No data returned from Supabase');
      }
    } catch (error) {
      console.error('Unexpected error in loadActiveRound:', error);
    }
  };

  // Update the useEffect to include proper dependencies and logging
  useEffect(() => {
    console.log('useEffect triggered for loadActiveRound');
    console.log('Current session:', session);
    console.log('Current roundId:', roundId);
    
    if (session?.user && !roundId) {
      loadActiveRound();
    }
  }, [session, roundId]); // Add roundId as dependency

  // Add function to fetch hole data
  const fetchHoleData = async () => {
    try {
      const { data, error } = await supabase
        .from('charlie_yates_holes')
        .select('par, handicap')
        .eq('number', holeNumber)
        .single();

      if (error) throw error;
      if (data) {
        setHoleData(data);
      }
    } catch (error) {
      console.error('Error fetching hole data:', error);
    }
  };

  // Add useEffect to fetch hole data when hole number changes
  useEffect(() => {
    fetchHoleData();
  }, [holeNumber]);

  // Add this function to fetch players in the round group
  const fetchRoundPlayers = async () => {
    try {
      if (!roundId) {
        console.error('No roundId available');
        return;
      }

      // First get the round_group_id for the current round
      const { data: roundData, error: roundError } = await supabase
        .from('charlie_yates_scorecards')
        .select('round_group_id')
        .eq('id', roundId)
        .single();

      if (roundError) {
        console.error('Error fetching round_group_id:', roundError);
        return;
      }

      // Then fetch all players in this round group
      const { data: groupPlayers, error: playersError } = await supabase
        .from('charlie_yates_scorecards')
        .select('id, user_id, username')
        .eq('round_group_id', roundData.round_group_id);

      if (playersError) {
        console.error('Error fetching players:', playersError);
        return;
      }

      setRoundPlayers(groupPlayers.map(player => ({
        id: player.user_id,
        username: player.username,
        roundId: player.id,
        scores: []
      })));

    } catch (error) {
      console.error('Error in fetchRoundPlayers:', error);
    }
  };

  // Update the useEffect to fetch players when roundId is available
  useEffect(() => {
    if (roundId) {
      fetchRoundPlayers();
    }
  }, [roundId]);

  // Modify the scoreModal to include player selection
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
            Enter score for Hole {holeNumber}
          </Text>
          
          {/* Add player selection */}
          <ScrollView style={styles.playerList}>
            {roundPlayers.map((player) => (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.playerItem,
                  selectedCell?.playerId === player.id && styles.playerItemSelected
                ]}
                onPress={() => setSelectedCell({
                  playerId: player.id,
                  holeNumber: holeNumber
                })}
              >
                <Text style={[
                  styles.playerName,
                  selectedCell?.playerId === player.id && styles.playerNameSelected
                ]}>
                  {player.username}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedCell && (
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
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Top Info Bar */}
      <View style={styles.topInfoBar}>
        <TouchableOpacity style={styles.backArrow} onPress={handleBackToScorecard}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.holeInfo}>
          <Text style={styles.holeNumber}>#{holeNumber}</Text>
          <Text style={styles.yardage}>161 Yds</Text>
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.infoText}>
            Par {holeData?.par || '-'}
          </Text>
          <Text style={styles.infoText}>{teeBox} Tees</Text>
          <Text style={styles.infoText}>
            Handicap {holeData?.handicap || '-'}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapType}
        onMapReady={handleMapReady}
        onRegionChange={handleRegionChange}
        rotateEnabled={true}
        pitchEnabled={true}
        zoomEnabled={true}
        scrollEnabled={true}
      />

      {/* Distance Markers */}
      <View style={styles.distanceMarkers}>
        <View style={styles.distanceMarker}>
          <Text style={styles.markerValue}>179y</Text>
          <Text style={styles.markerLabel}>BACK</Text>
        </View>
        <View style={styles.distanceMarker}>
          <Text style={styles.markerValue}>161y</Text>
          <Text style={styles.markerLabel}>MID</Text>
        </View>
        <View style={styles.distanceMarker}>
          <Text style={styles.markerValue}>144y</Text>
          <Text style={styles.markerLabel}>FRONT</Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity 
          style={[styles.controlButton, showGreenView && styles.activeButton]}
          onPress={handleGreenView}
        >
          <Ionicons name="golf" size={24} color="white" />
          <Text style={styles.buttonText}>3D Green</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, showWindSlope && styles.activeButton]}
          onPress={handleWindSlope}
        >
          <Ionicons name="compass" size={24} color="white" />
          <Text style={styles.buttonText}>See wind & slope</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.buttonText}>Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleBackToScorecard}>
          <Text style={styles.buttonText}>Scorecard</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        {holeNumber > 1 && (
          <TouchableOpacity style={styles.nextHoleButton} onPress={handlePreviousHole}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.holeScoreButton}
          onPress={handleScoreEntry}
        >
          <Text style={styles.holeNumberText}>Hole {holeNumber}</Text>
          <Text style={styles.enterScoreText}>Enter Score</Text>
        </TouchableOpacity>

        {holeNumber === 9 ? (
          <TouchableOpacity 
            style={styles.nextHoleButton} 
            onPress={() => {
              router.push({
                pathname: "/scorecard",
                params: {
                  loadActive: "true"
                }
              });
            }}
          >
            <Text style={styles.bottomButtonText}>End Round</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextHoleButton} onPress={handleNextHole}>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Replace the existing modals with just these two */}
      {scoreModal}
      
      {/* Keep the Next Hole Prompt Modal */}
      <Modal
        visible={showNextHolePrompt}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.nextHolePrompt}>
            <Text style={styles.nextHoleTitle}>Scores Saved!</Text>
            {holeNumber === 9 ? (
              <>
                <Text style={styles.nextHoleText}>You've completed all 9 holes at Charlie Yates Golf Course!</Text>
                <View style={styles.nextHoleButtons}>
                  <TouchableOpacity 
                    style={[styles.nextHolePromptButton, styles.nextHolePrimary]}
                    onPress={() => {
                      setShowNextHolePrompt(false);
                      handleBackToScorecard();
                    }}
                  >
                    <Text style={[styles.nextHoleButtonText, styles.nextHolePrimaryText]}>View Scorecard</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.nextHoleText}>Would you like to continue to the next hole?</Text>
                <View style={styles.nextHoleButtons}>
                  <TouchableOpacity 
                    style={[styles.nextHolePromptButton, styles.nextHolePrimary]}
                    onPress={() => {
                      setShowNextHolePrompt(false);
                      handleNextHole();
                    }}
                  >
                    <Text style={[styles.nextHoleButtonText, styles.nextHolePrimaryText]}>Next Hole</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.nextHolePromptButton, styles.nextHoleSecondary]}
                    onPress={() => {
                      setShowNextHolePrompt(false);
                      handleBackToScorecard();
                    }}
                  >
                    <Text style={[styles.nextHoleButtonText, styles.nextHoleSecondaryText]}>View Scorecard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.nextHolePromptButton, styles.nextHoleSecondary]}
                    onPress={() => {
                      setShowNextHolePrompt(false);
                      if (holeNumber > 1) {
                        router.replace({
                          pathname: "/hole-view",
                          params: {
                            holeNumber: (holeNumber - 1).toString(),
                            ...(params.courseId ? { courseId: params.courseId } : {})
                          }
                        });
                      }
                    }}
                  >
                    <Text style={[styles.nextHoleButtonText, styles.nextHoleSecondaryText]}>Previous Hole</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Debug Panel */}
      <View style={[styles.debugPanel, { zIndex: 999 }]}>
        <ScrollView style={styles.debugScroll}>
          <Text style={styles.debugTitle}>Map Debug Info:</Text>
          <Text style={styles.debugText}>Hole: {holeNumber}</Text>
          <Text style={styles.debugText}>Latitude: {debugInfo.latitude}</Text>
          <Text style={styles.debugText}>Longitude: {debugInfo.longitude}</Text>
          <Text style={styles.debugText}>LatitudeDelta: {debugInfo.latitudeDelta}</Text>
          <Text style={styles.debugText}>LongitudeDelta: {debugInfo.longitudeDelta}</Text>
          <Text style={styles.debugText}>Heading: {debugInfo.heading}°</Text>
          <Text style={styles.debugText}>Altitude: {debugInfo.altitude}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'black',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  topInfoBar: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  backArrow: {
    padding: 8,
  },
  holeInfo: {
    marginLeft: 16,
  },
  holeNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  yardage: {
    color: 'white',
    fontSize: 16,
  },
  courseInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
  },
  shareButton: {
    padding: 8,
  },
  distanceMarkers: {
    position: 'absolute',
    top: '30%',
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 8,
  },
  distanceMarker: {
    alignItems: 'center',
    marginVertical: 4,
  },
  markerValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  markerLabel: {
    color: 'white',
    fontSize: 12,
  },
  controlButtons: {
    position: 'absolute',
    top: '30%',
    right: 16,
    gap: 8,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  bottomButton: {
    flex: 1.2,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  holeScoreButton: {
    flex: 3.5,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  holeNumberText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  enterScoreText: {
    color: '#007AFF',
    fontSize: 15,
    marginTop: 2,
  },
  nextHoleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  debugPanel: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    zIndex: 999,
  },
  debugScroll: {
    maxHeight: 200,
  },
  debugTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  scoreInputs: {
    paddingBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 8,
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
  scoreButtonActive: {
    backgroundColor: '#007AFF',
  },
  scoreButtonText: {
    fontSize: 18,
    color: '#333',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextHolePrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'white',
    width: '80%',
    alignSelf: 'center',
    borderRadius: 14,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  nextHoleTitle: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  nextHoleText: {
    color: '#666',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  nextHoleButtons: {
    width: '100%',
    gap: 8,
  },
  nextHolePromptButton: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextHolePrimary: {
    backgroundColor: '#007AFF',
  },
  nextHoleSecondary: {
    backgroundColor: '#f2f2f7',
  },
  nextHoleButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  nextHolePrimaryText: {
    color: 'white',
  },
  nextHoleSecondaryText: {
    color: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  scoreButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  playerList: {
    maxHeight: 150,
    marginBottom: 20,
  },
  playerItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  playerItemSelected: {
    backgroundColor: '#007AFF',
  },
  playerName: {
    fontSize: 16,
    color: '#333',
  },
  playerNameSelected: {
    color: '#fff',
  },
});