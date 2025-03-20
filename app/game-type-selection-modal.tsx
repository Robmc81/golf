import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GameTypeOption {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const gameTypes: GameTypeOption[] = [
  {
    id: 'stroke',
    label: 'Stroke Play',
    description: 'Standard golf scoring where each stroke counts',
    icon: 'golf-outline',
  },
  {
    id: 'tournament',
    label: 'Tournament',
    description: 'Competitive round with official scoring',
    icon: 'trophy-outline',
  },
  {
    id: 'skins',
    label: 'Skins',
    description: 'Each hole is worth points or money',
    icon: 'cash-outline',
  },
  {
    id: 'match',
    label: 'Match Play',
    description: 'Head-to-head competition hole by hole',
    icon: 'people-outline',
  },
  {
    id: 'practice',
    label: 'Practice Round',
    description: 'Casual round for practice and improvement',
    icon: 'school-outline',
  },
  {
    id: 'scramble',
    label: 'Scramble',
    description: 'Team format where best shot is played',
    icon: 'git-branch-outline',
  },
  {
    id: 'me-vs-me',
    label: 'Me vs Me',
    description: 'Play against your last round or course average',
    icon: 'time-outline',
  },
];

interface GameTypeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gameType: string) => void;
  selectedGameType: string;
}

export const GameTypeSelectionModal: React.FC<GameTypeSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedGameType,
}) => {
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
            <Text style={styles.modalTitle}>Select Game Type</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {gameTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionButton,
                  selectedGameType === type.id && styles.optionButtonSelected,
                ]}
                onPress={() => onSelect(type.id)}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={selectedGameType === type.id ? '#fff' : '#4CAF50'}
                  />
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedGameType === type.id && styles.optionLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        selectedGameType === type.id && styles.optionDescriptionSelected,
                      ]}
                    >
                      {type.description}
                    </Text>
                  </View>
                </View>
                {selectedGameType === type.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  optionButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#fff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionSelected: {
    color: '#fff',
  },
}); 