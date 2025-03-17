import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors } from './constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface TeeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gender: 'men' | 'women', color: string) => void;
  selectedGender: 'men' | 'women';
  selectedTee: {
    color: string;
    gender: 'male' | 'female';
  } | null;
}

export const TeeSelectionModal: React.FC<TeeSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedGender,
  selectedTee,
}) => {
  const [activeGender, setActiveGender] = React.useState<'men' | 'women'>(selectedGender || 'men');

  const tees = {
    men: [
      { color: 'black', yards: '3906' },
      { color: 'middle', yards: '3308' },
      { color: 'forward', yards: '2800' },
    ],
    women: [
      { color: 'black', yards: '3500' },
      { color: 'middle', yards: '3000' },
      { color: 'forward', yards: '2500' },
    ],
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
            <Text style={styles.modalTitle}>Select Tee</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === 'men' && styles.genderButtonSelected,
              ]}
              onPress={() => setActiveGender('men')}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  selectedGender === 'men' && styles.genderButtonTextSelected,
                ]}
              >
                Men
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                selectedGender === 'women' && styles.genderButtonSelected,
              ]}
              onPress={() => setActiveGender('women')}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  selectedGender === 'women' && styles.genderButtonTextSelected,
                ]}
              >
                Women
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.teeContainer}>
            {tees[activeGender].map((tee) => (
              <TouchableOpacity
                key={tee.color}
                style={[
                  styles.teeButton,
                  selectedTee?.color === tee.color && styles.teeButtonSelected,
                ]}
                onPress={() => onSelect(activeGender, tee.color as string)}
              >
                <Text
                  style={[
                    styles.teeButtonText,
                    selectedTee?.color === tee.color && styles.teeButtonTextSelected,
                  ]}
                >
                  {tee.color.charAt(0).toUpperCase() + tee.color.slice(1)} Tee
                </Text>
                <Text style={[
                  styles.teeYardsText,
                  selectedTee?.color === tee.color && styles.selectedTeeButtonText,
                ]}>
                  {tee.yards} yds
                </Text>
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
    backgroundColor: colors.background,
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
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 5,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  genderButtonSelected: {
    backgroundColor: colors.primary,
  },
  genderButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: colors.background,
  },
  teeContainer: {
    gap: 10,
  },
  teeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.card,
    borderRadius: 10,
  },
  teeButtonSelected: {
    backgroundColor: colors.primary,
  },
  teeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  teeButtonTextSelected: {
    color: colors.background,
    opacity: 1,
  },
  teeYardsText: {
    color: colors.text,
    fontSize: 16,
    opacity: 0.7,
  },
  selectedTeeButtonText: {
    color: colors.background,
    opacity: 1,
  },
}); 