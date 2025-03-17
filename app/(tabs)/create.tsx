import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useAppStore } from '../hooks/use-app-store';

export default function CreateRoundScreen() {
  const router = useRouter();
  const { addRound } = useAppStore();
  const [score, setScore] = useState('');
  const [par, setPar] = useState('');
  const [holes, setHoles] = useState('18');
  
  const handleClose = () => {
    router.back();
  };
  
  const handleSubmit = () => {
    if (!score || !par) {
      Alert.alert('Error', 'Please enter both score and par');
      return;
    }

    const scoreNum = parseInt(score);
    const parNum = parseInt(par);
    const holesNum = parseInt(holes);

    if (isNaN(scoreNum) || isNaN(parNum) || isNaN(holesNum)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    const newRound = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score: scoreNum,
      par: parNum,
      holes: holesNum,
      courseId: 'placeholder' // This should be replaced with actual course selection
    };

    addRound(newRound);
    router.replace('/');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Round</Text>
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Score</Text>
          <TextInput
            style={styles.input}
            value={score}
            onChangeText={setScore}
            keyboardType="number-pad"
            placeholder="Enter your score"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Par</Text>
          <TextInput
            style={styles.input}
            value={par}
            onChangeText={setPar}
            keyboardType="number-pad"
            placeholder="Enter course par"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Holes</Text>
          <TextInput
            style={styles.input}
            value={holes}
            onChangeText={setHoles}
            keyboardType="number-pad"
            placeholder="Number of holes"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitText: {
    color: colors.white,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
});