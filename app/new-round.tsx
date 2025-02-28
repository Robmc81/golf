import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import Colors from '@/constants/colors';
import { Button } from '@/components/Button';
import { Flag, Calendar, User, Plus, X, ChevronDown, LogOut } from 'lucide-react-native';

export default function NewRoundScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { courses, createRound } = useAppStore();
  const { logout } = useAuthStore();
  
  // Get course and tee from params if available
  const preselectedCourseId = params.courseId as string;
  const preselectedTeeId = params.teeId as string;
  
  // State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(preselectedCourseId || '');
  const [selectedTeeId, setSelectedTeeId] = useState<string>(preselectedTeeId || '');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showTeeDropdown, setShowTeeDropdown] = useState(false);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([
    { id: 'player1', name: 'You' }
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  // Get selected course
  const selectedCourse = courses.find(course => course.id === selectedCourseId);
  
  // Get available tees for selected course
  const availableTees = selectedCourse?.tees || [];
  
  // Set default tee if course is selected and no tee is selected
  useEffect(() => {
    if (selectedCourseId && !selectedTeeId && availableTees.length > 0) {
      setSelectedTeeId(availableTees[0].id);
    }
  }, [selectedCourseId, selectedTeeId, availableTees]);
  
  // Add new player
  const handleAddPlayer = () => {
    if (newPlayerName.trim() && players.length < 4) {
      setPlayers([
        ...players,
        { id: `player${players.length + 1}`, name: newPlayerName.trim() }
      ]);
      setNewPlayerName('');
    }
  };
  
  // Remove player
  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(player => player.id !== id));
  };
  
  // Start round
  const handleStartRound = () => {
    if (!selectedCourseId || !selectedTeeId) return;
    
    const selectedTee = availableTees.find(tee => tee.id === selectedTeeId);
    if (!selectedTee) return;
    
    const newRound = createRound({
      courseId: selectedCourseId,
      courseName: selectedCourse?.name || '',
      date: new Date().toISOString(),
      teeId: selectedTeeId,
      teeName: selectedTee.name,
      completed: false,
      players: players.map(player => ({
        id: player.id,
        name: player.name,
        scores: [],
        totalScore: 0,
        totalToPar: 0
      }))
    });
    
    router.replace(`/round/${newRound.id}`);
  };

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
          title: 'New Round',
          headerBackTitle: 'Back',
          headerRight: () => <LogoutButton />
        }} 
      />
      
      <View style={styles.content}>
        {/* Course Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Course</Text>
          
          <Pressable 
            style={styles.dropdown}
            onPress={() => setShowCourseDropdown(!showCourseDropdown)}
          >
            <View style={styles.dropdownHeader}>
              <Flag size={20} color={Colors.primary} style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>
                {selectedCourse ? selectedCourse.name : 'Select a course'}
              </Text>
              <ChevronDown size={20} color={Colors.subtext} />
            </View>
          </Pressable>
          
          {showCourseDropdown && (
            <View style={styles.dropdownContent}>
              {courses.map(course => (
                <Pressable
                  key={course.id}
                  style={[
                    styles.dropdownItem,
                    selectedCourseId === course.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCourseId(course.id);
                    setSelectedTeeId('');
                    setShowCourseDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    selectedCourseId === course.id && styles.dropdownItemTextSelected
                  ]}>
                    {course.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        
        {/* Tee Selection */}
        {selectedCourse && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Tee</Text>
            
            <Pressable 
              style={styles.dropdown}
              onPress={() => setShowTeeDropdown(!showTeeDropdown)}
            >
              <View style={styles.dropdownHeader}>
                {selectedTeeId ? (
                  <View 
                    style={[
                      styles.teeColorIndicator, 
                      { backgroundColor: availableTees.find(t => t.id === selectedTeeId)?.color || '#ccc' }
                    ]} 
                  />
                ) : (
                  <Flag size={20} color={Colors.primary} style={styles.dropdownIcon} />
                )}
                <Text style={styles.dropdownText}>
                  {selectedTeeId 
                    ? availableTees.find(t => t.id === selectedTeeId)?.name + ' Tees'
                    : 'Select tees'
                  }
                </Text>
                <ChevronDown size={20} color={Colors.subtext} />
              </View>
            </Pressable>
            
            {showTeeDropdown && (
              <View style={styles.dropdownContent}>
                {availableTees.map(tee => (
                  <Pressable
                    key={tee.id}
                    style={[
                      styles.dropdownItem,
                      selectedTeeId === tee.id && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setSelectedTeeId(tee.id);
                      setShowTeeDropdown(false);
                    }}
                  >
                    <View style={styles.teeDropdownItem}>
                      <View 
                        style={[
                          styles.teeColorIndicator, 
                          { backgroundColor: tee.color }
                        ]} 
                      />
                      <Text style={[
                        styles.dropdownItemText,
                        selectedTeeId === tee.id && styles.dropdownItemTextSelected
                      ]}>
                        {tee.name} Tees
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
        
        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          
          <View style={styles.dateContainer}>
            <Calendar size={20} color={Colors.primary} style={styles.dateIcon} />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>
        
        {/* Players */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          
          {players.map(player => (
            <View key={player.id} style={styles.playerItem}>
              <User size={20} color={Colors.primary} style={styles.playerIcon} />
              <Text style={styles.playerName}>{player.name}</Text>
              {players.length > 1 && (
                <Pressable 
                  style={styles.removePlayerButton}
                  onPress={() => handleRemovePlayer(player.id)}
                >
                  <X size={16} color={Colors.error} />
                </Pressable>
              )}
            </View>
          ))}
          
          {players.length < 4 && (
            <View style={styles.addPlayerContainer}>
              <TextInput
                style={styles.addPlayerInput}
                placeholder="Add player..."
                value={newPlayerName}
                onChangeText={setNewPlayerName}
                placeholderTextColor={Colors.subtext}
              />
              <Pressable 
                style={[
                  styles.addPlayerButton,
                  !newPlayerName.trim() && styles.addPlayerButtonDisabled
                ]}
                onPress={handleAddPlayer}
                disabled={!newPlayerName.trim()}
              >
                <Plus size={20} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
        
        {/* Start Round Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Start Round"
            onPress={handleStartRound}
            variant="primary"
            fullWidth
            disabled={!selectedCourseId || !selectedTeeId}
          />
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  dropdownContent: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primary + '20', // 20% opacity
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  dropdownItemTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  teeDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teeColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateIcon: {
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerIcon: {
    marginRight: 12,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  removePlayerButton: {
    padding: 4,
  },
  addPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addPlayerInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  addPlayerButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlayerButtonDisabled: {
    backgroundColor: Colors.subtext,
  },
  actionContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
});