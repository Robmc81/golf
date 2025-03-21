import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Camera } from 'react-native-maps';
import { HOLE_COORDINATES } from './config/maps';
import { Ionicons } from '@expo/vector-icons';

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
  name: string;
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
    { id: '1', name: 'Player 1' },
    { id: '2', name: 'Player 2' },
    { id: '3', name: 'Player 3' },
    { id: '4', name: 'Player 4' },
  ]);
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0].id);
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({});
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
    router.push("/active-round");
  };

  /** Handle score entry **/
  const handleScoreEntry = () => {
    setShowScoreModal(true);
    // Initialize score entry for selected player if not exists
    if (!scores[selectedPlayerId]) {
      setScores(prev => ({
        ...prev,
        [selectedPlayerId]: {
          playerId: selectedPlayerId,
          playerName: players.find(p => p.id === selectedPlayerId)?.name || '',
          score: null,
          putts: null,
          greenInRegulation: null,
          chipShots: null,
          greensideSand: null,
          penalties: null
        }
      }));
    }
  };

  const handleSaveScore = async () => {
    try {
      // TODO: Implement API call to save scores
      await saveScoresToBackend({
        holeNumber,
        scores: Object.values(scores),
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
    router.replace({
      pathname: "/scorecard",
      params: {
        endRound: "true",
        ...(params.courseId ? { courseId: params.courseId } : {})
      }
    });
  };

  const handleGreenView = () => {
    setShowGreenView(!showGreenView);
  };

  const handleWindSlope = () => {
    setShowWindSlope(!showWindSlope);
  };

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
          <Text style={styles.infoText}>Par 3</Text>
          <Text style={styles.infoText}>Black 161</Text>
          <Text style={styles.infoText}>Handicap 5</Text>
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
            onPress={handleBackToScorecard}
          >
            <Text style={styles.bottomButtonText}>End Round</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextHoleButton} onPress={handleNextHole}>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Score Entry Modal */}
      <Modal
        visible={showScoreModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowScoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Score</Text>
              <TouchableOpacity onPress={() => setShowScoreModal(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.scoreInputs}>
                <Text style={styles.inputLabel}>Score</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.score === 1 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], score: 1 } }))}
                  >
                    <Text style={styles.scoreButtonText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.score === 2 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], score: 2 } }))}
                  >
                    <Text style={styles.scoreButtonText}>2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.score === 3 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], score: 3 } }))}
                  >
                    <Text style={styles.scoreButtonText}>3</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.score === 4 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], score: 4 } }))}
                  >
                    <Text style={styles.scoreButtonText}>4</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.score === 5 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], score: 5 } }))}
                  >
                    <Text style={styles.scoreButtonText}>5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.score === 6 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], score: 6 } }))}
                  >
                    <Text style={styles.scoreButtonText}>6</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Putts</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.putts === 0 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], putts: 0 } }))}
                  >
                    <Text style={styles.scoreButtonText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.putts === 1 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], putts: 1 } }))}
                  >
                    <Text style={styles.scoreButtonText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.putts === 2 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], putts: 2 } }))}
                  >
                    <Text style={styles.scoreButtonText}>2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.putts === 3 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], putts: 3 } }))}
                  >
                    <Text style={styles.scoreButtonText}>3</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Green in Regulation</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.greenInRegulation === true && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], greenInRegulation: true } }))}
                  >
                    <Text style={styles.scoreButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.greenInRegulation === false && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], greenInRegulation: false } }))}
                  >
                    <Text style={styles.scoreButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Chip Shots</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.chipShots === 0 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], chipShots: 0 } }))}
                  >
                    <Text style={styles.scoreButtonText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.chipShots === 1 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], chipShots: 1 } }))}
                  >
                    <Text style={styles.scoreButtonText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.chipShots === 2 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], chipShots: 2 } }))}
                  >
                    <Text style={styles.scoreButtonText}>2</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Greenside Sand</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.greensideSand === 0 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], greensideSand: 0 } }))}
                  >
                    <Text style={styles.scoreButtonText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.greensideSand === 1 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], greensideSand: 1 } }))}
                  >
                    <Text style={styles.scoreButtonText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.greensideSand === 2 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], greensideSand: 2 } }))}
                  >
                    <Text style={styles.scoreButtonText}>2</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Penalties</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.penalties === 0 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], penalties: 0 } }))}
                  >
                    <Text style={styles.scoreButtonText}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.penalties === 1 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], penalties: 1 } }))}
                  >
                    <Text style={styles.scoreButtonText}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scoreButton, scores[selectedPlayerId]?.penalties === 2 && styles.scoreButtonActive]}
                    onPress={() => setScores(prev => ({ ...prev, [selectedPlayerId]: { ...prev[selectedPlayerId], penalties: 2 } }))}
                  >
                    <Text style={styles.scoreButtonText}>2</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveScore}>
              <Text style={styles.saveButtonText}>Save Score</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Next Hole Prompt Modal */}
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonActive: {
    backgroundColor: '#007AFF',
  },
  scoreButtonText: {
    fontSize: 15,
    color: '#000',
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
});

