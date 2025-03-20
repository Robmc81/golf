import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CompetitiveOptionsModal } from './competitive-options-modal';
import { GuestPlayerModal } from './guest-player-modal';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  lastPlayed?: string;
  gender?: 'male' | 'female';
  handicap?: number;
  phone?: string;
  email?: string;
  isGuest?: boolean;
  scores: (number | null)[];
  netScores: (number | null)[];
}

// Mock data - replace with actual data from your backend
const recentPlayers: Player[] = [
  { id: '1', name: 'John Smith', lastPlayed: '2 days ago', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
  { id: '2', name: 'Mike Johnson', lastPlayed: '1 week ago', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
  { id: '3', name: 'Sarah Williams', lastPlayed: '2 weeks ago', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
  { id: '4', name: 'David Brown', lastPlayed: '3 weeks ago', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
  { id: '5', name: 'Emma Davis', lastPlayed: '1 month ago', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
];

const allFriends: Player[] = [
  { id: '6', name: 'Alex Wilson', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
  { id: '7', name: 'Lisa Anderson', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
  { id: '8', name: 'Tom Martinez', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
  { id: '9', name: 'Rachel Lee', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
  { id: '10', name: 'Chris Taylor', scores: Array(18).fill(null), netScores: Array(18).fill(null) },
];

interface Props {
  isModal?: boolean;
  onClose?: () => void;
  onAddPlayers?: (players: Player[]) => void;
  settings?: string;
}

export default function AddPlayersScreen({ 
  isModal, 
  onClose, 
  onAddPlayers,
  settings: initialSettings 
}: Props = {}) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const settings = initialSettings ? JSON.parse(initialSettings) : JSON.parse(params.settings as string);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [showCompetitiveOptions, setShowCompetitiveOptions] = useState(false);
  const [selectedCompetitiveOption, setSelectedCompetitiveOption] = useState<string>();
  const [showGuestPlayerModal, setShowGuestPlayerModal] = useState(false);
  const [guestPlayers, setGuestPlayers] = useState<Player[]>([]);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const handleCompetitiveOptionSelect = (optionId: string) => {
    setSelectedCompetitiveOption(optionId);
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      // Remove any existing competitive options
      ['last-round', 'course-average', 'best-round', 'best-by-hole', 'course-record'].forEach(id => {
        newSet.delete(id);
      });
      // Add the new selection
      newSet.add(optionId);
      return newSet;
    });
    setShowCompetitiveOptions(false);
  };

  const handleAddGuestPlayer = (player: {
    name: string;
    gender: 'male' | 'female';
    handicap?: number;
    phone?: string;
    email?: string;
  }) => {
    const newGuestPlayer: Player = {
      id: `guest-${Date.now()}`,
      name: player.name,
      gender: player.gender,
      handicap: player.handicap,
      phone: player.phone,
      email: player.email,
      isGuest: true,
      scores: Array(18).fill(null),
      netScores: Array(18).fill(null),
    };
    setGuestPlayers(prev => [...prev, newGuestPlayer]);
    // Automatically select the new guest player
    setSelectedPlayers(prev => new Set([...prev, newGuestPlayer.id]));
  };

  const handleStartRound = () => {
    if (selectedPlayers.size === 0) return;

    const selectedPlayersList = [...selectedPlayers].map(id => {
      const player = [...recentPlayers, ...allFriends, ...guestPlayers].find(p => p.id === id);
      if (!player) return null;
      
      const newPlayer: Player = {
        id,
        name: player.name,
        scores: player.scores,
        netScores: player.netScores,
        avatar: player.avatar,
        gender: player.gender,
        handicap: player.handicap,
        phone: player.phone,
        email: player.email,
        isGuest: player.isGuest,
      };
      
      return newPlayer;
    }).filter((player): player is Player => player !== null);

    // Handle competitive options
    const competitiveOptions = selectedCompetitiveOption ? {
      type: selectedCompetitiveOption,
      target: selectedCompetitiveOption === 'last-round' ? 'last' :
              selectedCompetitiveOption === 'course-average' ? 'average' :
              selectedCompetitiveOption === 'best-round' ? 'best' :
              selectedCompetitiveOption === 'best-by-hole' ? 'best-hole' :
              selectedCompetitiveOption === 'course-record' ? 'record' : 'none'
    } : undefined;

    if (isModal && onAddPlayers) {
      onAddPlayers(selectedPlayersList);
      onClose?.();
    } else {
      router.push({
        pathname: '/active-round' as any,
        params: {
          ...params,
          settings: JSON.stringify({
            ...settings,
            players: selectedPlayersList,
            competitiveOptions,
          }),
        },
      });
    }
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={[
        styles.playerItem,
        selectedPlayers.has(item.id) && styles.playerItemSelected,
        item.isGuest && styles.guestPlayerItem,
      ]}
      onPress={() => handlePlayerSelect(item.id)}
    >
      <View style={styles.playerInfo}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, item.isGuest && styles.guestAvatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.playerDetails}>
          <Text style={styles.playerName}>
            {item.name}
            {item.isGuest && <Text style={styles.guestBadge}> (Guest)</Text>}
          </Text>
          {item.lastPlayed && (
            <Text style={styles.lastPlayed}>Last played: {item.lastPlayed}</Text>
          )}
          {item.handicap !== undefined && (
            <Text style={styles.playerDetails}>Handicap: {item.handicap}</Text>
          )}
        </View>
      </View>
      {selectedPlayers.has(item.id) && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  const allPlayers = [...recentPlayers, ...allFriends, ...guestPlayers];
  const filteredPlayers = allPlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSelectedPlayerAvatar = (playerId: string) => {
    const player = [...recentPlayers, ...allFriends, ...guestPlayers].find(p => p.id === playerId);
    if (!player) return null;

    return (
      <View key={playerId} style={styles.selectedPlayerAvatar}>
        {player.avatar ? (
          <Image source={{ uri: player.avatar }} style={styles.selectedAvatarImage} />
        ) : (
          <View style={[
            styles.selectedAvatarPlaceholder,
            player.isGuest && styles.selectedGuestAvatarPlaceholder
          ]}>
            <Text style={styles.selectedAvatarText}>
              {player.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        )}
        <Text style={styles.selectedPlayerName} numberOfLines={1}>
          {player.name}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={isModal ? onClose : () => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Players</Text>
      </View>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => {
          if (isModal && onClose) {
            onClose();
          } else {
            router.push({
              pathname: '/active-round' as any,
              params: {
                ...params,
                settings: JSON.stringify({
                  ...settings,
                  players: [],
                  competitiveOptions: undefined,
                }),
              },
            });
          }
        }}
      >
        <Text style={styles.skipButtonText}>Skip Adding Players</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity
        style={styles.competitiveButton}
        onPress={() => setShowCompetitiveOptions(true)}
      >
        <View style={styles.competitiveButtonContent}>
          <Ionicons name="trophy-outline" size={24} color="#4CAF50" />
          <View style={styles.competitiveButtonText}>
            <Text style={styles.competitiveButtonTitle}>Play Against Your Best Scores</Text>
            <Text style={styles.competitiveButtonSubtitle}>
              {selectedCompetitiveOption ? 'Selected' : 'Select a competitive option'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addGuestButton}
        onPress={() => setShowGuestPlayerModal(true)}
      >
        <View style={styles.addGuestButtonContent}>
          <Ionicons name="person-add-outline" size={24} color="#4CAF50" />
          <Text style={styles.addGuestButtonText}>Write-In Guest Player</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayerItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Recently Played With</Text>
            {recentPlayers.map(player => renderPlayerItem({ item: player }))}
            {guestPlayers.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Guest Players</Text>
                {guestPlayers.map(player => renderPlayerItem({ item: player }))}
              </>
            )}
            <Text style={styles.sectionTitle}>All Friends</Text>
          </>
        }
      />

      <CompetitiveOptionsModal
        visible={showCompetitiveOptions}
        onClose={() => setShowCompetitiveOptions(false)}
        onSelect={handleCompetitiveOptionSelect}
        selectedOption={selectedCompetitiveOption}
      />

      <GuestPlayerModal
        visible={showGuestPlayerModal}
        onClose={() => setShowGuestPlayerModal(false)}
        onAdd={handleAddGuestPlayer}
      />

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedPlayers.size} player{selectedPlayers.size !== 1 ? 's' : ''} selected
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.selectedPlayersContainer}
        >
          {[...selectedPlayers].map(renderSelectedPlayerAvatar)}
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.startButton,
            selectedPlayers.size === 0 && styles.startButtonDisabled,
          ]}
          onPress={handleStartRound}
          disabled={selectedPlayers.size === 0}
        >
          <Text style={styles.startButtonText}>
            {isModal ? "Add to Round" : "Start Round"}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playerItemSelected: {
    backgroundColor: '#f0f9f0',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  lastPlayed: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  selectedPlayersContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  selectedPlayerAvatar: {
    alignItems: 'center',
    marginRight: 12,
    width: 60,
  },
  selectedAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  selectedAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedGuestAvatarPlaceholder: {
    backgroundColor: '#FFA726',
  },
  selectedAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPlayerName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  competitiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 8,
  },
  competitiveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  competitiveButtonText: {
    marginLeft: 12,
  },
  competitiveButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  competitiveButtonSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  addGuestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 8,
  },
  addGuestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addGuestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  guestPlayerItem: {
    backgroundColor: '#f8f9fa',
  },
  guestAvatarPlaceholder: {
    backgroundColor: '#FFA726',
  },
  guestBadge: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  skipButton: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
}); 