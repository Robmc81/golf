import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Camera } from 'react-native-maps';
import { CHARLIE_YATES_COORDINATES, HOLE_COORDINATES } from './config/maps';
import { Ionicons } from '@expo/vector-icons';

interface HoleViewParams { 
  holeNumber?: string;  
  courseId?: string;  
} 

interface MapDebugInfo {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  pitch: number;
}

interface HoleCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
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
  const holeNumber = parseInt(params.holeNumber || '1');
  const holeCoordinates = HOLE_COORDINATES[holeNumber as keyof typeof HOLE_COORDINATES] || CHARLIE_YATES_COORDINATES as HoleCoordinates;
  
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('satellite');
  const [debugInfo, setDebugInfo] = useState<MapDebugInfo>({
    latitude: holeCoordinates.latitude,
    longitude: holeCoordinates.longitude,
    altitude: holeCoordinates.altitude || 0.0001, // Default altitude for zoom
    heading: holeCoordinates.heading,
    pitch: holeCoordinates.tilt,
  });

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

  /** Ensure the map initializes with the correct 3D heading & tilt **/
  const handleMapReady = () => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: holeCoordinates.latitude,
          longitude: holeCoordinates.longitude,
        },
        heading: holeCoordinates.heading, // Rotate map correctly
        pitch: holeCoordinates.tilt, // Ensure 3D effect
        altitude: holeCoordinates.altitude || 0.0001, // Controls zoom level with default
      });

      setDebugInfo(prev => ({
        ...prev,
        heading: holeCoordinates.heading,
        pitch: holeCoordinates.tilt,
        altitude: holeCoordinates.altitude || 0.0001,
      }));
    }
  };

  /** Smoothly animate camera when the user changes holes **/
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: holeCoordinates.latitude,
          longitude: holeCoordinates.longitude,
        },
        heading: holeCoordinates.heading,
        pitch: holeCoordinates.tilt,
        altitude: holeCoordinates.altitude || 0.0001, // Controls zoom with default
      });
    }
  }, [holeNumber]); // Runs when holeNumber changes

  /** Toggle between Standard and Satellite views **/
  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

  /** Prevent UI lag by delaying region updates **/
  const handleRegionChange = (region: any) => {
    setTimeout(() => {
      setDebugInfo(prev => ({
        ...prev,
        latitude: region.latitude,
        longitude: region.longitude,
        altitude: Math.log2(40075016.685578488 / (region.latitudeDelta * 256)) || 0.0001, // Calculate zoom with fallback
      }));
    }, 500); // Delay to reduce frequent updates
  };

  /** Navigate back to Scorecard **/
  const handleBackToScorecard = () => {
    router.back();
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
        initialRegion={{
          latitude: holeCoordinates.latitude,
          longitude: holeCoordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        camera={{
          center: {
            latitude: holeCoordinates.latitude,
            longitude: holeCoordinates.longitude,
          },
          pitch: holeCoordinates.tilt,
          heading: holeCoordinates.heading,
          altitude: holeCoordinates.altitude || 0.0001,
        }}
        showsUserLocation
        showsMyLocationButton
        mapType={mapType}
        onRegionChange={handleRegionChange}
        onMapReady={handleMapReady}
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
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.scoreButton} onPress={handleBackToScorecard}>
          <Text style={styles.buttonText}>Scorecard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.holeScoreButton}
          onPress={handleScoreEntry}
        >
          <Text style={styles.holeNumberText}>Hole {holeNumber}</Text>
          <Text style={styles.enterScoreText}>Enter Score</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolsButton}>
          <Text style={styles.buttonText}>Tools</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextHoleButton} onPress={handleNextHole}>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Score Entry Modal */}
      <Modal
        visible={showScoreModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hole {holeNumber}</Text>
              <TouchableOpacity onPress={() => setShowScoreModal(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Player Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Player</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.playerButtons}>
                  {players.map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={[
                        styles.playerButton,
                        selectedPlayerId === player.id && styles.selectedButton,
                        scores[player.id]?.score !== null && styles.completedButton
                      ]}
                      onPress={() => setSelectedPlayerId(player.id)}
                    >
                      <Text style={styles.playerButtonText}>{player.name}</Text>
                      {scores[player.id]?.score && (
                        <Text style={styles.playerScoreText}>{scores[player.id].score}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Score Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Score</Text>
              <View style={styles.scoreGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.modalScoreButton,
                      scores[selectedPlayerId]?.score === num && styles.selectedButton
                    ]}
                    onPress={() => setScores(prev => ({
                      ...prev,
                      [selectedPlayerId]: {
                        ...prev[selectedPlayerId],
                        score: num
                      }
                    }))}
                  >
                    <Text style={styles.scoreButtonText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Putts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Putts</Text>
              <View style={styles.optionsRow}>
                {[0, 1, 2, 3, 4].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.optionButton,
                      scores[selectedPlayerId]?.putts === num && styles.selectedButton
                    ]}
                    onPress={() => setScores(prev => ({
                      ...prev,
                      [selectedPlayerId]: {
                        ...prev[selectedPlayerId],
                        putts: num
                      }
                    }))}
                  >
                    <Text style={styles.optionText}>{num === 4 ? '≥4' : num.toString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Green in Regulation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Green in Regulation</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.girButton,
                    scores[selectedPlayerId]?.greenInRegulation === true && styles.selectedButton
                  ]}
                  onPress={() => setScores(prev => ({
                    ...prev,
                    [selectedPlayerId]: {
                      ...prev[selectedPlayerId],
                      greenInRegulation: true
                    }
                  }))}
                >
                  <Ionicons name="checkmark" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.girButton,
                    scores[selectedPlayerId]?.greenInRegulation === false && styles.selectedButton
                  ]}
                  onPress={() => setScores(prev => ({
                    ...prev,
                    [selectedPlayerId]: {
                      ...prev[selectedPlayerId],
                      greenInRegulation: false
                    }
                  }))}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Stats */}
            {['Chip Shots', 'Greenside Sand Shots', 'Penalties'].map((stat) => (
              <View key={stat} style={styles.section}>
                <Text style={styles.sectionTitle}>{stat}</Text>
                <View style={styles.optionsRow}>
                  {[0, 1, 2, 3, '≥4'].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.optionButton,
                        (stat === 'Chip Shots' && scores[selectedPlayerId]?.chipShots === num) ||
                        (stat === 'Greenside Sand Shots' && scores[selectedPlayerId]?.greensideSand === num) ||
                        (stat === 'Penalties' && scores[selectedPlayerId]?.penalties === num)
                          ? styles.selectedButton
                          : undefined
                      ]}
                      onPress={() => {
                        const value = num === '≥4' ? 4 : num;
                        setScores(prev => ({
                          ...prev,
                          [selectedPlayerId]: {
                            ...prev[selectedPlayerId],
                            [stat === 'Chip Shots' ? 'chipShots' :
                             stat === 'Greenside Sand Shots' ? 'greensideSand' : 'penalties']: value
                          }
                        }));
                      }}
                    >
                      <Text style={styles.optionText}>{num}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.finishButton}
              onPress={handleSaveScore}
            >
              <Text style={styles.finishButtonText}>
                {Object.keys(scores).length === players.length ? 'Save & Continue' : 'Save Score'}
              </Text>
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
          <View style={[styles.modalContent, styles.nextHolePrompt]}>
            <Text style={styles.nextHoleTitle}>Scores Saved!</Text>
            <Text style={styles.nextHoleText}>Would you like to continue to the next hole?</Text>
            <View style={styles.nextHoleButtons}>
              <TouchableOpacity 
                style={[styles.nextHoleButton, styles.nextHoleSecondary]}
                onPress={() => {
                  setShowNextHolePrompt(false);
                  router.replace({
                    pathname: "/scorecard",
                    params: {
                      holeNumber: holeNumber.toString()
                    }
                  });
                }}
              >
                <Text style={styles.nextHoleButtonText}>View Scorecard</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.nextHoleButton, styles.nextHolePrimary]}
                onPress={() => {
                  setShowNextHolePrompt(false);
                  handleNextHole();
                }}
              >
                <Text style={styles.nextHoleButtonText}>Next Hole</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Debug Panel */}
      <View style={styles.debugPanel}>
        <ScrollView style={styles.debugScroll}>
          <Text style={styles.debugTitle}>Map Debug Info</Text>
          <Text style={styles.debugText}>Latitude: {debugInfo.latitude.toFixed(6)}°</Text>
          <Text style={styles.debugText}>Longitude: {debugInfo.longitude.toFixed(6)}°</Text>
          <Text style={styles.debugText}>Altitude (Zoom): {(debugInfo.altitude || 0.0001).toFixed(2)}</Text>
          <Text style={styles.debugText}>Heading: {debugInfo.heading.toFixed(2)}°</Text>
          <Text style={styles.debugText}>Pitch: {debugInfo.pitch.toFixed(2)}°</Text>
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
    gap: 12,
  },
  scoreButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  holeScoreButton: {
    flex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  enterScoreText: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 2,
  },
  toolsButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugPanel: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
  },
  debugScroll: { maxHeight: 200 },
  debugTitle: { color: 'white', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  debugText: { color: 'white', fontSize: 12, marginBottom: 4 },
  nextHoleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  modalScoreButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButton: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  girButton: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  scoreButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  finishButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  playerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  playerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  playerScoreText: {
    color: '#007AFF',
    fontSize: 14,
    marginTop: 4,
  },
  completedButton: {
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  nextHolePrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  nextHoleTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nextHoleText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  nextHoleButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  nextHolePrimary: {
    backgroundColor: '#007AFF',
  },
  nextHoleSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextHoleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

