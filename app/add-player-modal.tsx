import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import AddPlayersScreen from './add-players';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddPlayers: (players: any[]) => void;
  currentSettings: string;
}

export default function AddPlayerModal({ visible, onClose, onAddPlayers, currentSettings }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <AddPlayersScreen
          isModal={true}
          onClose={onClose}
          onAddPlayers={onAddPlayers}
          settings={currentSettings}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 