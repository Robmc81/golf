import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors } from './constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface TeeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gender: 'men' | 'women', tee: 'black' | 'middle' | 'forward') => void;
  selectedGender?: 'men' | 'women';
  selectedTee?: 'black' | 'middle' | 'forward';
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
          <View style={styles.header}>
            <Text style={styles.title}>Select Tee</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.genderSelector}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                activeGender === 'men' && styles.activeGenderButton,
              ]}
              onPress={() => setActiveGender('men')}
            >
              <Text style={[
                styles.genderButtonText,
                activeGender === 'men' && styles.activeGenderButtonText,
              ]}>Men</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                activeGender === 'women' && styles.activeGenderButton,
              ]}
              onPress={() => setActiveGender('women')}
            >
              <Text style={[
                styles.genderButtonText,
                activeGender === 'women' && styles.activeGenderButtonText,
              ]}>Women</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.teeList}>
            {tees[activeGender].map((tee) => (
              <TouchableOpacity
                key={tee.color}
                style={[
                  styles.teeButton,
                  selectedTee === tee.color && styles.selectedTeeButton,
                ]}
                onPress={() => onSelect(activeGender, tee.color as 'black' | 'middle' | 'forward')}
              >
                <Text style={[
                  styles.teeButtonText,
                  selectedTee === tee.color && styles.selectedTeeButtonText,
                ]}>
                  {tee.color.charAt(0).toUpperCase() + tee.color.slice(1)} Tee
                </Text>
                <Text style={[
                  styles.teeYardsText,
                  selectedTee === tee.color && styles.selectedTeeButtonText,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  genderSelector: {
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
  activeGenderButton: {
    backgroundColor: colors.primary,
  },
  genderButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  activeGenderButtonText: {
    color: colors.background,
  },
  teeList: {
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
  selectedTeeButton: {
    backgroundColor: colors.primary,
  },
  teeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
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