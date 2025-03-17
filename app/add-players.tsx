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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CompetitiveOptionsModal } from './competitive-options-modal';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  lastPlayed?: string;
}

// Mock data - replace with actual data from your backend
const recentPlayers: Player[] = [
  { id: '1', name: 'John Smith', lastPlayed: '2 days ago' },
  { id: '2', name: 'Mike Johnson', lastPlayed: '1 week ago' },
  { id: '3', name: 'Sarah Williams', lastPlayed: '2 weeks ago' },
  { id: '4', name: 'David Brown', lastPlayed: '3 weeks ago' },
  { id: '5', name: 'Emma Davis', lastPlayed: '1 month ago' },
];

const allFriends: Player[] = [
  { id: '6', name: 'Alex Wilson' },
  { id: '7', name: 'Lisa Anderson' },
  { id: '8', name: 'Tom Martinez' },
  { id: '9', name: 'Rachel Lee' },
  { id: '10', name: 'Chris Taylor' },
];

export default function AddPlayersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [showCompetitiveOptions, setShowCompetitiveOptions] = useState(false);
  const [selectedCompetitiveOption, setSelectedCompetitiveOption] = useState<string>();

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

  const handleStartRound = () => {
    if (selectedPlayers.size === 0) return;

    const settings = JSON.parse(params.settings as string);
    const selectedPlayersList = [...selectedPlayers].map(id => {
      const player = [...recentPlayers, ...allFriends].find(p => p.id === id);
      return { id, name: player?.name };
    });

    router.push({
      pathname: '/active-round' as any,
      params: {
        ...params,
        settings: JSON.stringify({
          ...settings,
          players: selectedPlayersList,
        }),
      },
    });
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={[
        styles.playerItem,
        selectedPlayers.has(item.id) && styles.playerItemSelected,
      ]}
      onPress={() => handlePlayerSelect(item.id)}
    >
      <View style={styles.playerInfo}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.playerDetails}>
          <Text style={styles.playerName}>{item.name}</Text>
          {item.lastPlayed && (
            <Text style={styles.lastPlayed}>Last played: {item.lastPlayed}</Text>
          )}
        </View>
      </View>
      {selectedPlayers.has(item.id) && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  const filteredFriends = allFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Players</Text>
      </View>

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

      <FlatList
        data={filteredFriends}
        renderItem={renderPlayerItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Recently Played With</Text>
            {recentPlayers.map(player => renderPlayerItem({ item: player }))}
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

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedPlayers.size} player{selectedPlayers.size !== 1 ? 's' : ''} selected
        </Text>
        <TouchableOpacity
          style={[
            styles.startButton,
            selectedPlayers.size === 0 && styles.startButtonDisabled,
          ]}
          onPress={handleStartRound}
          disabled={selectedPlayers.size === 0}
        >
          <Text style={styles.startButtonText}>Start Round</Text>
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
  title: {
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
}); 