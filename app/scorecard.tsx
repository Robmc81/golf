import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AddPlayerModal from './add-player-modal';

const mockPlayers = [
  {
    id: '1',
    name: 'R. McFadden',
    handicap: 20,
    scores: Array(18).fill(null),
    netScores: Array(18).fill(null),
  },
];

interface Player {
  id: string;
  name: string;
  avatar?: string;
  handicap?: number;
  scores: (number | null)[];
  netScores: (number | null)[];
}

interface Props {
  courseName: string;
  teeName: string;
  teeColor: string;
  rating: number;
  slope: number;
  holes: {
    number: number;
    par: number;
    handicap: number;
  }[];
  players: Player[];
  orientation?: 'vertical' | 'horizontal';
  currentHole?: number;
  competitiveOptions?: {
    type: string;
    target: string;
  };
}

interface ScoreEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (scores: { [key: string]: number }) => void;
  players: Player[];
  currentHole: number;
  currentScores: { [key: string]: number };
}

interface RoundSummaryProps {
  players: Player[];
  holes: {
    number: number;
    par: number;
    handicap: number;
  }[];
  onBackToScorecard: () => void;
  onFinishRound: () => void;
  endTime: Date;
  modifications: {
    timestamp: Date;
    playerId: string;
    playerName: string;
    holeNumber: number;
    oldScore: number | null;
    newScore: number;
  }[];
}

