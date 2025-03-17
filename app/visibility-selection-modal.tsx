import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { colors } from './constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface VisibilitySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (visibility: 'everyone' | 'friends' | 'private' | 'group', groupId?: string) => void;
  selectedVisibility: ('everyone' | 'friends' | 'private' | 'group')[];
  selectedGroupIds: string[];
  userGroups?: Array<{
    id: string;
    name: string;
    memberCount: number;
  }>;
}

export const VisibilitySelectionModal: React.FC<VisibilitySelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedVisibility,
  selectedGroupIds,
  userGroups = [
    { id: '1', name: 'Georgia Hackers', memberCount: 150 },
    { id: '2', name: 'Atlanta Golf Club', memberCount: 75 },
    { id: '3', name: 'Peachtree Golfers', memberCount: 200 },
  ],
}) => {
  const [showGroups, setShowGroups] = React.useState(false);

  const visibilityOptions = [
    { id: 'everyone', label: 'Everyone', icon: 'globe-outline' },
    { id: 'friends', label: 'Friends', icon: 'people-outline' },
    { id: 'private', label: 'Only Me', icon: 'lock-closed-outline' },
    { id: 'group', label: 'Golf Clubs', icon: 'golf-outline' },
  ];

  const handleSelect = (visibility: 'everyone' | 'friends' | 'private' | 'group') => {
    if (visibility === 'private') {
      // If selecting private, clear all other selections
      onSelect('private');
      onClose();
      return;
    }

    if (visibility === 'group') {
      setShowGroups(true);
      return;
    }

    // Toggle the selection
    if (selectedVisibility.includes(visibility)) {
      // If trying to deselect the last option, keep 'everyone' selected
      if (selectedVisibility.length === 1) {
        onSelect('everyone');
      } else {
        onSelect(visibility);
      }
    } else {
      onSelect(visibility);
    }
  };

  const handleGroupSelect = (groupId: string) => {
    // Toggle group selection
    if (selectedGroupIds.includes(groupId)) {
      // Remove the group
      onSelect('group', groupId);
    } else {
      // Add the group
      onSelect('group', groupId);
    }
  };

  const isOptionSelected = (optionId: string) => {
    return selectedVisibility.includes(optionId as any);
  };

  const isGroupSelected = (groupId: string) => {
    return selectedGroupIds.includes(groupId);
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
            <TouchableOpacity 
              onPress={() => showGroups ? setShowGroups(false) : onClose()} 
              style={styles.backButton}
            >
              <Ionicons name={showGroups ? "arrow-back" : "close"} size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {showGroups ? 'Select Golf Clubs' : 'Round Visibility'}
            </Text>
          </View>

          {!showGroups ? (
            <View style={styles.optionsList}>
              {visibilityOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    isOptionSelected(option.id as any) && styles.selectedOptionButton,
                  ]}
                  onPress={() => handleSelect(option.id as any)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={isOptionSelected(option.id as any) ? colors.background : colors.text} 
                  />
                  <Text style={[
                    styles.optionButtonText,
                    isOptionSelected(option.id as any) && styles.selectedOptionButtonText,
                  ]}>
                    {option.label}
                  </Text>
                  {isOptionSelected(option.id as any) && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.background} style={styles.checkmark} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <ScrollView style={styles.groupsList}>
              {userGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupButton,
                    isGroupSelected(group.id) && styles.selectedGroupButton,
                  ]}
                  onPress={() => handleGroupSelect(group.id)}
                >
                  <View style={styles.groupInfo}>
                    <Text style={[
                      styles.groupName,
                      isGroupSelected(group.id) && styles.selectedGroupButtonText,
                    ]}>
                      {group.name}
                    </Text>
                    <Text style={[
                      styles.memberCount,
                      isGroupSelected(group.id) && styles.selectedGroupButtonText,
                    ]}>
                      {group.memberCount} members
                    </Text>
                  </View>
                  {isGroupSelected(group.id) && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.background} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
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
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.card,
    borderRadius: 10,
    gap: 15,
  },
  selectedOptionButton: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  selectedOptionButtonText: {
    color: colors.background,
  },
  checkmark: {
    marginLeft: 'auto',
  },
  groupsList: {
    gap: 10,
  },
  groupButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.card,
    borderRadius: 10,
  },
  selectedGroupButton: {
    backgroundColor: colors.primary,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  memberCount: {
    color: colors.text,
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  selectedGroupButtonText: {
    color: colors.background,
    opacity: 1,
  },
}); 