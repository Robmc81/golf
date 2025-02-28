import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import Colors from '@/constants/colors';
import { Button } from '@/components/Button';
import { 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Minus, 
  Plus, 
  CheckCircle,
  LogOut
} from 'lucide-react-native';

export default function RoundDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { rounds, getCourse, updateScore, updateRound } = useAppStore();
  const { logout } = useAuthStore();
  
  // Get round details
  const round = rounds.find(r => r.id === id);
  
  // State
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  if (!round) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Round not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline" 
        />
      </View>
    );
  }
  
  // Get course details
  const course = getCourse(round.courseId);
  
  if (!course) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Course not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="outline" 
        />
      </View>
    );
  }
  
  // Get current hole
  const currentHole = course.holes[currentHoleIndex];
  
  // Get current player
  const currentPlayer = round.players[currentPlayerIndex];
  
  // Get current score
  const currentScore = currentPlayer.scores.find(s => s.holeNumber === currentHole.number);
  const strokes = currentScore?.strokes || 0;
  const putts = currentScore?.putts || 0;
  const fairwayHit = currentScore?.fairwayHit;
  const greenInRegulation = currentScore?.greenInRegulation;
  
  // Navigate to previous hole
  const handlePreviousHole = () => {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1);
    }
  };
  
  // Navigate to next hole
  const handleNextHole = () => {
    if (currentHoleIndex < course.holes.length - 1) {
      setCurrentHoleIndex(currentHoleIndex + 1);
    }
  };
  
  // Switch player
  const handleSwitchPlayer = () => {
    setCurrentPlayerIndex((currentPlayerIndex + 1) % round.players.length);
  };
  
  // Update strokes
  const handleUpdateStrokes = (value: number) => {
    const newStrokes = Math.max(0, strokes + value);
    updateScore(currentPlayer.id, currentHole.number, newStrokes, putts, fairwayHit, greenInRegulation);
  };
  
  // Update putts
  const handleUpdatePutts = (value: number) => {
    const newPutts = Math.max(0, putts + value);
    updateScore(currentPlayer.id, currentHole.number, strokes, newPutts, fairwayHit, greenInRegulation);
  };
  
  // Toggle fairway hit
  const handleToggleFairwayHit = (value: boolean | null) => {
    updateScore(currentPlayer.id, currentHole.number, strokes, putts, value, greenInRegulation);
  };
  
  // Toggle green in regulation
  const handleToggleGreenInRegulation = (value: boolean) => {
    updateScore(currentPlayer.id, currentHole.number, strokes, putts, fairwayHit, value);
  };
  
  // Complete round
  const handleCompleteRound = () => {
    Alert.alert(
      "Complete Round",
      "Are you sure you want to complete this round?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Complete",
          onPress: () => {
            updateRound({
              ...round,
              completed: true
            });
            router.replace('/');
          }
        }
      ]
    );
  };
  
  // Calculate score to par
  const scoreToPar = strokes - currentHole.par;
  const scoreLabel = scoreToPar === 0 ? 'Par' : 
                    scoreToPar === 1 ? 'Bogey' :
                    scoreToPar === 2 ? 'Double Bogey' :
                    scoreToPar === 3 ? 'Triple Bogey' :
                    scoreToPar > 3 ? `+${scoreToPar}` :
                    scoreToPar === -1 ? 'Birdie' :
                    scoreToPar === -2 ? 'Eagle' :
                    scoreToPar === -3 ? 'Albatross' : `${scoreToPar}`;

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: () => {
            logout();
            router.replace('/');
          },
          style: "destructive"
        }
      ]
    );
  };

  // Logout button component for the header
  const LogoutButton = () => (
    <Pressable 
      onPress={handleLogout}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        padding: 8,
        marginRight: 8
      })}
    >
      <LogOut size={24} color={Colors.error} />
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `Round at ${course.name}`,
          headerBackTitle: 'Back',
          headerRight: () => <LogoutButton />
        }} 
      />
      
      {/* Hole Navigation */}
      <View style={styles.holeNavigation}>
        <Pressable 
          style={[styles.navButton, currentHoleIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePreviousHole}
          disabled={currentHoleIndex === 0}
        >
          <ChevronLeft size={24} color={currentHoleIndex === 0 ? Colors.subtext : Colors.text} />
        </Pressable>
        
        <View style={styles.holeInfo}>
          <Text style={styles.holeNumber}>Hole {currentHole.number}</Text>
          <View style={styles.holeDetails}>
            <Text style={styles.holePar}>Par {currentHole.par}</Text>
            <Text style={styles.holeDistance}>
              {currentHole.distance[round.teeId]} yds
            </Text>
          </View>
        </View>
        
        <Pressable 
          style={[styles.navButton, currentHoleIndex === course.holes.length - 1 && styles.navButtonDisabled]}
          onPress={handleNextHole}
          disabled={currentHoleIndex === course.holes.length - 1}
        >
          <ChevronRight size={24} color={currentHoleIndex === course.holes.length - 1 ? Colors.subtext : Colors.text} />
        </Pressable>
      </View>
      
      {/* Player Selection */}
      <Pressable 
        style={styles.playerSelector}
        onPress={handleSwitchPlayer}
      >
        <Text style={styles.playerSelectorLabel}>Player:</Text>
        <Text style={styles.playerSelectorName}>{currentPlayer.name}</Text>
        {round.players.length > 1 && (
          <Text style={styles.playerSelectorSwitch}>Tap to switch</Text>
        )}
      </Pressable>
      
      {/* Score Input */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Strokes</Text>
          <View style={styles.scoreInputContainer}>
            <Pressable 
              style={[styles.scoreButton, strokes === 0 && styles.scoreButtonDisabled]}
              onPress={() => handleUpdateStrokes(-1)}
              disabled={strokes === 0}
            >
              <Minus size={20} color={strokes === 0 ? Colors.subtext : Colors.text} />
            </Pressable>
            
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreValue}>{strokes}</Text>
              {strokes > 0 && (
                <Text style={[
                  styles.scoreToPar,
                  scoreToPar < 0 ? styles.scoreUnderPar : 
                  scoreToPar > 0 ? styles.scoreOverPar : 
                  styles.scorePar
                ]}>
                  {scoreLabel}
                </Text>
              )}
            </View>
            
            <Pressable 
              style={styles.scoreButton}
              onPress={() => handleUpdateStrokes(1)}
            >
              <Plus size={20} color={Colors.text} />
            </Pressable>
          </View>
        </View>
        
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>Putts</Text>
          <View style={styles.scoreInputContainer}>
            <Pressable 
              style={[styles.scoreButton, putts === 0 && styles.scoreButtonDisabled]}
              onPress={() => handleUpdatePutts(-1)}
              disabled={putts === 0}
            >
              <Minus size={20} color={putts === 0 ? Colors.subtext : Colors.text} />
            </Pressable>
            
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreValue}>{putts}</Text>
            </View>
            
            <Pressable 
              style={styles.scoreButton}
              onPress={() => handleUpdatePutts(1)}
            >
              <Plus size={20} color={Colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
      
      {/* Stats Input */}
      <View style={styles.statsContainer}>
        {/* Fairway Hit (only for par 4 and 5) */}
        {currentHole.par >= 4 && (
          <View style={styles.statSection}>
            <Text style={styles.sectionTitle}>Fairway Hit</Text>
            <View style={styles.statButtonsContainer}>
              <Pressable 
                style={[
                  styles.statButton,
                  fairwayHit === true && styles.statButtonSelected
                ]}
                onPress={() => handleToggleFairwayHit(fairwayHit === true ? null : true)}
              >
                <Check size={20} color={fairwayHit === true ? '#fff' : Colors.secondary} />
                <Text style={[
                  styles.statButtonText,
                  fairwayHit === true && styles.statButtonTextSelected
                ]}>
                  Yes
                </Text>
              </Pressable>
              
              <Pressable 
                style={[
                  styles.statButton,
                  fairwayHit === false && styles.statButtonSelectedRed
                ]}
                onPress={() => handleToggleFairwayHit(fairwayHit === false ? null : false)}
              >
                <X size={20} color={fairwayHit === false ? '#fff' : Colors.error} />
                <Text style={[
                  styles.statButtonText,
                  fairwayHit === false && styles.statButtonTextSelected
                ]}>
                  No
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        
        {/* Green in Regulation */}
        <View style={styles.statSection}>
          <Text style={styles.sectionTitle}>Green in Regulation</Text>
          <View style={styles.statButtonsContainer}>
            <Pressable 
              style={[
                styles.statButton,
                greenInRegulation === true && styles.statButtonSelected
              ]}
              onPress={() => handleToggleGreenInRegulation(true)}
            >
              <Check size={20} color={greenInRegulation === true ? '#fff' : Colors.secondary} />
              <Text style={[
                styles.statButtonText,
                greenInRegulation === true && styles.statButtonTextSelected
              ]}>
                Yes
              </Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.statButton,
                greenInRegulation === false && styles.statButtonSelectedRed
              ]}
              onPress={() => handleToggleGreenInRegulation(false)}
            >
              <X size={20} color={greenInRegulation === false ? '#fff' : Colors.error} />
              <Text style={[
                styles.statButtonText,
                greenInRegulation === false && styles.statButtonTextSelected
              ]}>
                No
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      
      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentHoleIndex < course.holes.length - 1 ? (
          <Button
            title="Next Hole"
            onPress={handleNextHole}
            variant="primary"
            icon={<ChevronRight size={18} color="#fff" />}
            fullWidth
          />
        ) : (
          <Button
            title="Complete Round"
            onPress={handleCompleteRound}
            variant="primary"
            icon={<CheckCircle size={18} color="#fff" />}
            fullWidth
          />
        )}
      </View>
      
      {/* Scorecard Summary */}
      <View style={styles.scorecardSummary}>
        <Text style={styles.summaryTitle}>Scorecard Summary</Text>
        
        <View style={styles.summaryTable}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryHeaderCell, styles.holeCell]}>Hole</Text>
            <Text style={[styles.summaryHeaderCell, styles.parCell]}>Par</Text>
            <Text style={[styles.summaryHeaderCell, styles.scoreCell]}>Score</Text>
          </View>
          
          {course.holes.map((hole, index) => {
            const holeScore = currentPlayer.scores.find(s => s.holeNumber === hole.number);
            const score = holeScore?.strokes || 0;
            const scoreToPar = score > 0 ? score - hole.par : 0;
            
            return (
              <Pressable 
                key={hole.number}
                style={[
                  styles.summaryRow,
                  index === currentHoleIndex && styles.currentHoleRow
                ]}
                onPress={() => setCurrentHoleIndex(index)}
              >
                <Text style={[styles.summaryCell, styles.holeCell]}>{hole.number}</Text>
                <Text style={[styles.summaryCell, styles.parCell]}>{hole.par}</Text>
                <Text style={[
                  styles.summaryCell, 
                  styles.scoreCell,
                  score === 0 ? styles.noScore :
                  scoreToPar < 0 ? styles.underParScore :
                  scoreToPar > 0 ? styles.overParScore :
                  styles.parScore
                ]}>
                  {score > 0 ? score : '-'}
                </Text>
              </Pressable>
            );
          })}
          
          <View style={styles.summaryTotalRow}>
            <Text style={[styles.summaryCell, styles.holeCell, styles.totalCell]}>Total</Text>
            <Text style={[styles.summaryCell, styles.parCell, styles.totalCell]}>
              {course.holes.reduce((sum, hole) => sum + hole.par, 0)}
            </Text>
            <Text style={[styles.summaryCell, styles.scoreCell, styles.totalCell]}>
              {currentPlayer.scores.reduce((sum, score) => sum + score.strokes, 0) || '-'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  holeNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  holeInfo: {
    flex: 1,
    alignItems: 'center',
  },
  holeNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  holeDetails: {
    flexDirection: 'row',
  },
  holePar: {
    fontSize: 14,
    color: Colors.subtext,
    marginRight: 12,
  },
  holeDistance: {
    fontSize: 14,
    color: Colors.subtext,
  },
  playerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20', // 20% opacity
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  playerSelectorLabel: {
    fontSize: 14,
    color: Colors.subtext,
    marginRight: 8,
  },
  playerSelectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
  },
  playerSelectorSwitch: {
    fontSize: 12,
    color: Colors.primary,
  },
  scoreContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: 'row',
  },
  scoreSection: {
    flex: 1,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  scoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonDisabled: {
    opacity: 0.5,
  },
  scoreDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  scoreToPar: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  scoreUnderPar: {
    color: Colors.secondary,
  },
  scoreOverPar: {
    color: Colors.error,
  },
  scorePar: {
    color: Colors.text,
  },
  statsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  statSection: {
    marginBottom: 16,
  },
  statButtonsContainer: {
    flexDirection: 'row',
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statButtonSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  statButtonSelectedRed: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  statButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 8,
  },
  statButtonTextSelected: {
    color: '#fff',
  },
  navigationButtons: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  scorecardSummary: {
    margin: 16,
    marginTop: 32,
    marginBottom: 40,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryTable: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.darkBackground,
    padding: 8,
  },
  summaryHeaderCell: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 8,
  },
  currentHoleRow: {
    backgroundColor: Colors.primary + '20', // 20% opacity
  },
  summaryCell: {
    textAlign: 'center',
    color: Colors.text,
  },
  holeCell: {
    flex: 1,
  },
  parCell: {
    flex: 1,
  },
  scoreCell: {
    flex: 1,
    fontWeight: '500',
  },
  noScore: {
    color: Colors.subtext,
  },
  underParScore: {
    color: Colors.secondary,
  },
  overParScore: {
    color: Colors.error,
  },
  parScore: {
    color: Colors.text,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: Colors.card,
  },
  totalCell: {
    fontWeight: '700',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.subtext,
    marginBottom: 20,
  },
});