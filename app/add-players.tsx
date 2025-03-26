import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './lib/supabase';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  handicap: number | null;
  avatar_url: string | null;
}

// Helper function to validate profile data
const isValidProfile = (profile: Profile): boolean => {
  return !!(
    profile.id &&
    profile.first_name &&
    profile.last_name &&
    profile.username
  );
};

export default function AddPlayersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, handicap, avatar_url')
        .order('first_name');

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      // Filter out profiles with missing required data
      const validProfiles = (data || []).filter(isValidProfile);
      setProfiles(validProfiles);
    } catch (error) {
      console.error('Error in loadProfiles:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDone = () => {
    const selectedPlayersList = profiles.filter(profile => 
      selectedPlayers.has(profile.id)
    );
    router.back();
    // Pass selected players back to round settings
    router.setParams({ selectedPlayers: JSON.stringify(selectedPlayersList) });
  };

  const filteredProfiles = profiles.filter(profile => {
    // Additional safety check
    if (!isValidProfile(profile)) return false;
    
    return `${profile.first_name} ${profile.last_name} ${profile.username}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const renderProfile = ({ item }: { item: Profile }) => {
    // Extra safety check - skip rendering if profile is invalid
    if (!isValidProfile(item)) return null;

    const isSelected = selectedPlayers.has(item.id);

    return (
      <TouchableOpacity 
        style={[styles.profileItem, isSelected && styles.profileItemSelected]}
        onPress={() => handlePlayerSelect(item.id)}
      >
        <View style={styles.profileInfo}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.first_name && item.last_name ? 
                    `${item.first_name[0]}${item.last_name[0]}` : 
                    '??'}
                </Text>
              </View>
            )}
          </View>

          {/* Profile Details */}
          <View style={styles.details}>
            <Text style={styles.name}>{`${item.first_name} ${item.last_name}`}</Text>
            <Text style={styles.username}>@{item.username}</Text>
            {item.handicap !== null && (
              <Text style={styles.handicap}>Handicap: {item.handicap}</Text>
            )}
          </View>

          {/* Selection Indicator */}
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Players</Text>
        <TouchableOpacity onPress={handleDone}>
          <Text style={styles.doneButton}>Done ({selectedPlayers.size})</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      {/* Players List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={filteredProfiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    padding: 16,
  },
  profileItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileItemSelected: {
    backgroundColor: '#f0f9f0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#eee',
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
    fontSize: 18,
    fontWeight: '600',
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  handicap: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
}); 