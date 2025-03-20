import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CompetitiveOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const competitiveOptions: CompetitiveOption[] = [
  {
    id: 'last-round',
    name: 'Play Against My Last Round',
    description: 'Compare your performance with your most recent round at this course',
    icon: 'time-outline',
  },
  {
    id: 'course-average',
    name: 'Play Against My Course Average',
    description: 'Challenge yourself to beat your average score at this course',
    icon: 'stats-chart-outline',
  },
  {
    id: 'best-round',
    name: 'Play Against My Best Round',
    description: 'Try to match or beat your personal best at this course',
    icon: 'trophy-outline',
  },
  {
    id: 'best-by-hole',
    name: 'Play Against My Best Score by Hole',
    description: 'Compete against your best score for each individual hole at this course',
    icon: 'grid-outline',
  },
  {
    id: 'course-record',
    name: 'Play Against Course Record',
    description: 'Compete against the best scores recorded for each hole',
    icon: 'medal-outline',
  },
];

interface CompetitiveOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

export const CompetitiveOptionsModal: React.FC<CompetitiveOptionsModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedOption,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Play Against Your Best Scores</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {competitiveOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                selectedOption === option.id && styles.optionItemSelected,
              ]}
              onPress={() => onSelect(option.id)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon as any} size={24} color="#4CAF50" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{option.name}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              {selectedOption === option.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  optionItemSelected: {
    backgroundColor: '#f0f9f0',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 