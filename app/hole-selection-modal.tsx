import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { colors } from './constants/colors';

interface HoleSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (hole: number) => void;
  currentHole: number;
}

export default function HoleSelectionModal({ visible, onClose, onSelect, currentHole }: HoleSelectionModalProps) {
  const holes = Array.from({ length: 18 }, (_, i) => i + 1);

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
            <Text style={styles.title}>Select Starting Hole</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.holesList}>
            {holes.map((hole) => (
              <TouchableOpacity
                key={hole}
                style={[
                  styles.holeButton,
                  currentHole === hole && styles.holeButtonActive
                ]}
                onPress={() => {
                  onSelect(hole);
                  onClose();
                }}
              >
                <Text style={[
                  styles.holeText,
                  currentHole === hole && styles.holeTextActive
                ]}>
                  Hole {hole}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  holesList: {
    maxHeight: 400,
  },
  holeButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  holeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  holeText: {
    fontSize: 16,
    color: '#333',
  },
  holeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
}); 