function ScoreEditModal({ visible, onClose, onSave, players, currentHole, currentScores }: ScoreEditModalProps) {
  const [scores, setScores] = useState<{ [key: string]: number }>({});

  // Update scores when modal becomes visible or currentScores changes
  React.useEffect(() => {
    setScores(currentScores);
  }, [visible, currentScores]);

  const handleScoreChange = (playerId: string, text: string) => {
    const score = parseInt(text) || 0;
    setScores(prev => ({ ...prev, [playerId]: score }));
  };

  const handleSave = () => {
    onSave(scores);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hole {currentHole} Scores</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {players.map((player) => (
            <View key={player.id} style={styles.scoreInputRow}>
              <View style={styles.playerInfo}>
                {player.avatar ? (
                  <Image source={{ uri: player.avatar }} style={styles.modalAvatar} />
                ) : (
                  <View style={styles.modalAvatarPlaceholder}>
                    <Text style={styles.modalAvatarText}>
                      {player.name.split(' ').map((n) => n[0]).join('')}
                    </Text>
                  </View>
                )}
                <Text style={styles.modalPlayerName}>{player.name}</Text>
              </View>
              <TextInput
                style={styles.scoreInput}
                value={scores[player.id]?.toString() || ''}
                onChangeText={(text) => handleScoreChange(player.id, text)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          ))}
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Scores</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function RoundSummary({ players, holes, onBackToScorecard, onFinishRound, endTime, modifications }: RoundSummaryProps) {
  const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0);

  // Format end time
  const formattedEndTime = endTime.toLocaleString();

  // Calculate additional stats for each player
  const playerStats = players.map(player => {
    const grossScore = player.scores.reduce((sum: number, score) => sum + (score || 0), 0);
    const netScore = player.netScores.reduce((sum: number, score) => sum + (score || 0), 0);
    const scoreToPar = grossScore - totalPar;
    
    // Calculate fairways hit (assuming even holes are par 4/5)
    const fairwaysHit = player.scores.filter((score, index) => 
      holes[index].par >= 4 && score !== null
    ).length;
    const totalFairways = holes.filter(hole => hole.par >= 4).length;
    const fairwayPercentage = totalFairways > 0 ? (fairwaysHit / totalFairways) * 100 : 0;

    // Calculate greens in regulation (assuming par 3 = 1, par 4 = 2, par 5 = 3)
    const greensInRegulation = player.scores.filter((score, index) => {
      const par = holes[index].par;
      return score !== null && score <= par + 2;
    }).length;
    const girPercentage = (greensInRegulation / holes.length) * 100;

    // Calculate putts per hole (assuming score - par + 2 is putts)
    const totalPutts = player.scores.reduce((sum: number, score, index) => {
      if (score === null) return sum;
      const par = holes[index].par;
      return sum + (score - par + 2);
    }, 0);
    const averagePutts = totalPutts / holes.length;

    return {
      player,
      grossScore,
      netScore,
      scoreToPar,
      fairwayPercentage,
      girPercentage,
      averagePutts,
    };
  });

  return (
    <SafeAreaView style={styles.summaryContainer}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Round Summary</Text>
        <Text style={styles.summaryEndTime}>Ended: {formattedEndTime}</Text>
        <View style={styles.summaryNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={onBackToScorecard}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.navButtonText}>Back to Scorecard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, styles.finishButton]}
            onPress={onFinishRound}
          >
            <Text style={styles.navButtonText}>Finish Round</Text>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.summaryScroll}>
        {playerStats.map(({ player, grossScore, netScore, scoreToPar, fairwayPercentage, girPercentage, averagePutts }) => (
          <View key={player.id} style={styles.summaryPlayerCard}>
            <View style={styles.summaryPlayerHeader}>
              <View style={styles.playerInfo}>
                {player.avatar ? (
                  <Image source={{ uri: player.avatar }} style={styles.modalAvatar} />
                ) : (
                  <View style={styles.modalAvatarPlaceholder}>
                    <Text style={styles.modalAvatarText}>
                      {player.name.split(' ').map((n) => n[0]).join('')}
                    </Text>
                  </View>
                )}
                <View style={styles.summaryPlayerInfo}>
                  <Text style={styles.summaryPlayerName}>{player.name}</Text>
                  <Text style={styles.summaryPlayerHandicap}>Handicap: {player.handicap || 0}</Text>
                </View>
              </View>
              <View style={styles.summaryScores}>
                <Text style={styles.summaryScore}>Gross: {grossScore}</Text>
                <Text style={styles.summaryScore}>Net: {netScore}</Text>
                <Text style={[styles.summaryScore, scoreToPar > 0 ? styles.overPar : styles.underPar]}>
                  {scoreToPar > 0 ? '+' : ''}{scoreToPar}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{fairwayPercentage.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Fairways Hit</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{girPercentage.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>GIR</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{averagePutts.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Putts</Text>
              </View>
            </View>
          </View>
        ))}
        
        {modifications.length > 0 && (
          <View style={styles.modificationsSection}>
            <Text style={styles.modificationsTitle}>Score Modifications</Text>
            {modifications.map((mod, index) => (
              <View key={index} style={styles.modificationItem}>
                <Text style={styles.modificationText}>
                  {mod.playerName} modified hole {mod.holeNumber} from {mod.oldScore || '-'} to {mod.newScore}
                </Text>
                <Text style={styles.modificationTime}>
                  {mod.timestamp.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Scorecard({
  courseName,
  teeName,
  teeColor,
  rating,
  slope,
  holes,
  players: initialPlayers,
  orientation = 'vertical',
  currentHole: initialHole = 1,
  competitiveOptions,
}: Props) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const settings = params.settings ? JSON.parse(params.settings as string) : null;
  
  // Initialize players with mock player first, then add players from settings
  const [players, setPlayers] = useState(() => {
    // Get other players from settings
    const otherPlayers = (settings?.players || initialPlayers || []).map((player: Player) => ({
      ...player,
      scores: Array(holes.length).fill(null),
      netScores: Array(holes.length).fill(null),
    }));

    // Return array with mock player first, followed by other players
    return [...mockPlayers, ...otherPlayers];
  });
  const [activeTab, setActiveTab] = useState<'scores' | 'stats'>('scores');
  const [currentHole, setCurrentHole] = useState(initialHole);
  const [showScoreEditModal, setShowScoreEditModal] = useState(false);
  const [editingScores, setEditingScores] = useState<{ [key: string]: number }>({});
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showMissingScoresAlert, setShowMissingScoresAlert] = useState(false);
  const [roundEndTime, setRoundEndTime] = useState<Date | null>(null);
  const [scoreModifications, setScoreModifications] = useState<{
    timestamp: Date;
    playerId: string;
    playerName: string;
    holeNumber: number;
    oldScore: number | null;
    newScore: number;
  }[]>([]);

  // Calculate gross and net scores for the selected player
  const selectedPlayer = players[selectedPlayerIndex];
  const grossScore = selectedPlayer?.scores.reduce((sum: number, score: number | null) => sum + (score || 0), 0) || 0;
  const netScore = selectedPlayer?.netScores.reduce((sum: number, score: number | null) => sum + (score || 0), 0) || 0;

  const handleAddPlayers = (newPlayers: Player[]) => {
    // Initialize scores arrays for new players
    const playersWithScores = newPlayers.map(player => ({
      ...player,
      scores: Array(holes.length).fill(null),
      netScores: Array(holes.length).fill(null),
    }));
    setPlayers([...players, ...playersWithScores]);
  };

  const handleHolePress = (holeNumber: number) => {
    setCurrentHole(holeNumber);
    // Get current scores for the hole
    const currentScores = players.reduce((acc: { [key: string]: number }, player: Player) => {
      const score = player.scores[holeNumber - 1];
      if (score !== null) {
        acc[player.id] = score;
      }
      return acc;
    }, {});
    setEditingScores(currentScores);
    setShowScoreEditModal(true);
  };

  const handleSaveScores = (scores: { [key: string]: number }) => {
    setPlayers((prev: Player[]) => prev.map((player: Player) => {
      if (scores[player.id] !== undefined) {
        const newScores = [...player.scores];
        const newNetScores = [...player.netScores];
        const score = scores[player.id];
        const oldScore = player.scores[currentHole - 1];
        
        newScores[currentHole - 1] = score;
        const netScore = score - (player.handicap || 0);
        newNetScores[currentHole - 1] = netScore;

        // Track modifications if round has ended
        if (roundEndTime) {
          setScoreModifications(prev => [...prev, {
            timestamp: new Date(),
            playerId: player.id,
            playerName: player.name,
            holeNumber: currentHole,
            oldScore,
            newScore: score
          }]);
        }
        
        return {
          ...player,
          scores: newScores,
          netScores: newNetScores,
        };
      }
      return player;
    }));
  };

  // Add new function to check for missing scores
  const hasMissingScores = () => {
    return players.some((player: Player) => 
      player.scores.some((score: number | null) => score === null)
    );
  };

  // Update handleFinishRound
  const handleFinishRound = () => {
    if (hasMissingScores()) {
      setShowMissingScoresAlert(true);
    } else {
      setRoundEndTime(new Date());
      setShowSummary(true);
    }
  };

  // Add new function to handle missing scores alert
  const handleMissingScoresAlert = (continueAnyway: boolean) => {
    setShowMissingScoresAlert(false);
    if (continueAnyway) {
      setRoundEndTime(new Date());
      setShowSummary(true);
    }
  };

  // Add new function to handle finishing the round
  const handleCompleteRound = () => {
    // Here you would typically save the round data
    router.push('/');
  };

  // If showing summary, render the RoundSummary component
  if (showSummary) {
    return (
      <RoundSummary
        players={players}
        holes={holes}
        onBackToScorecard={() => setShowSummary(false)}
        onFinishRound={handleCompleteRound}
        endTime={roundEndTime || new Date()}
        modifications={scoreModifications}
      />
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.courseDetails}>
          <Text style={styles.courseName}>{courseName}</Text>
          <Text style={styles.teeInfo}>{teeColor} Tees - {teeName}</Text>
          <Text style={styles.ratingInfo}>Rating: {rating} | Slope: {slope}</Text>
          {competitiveOptions && (
            <View style={styles.competitiveOptionsContainer}>
              <Text style={styles.competitiveOptionsText}>
                {competitiveOptions.type === 'last-round' ? 'Competing against last round' :
                 competitiveOptions.type === 'course-average' ? 'Competing against course average' :
                 competitiveOptions.type === 'best-round' ? 'Competing against best round' :
                 competitiveOptions.type === 'best-by-hole' ? 'Competing against best by hole' :
                 competitiveOptions.type === 'course-record' ? 'Competing against course record' : ''}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreLabel}>Gross/Net</Text>
            <Text style={styles.scoreValue}>{grossScore}/{netScore}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.playerSelector}
      >
        {players.map((player: Player, index: number) => (
          <TouchableOpacity
            key={player.id}
            style={[
              styles.playerSelectorItem,
              index === selectedPlayerIndex && styles.playerSelectorItemSelected
            ]}
            onPress={() => setSelectedPlayerIndex(index)}
          >
            {player.avatar ? (
              <Image source={{ uri: player.avatar }} style={styles.playerSelectorAvatar} />
            ) : (
              <View style={styles.playerSelectorAvatarPlaceholder}>
                <Text style={styles.playerSelectorAvatarText}>
                  {player.name.split(' ').map((n: string) => n[0]).join('')}
                </Text>
              </View>
            )}
            <Text style={styles.playerSelectorName} numberOfLines={1}>
              {player.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'scores' && styles.activeTab]}
        onPress={() => setActiveTab('scores')}
      >
        <Text style={[styles.tabText, activeTab === 'scores' && styles.activeTabText]}>
          Scores
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
        onPress={() => setActiveTab('stats')}
      >
        <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
          Stats
        </Text>
      </TouchableOpacity>
      {activeTab === 'scores' && (
        <Text style={styles.tabInstructions}>Click any hole column to edit scores</Text>
      )}
    </View>
  );

  const renderScorecard = () => (
    <ScrollView style={styles.scorecard}>
      <View style={styles.scorecardContainer}>
        {/* Fixed left column for labels */}
        <View style={styles.leftColumn}>
          <View style={styles.headerCell}>
            <Text style={styles.rowHeader}>Hole</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.rowHeader}>Par</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.rowHeader}>Handicap</Text>
          </View>
          {players.map((player: Player, index: number) => (
            <View key={player.id} style={styles.playerNameCell}>
              <View style={styles.playerInfo}>
                {player.avatar ? (
                  <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {player.name.split(' ').map((n: string) => n[0]).join('')}
                    </Text>
                  </View>
                )}
                <Text style={styles.playerName} numberOfLines={1}>
                  {player.name}
                </Text>
              </View>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.scorecardAddPlayerButton}
            onPress={() => setShowAddPlayerModal(true)}
          >
            <View style={styles.playerInfo}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: '#007AFF' }]}>
                <Ionicons name="add" size={16} color="#fff" />
              </View>
              <Text style={[styles.playerName, { color: '#007AFF' }]}>Add Player</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Scrollable right section for holes and scores */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {/* Header Row */}
            <View style={styles.gridRow}>
              {holes.map((hole) => (
                <TouchableOpacity
                  key={hole.number}
                  style={[
                    styles.gridCell,
                    styles.headerCell,
                    hole.number === currentHole && styles.currentHoleCell
                  ]}
                  onPress={() => handleHolePress(hole.number)}
                >
                  <Text style={styles.columnHeader}>{hole.number}</Text>
                </TouchableOpacity>
              ))}
              <View style={[styles.gridCell, styles.headerCell, styles.totalCell]}>
                <Text style={styles.columnHeader}>Total</Text>
              </View>
            </View>

            {/* Par Row */}
            <View style={styles.gridRow}>
              {holes.map((hole) => (
                <View
                  key={hole.number}
                  style={[
                    styles.gridCell,
                    styles.dataCell,
                    hole.number === currentHole && styles.currentHoleCell
                  ]}
                >
                  <Text style={styles.rowData}>{hole.par}</Text>
                </View>
              ))}
              <View style={[styles.gridCell, styles.dataCell, styles.totalCell]}>
                <Text style={styles.rowData}>{holes.reduce((sum, hole) => sum + hole.par, 0)}</Text>
              </View>
            </View>

            {/* Handicap Row */}
            <View style={styles.gridRow}>
              {holes.map((hole) => (
                <View
                  key={hole.number}
                  style={[
                    styles.gridCell,
                    styles.dataCell,
                    hole.number === currentHole && styles.currentHoleCell
                  ]}
                >
                  <Text style={styles.rowData}>{hole.handicap}</Text>
                </View>
              ))}
              <View style={[styles.gridCell, styles.dataCell, styles.totalCell]}>
                <Text style={styles.rowData}>-</Text>
              </View>
            </View>

            {/* Player Score Rows */}
            {players.map((player: Player) => (
              <View key={player.id} style={styles.gridRow}>
                {holes.map((hole, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.gridCell,
                      styles.dataCell,
                      hole.number === currentHole && styles.currentHoleCell,
                      player.scores[index] !== null && styles.filledScoreCell
                    ]}
                    onPress={() => handleHolePress(hole.number)}
                  >
                    <Text style={[
                      styles.scoreCellText,
                      player.scores[index] !== null && (
                        player.scores[index]! > holes[index].par ? styles.overParScore :
                        player.scores[index]! < holes[index].par ? styles.underParScore :
                        styles.parScore
                      )
                    ]}>
                      {player.scores[index] !== null ? player.scores[index] : '-'}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={[styles.gridCell, styles.dataCell, styles.totalCell]}>
                  <Text style={styles.totalScoreCellText}>
                    {player.scores.reduce((sum: number, score: number | null) => sum + (score || 0), 0)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Empty row for Add Player button alignment */}
            <View style={styles.gridRow}>
              {holes.map((hole, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridCell,
                    styles.dataCell,
                    hole.number === currentHole && styles.currentHoleCell,
                    styles.emptyScoreCell
                  ]}
                />
              ))}
              <View style={[styles.gridCell, styles.dataCell, styles.totalCell]} />
            </View>
          </View>
        </ScrollView>
      </View>

      <ScoreEditModal
        visible={showScoreEditModal}
        onClose={() => setShowScoreEditModal(false)}
        onSave={handleSaveScores}
        players={players}
        currentHole={currentHole}
        currentScores={editingScores}
      />
    </ScrollView>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerButton}>
        <Text style={styles.footerButtonText}>Back to GPS</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.footerButton, styles.finishButton]}
        onPress={handleFinishRound}
      >
        <Text style={styles.footerButtonText}>Finish Round</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
      </TouchableOpacity>

      {/* Add Missing Scores Alert */}
      <Modal
        visible={showMissingScoresAlert}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Missing Scores</Text>
            <Text style={styles.alertText}>
              Some scores are missing. Would you like to continue anyway?
            </Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity 
                style={[styles.alertButton, styles.alertButtonCancel]}
                onPress={() => handleMissingScoresAlert(false)}
              >
                <Text style={styles.alertButtonText}>Return to Scorecard</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.alertButton, styles.alertButtonConfirm]}
                onPress={() => handleMissingScoresAlert(true)}
              >
                <Text style={styles.alertButtonText}>End Round</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {activeTab === 'scores' ? renderScorecard() : null}
      {renderFooter()}

      <AddPlayerModal
        visible={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onAddPlayers={handleAddPlayers}
        currentSettings={JSON.stringify({
          courseName,
          teeName,
          teeColor,
          rating,
          slope,
          holes,
        })}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseDetails: {
    flex: 1,
    marginRight: 16,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  courseName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  closeButton: {
    padding: 4,
  },
  teeInfo: {
    fontSize: 16,
    color: '#667',
    marginBottom: 2,
  },
  ratingInfo: {
    fontSize: 16,
    color: '#667',
    marginBottom: 4,
  },
  scoreDisplay: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#667',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scorecard: {
    flex: 1,
  },
  scorecardContainer: {
    flexDirection: 'row',
  },
  leftColumn: {
    width: 150,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  gridContainer: {
    backgroundColor: '#fff',
  },
  gridRow: {
    flexDirection: 'row',
    height: 40,
  },
  gridCell: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  headerCell: {
    backgroundColor: '#F5F5F5',
    height: 40,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dataCell: {
    backgroundColor: '#fff',
  },
  totalCell: {
    width: 70,
    backgroundColor: '#F5F5F5',
  },
  playerNameCell: {
    height: 40,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playerName: {
    fontSize: 14,
    flex: 1,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rowHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingLeft: 8,
  },
  rowData: {
    fontSize: 14,
    color: '#333',
  },
  scoreCellText: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalScoreCellText: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentHoleCell: {
    backgroundColor: '#E3F2FD',
  },
  filledScoreCell: {
    backgroundColor: '#FAFAFA',
  },
  overParScore: {
    color: '#FF3B30',
  },
  underParScore: {
    color: '#34C759',
  },
  parScore: {
    color: '#333',
  },
  addPlayerButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginRight: 16,
    height: '100%',
  },
  addPlayerText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  finishButton: {
    marginRight: 8,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  moreButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  tabInstructions: {
    position: 'absolute',
    bottom: 4,
    left: 16,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  playerSelector: {
    marginTop: 12,
  },
  playerSelectorItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
  },
  playerSelectorItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  playerSelectorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  playerSelectorAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerSelectorAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playerSelectorName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  alertContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  alertText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  alertButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  alertButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  alertButtonConfirm: {
    backgroundColor: '#007AFF',
  },
  alertButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  summaryContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  summaryHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginHorizontal: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryScroll: {
    flex: 1,
    padding: 16,
  },
  summaryPlayerCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryPlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryPlayerInfo: {
    marginLeft: 12,
  },
  summaryPlayerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryPlayerHandicap: {
    fontSize: 14,
    color: '#666',
  },
  summaryScores: {
    alignItems: 'flex-end',
  },
  summaryScore: {
    fontSize: 16,
    marginBottom: 4,
  },
  overPar: {
    color: '#FF3B30',
  },
  underPar: {
    color: '#34C759',
  },
  summaryEndTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modificationsSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  modificationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modificationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modificationText: {
    fontSize: 14,
    color: '#333',
  },
  modificationTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  competitiveOptionsContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  competitiveOptionsText: {
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scoreInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalPlayerName: {
    fontSize: 16,
    marginLeft: 12,
  },
  scoreInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scorecardAddPlayerButton: {
    height: 40,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F5',
  },
  emptyScoreCell: {
    backgroundColor: '#F5F5F5',
  },
}); 