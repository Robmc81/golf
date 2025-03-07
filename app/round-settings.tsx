import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';

interface RoundSettings {
  isCompetitive: boolean;
  trackPutts: boolean;
  trackGIR: boolean;
  trackFairways: boolean;
  numberOfPlayers: number;
}

/**
 * RoundSettingsScreen Component
 * Allows users to configure settings for their golf round including:
 * - Game type (competitive/casual)
 * - Statistics tracking preferences
 * - Number of players
 * 
 * These settings are passed to the active round screen when starting a new round.
 */
export default function RoundSettingsScreen() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  
  // Get route parameters from previous screen
  const params = useLocalSearchParams() as { courseId?: string; courseName?: string };
  
  // State management for round settings
  const [settings, setSettings] = useState<RoundSettings>({
    isCompetitive: false,
    trackPutts: true,
    trackGIR: true,
    trackFairways: true,
    numberOfPlayers: 1,
  });

  // Memoize settings update handlers
  const handleSettingChange = useCallback((key: keyof RoundSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePlayerCountChange = useCallback((increment: boolean) => {
    setSettings(prev => ({
      ...prev,
      numberOfPlayers: increment
        ? Math.min(4, prev.numberOfPlayers + 1)
        : Math.max(1, prev.numberOfPlayers - 1)
    }));
  }, []);

  /**
   * Handles starting a new round with selected settings
   * Navigates to active round screen with all settings passed as parameters
   */
  const handleStartRound = useCallback(() => {
    if (!params.courseId || !params.courseName) return;
    
    router.push({
      pathname: '/active-round' as any,
      params: {
        courseId: params.courseId,
        courseName: params.courseName,
        settings: JSON.stringify(settings)
      }
    });
  }, [router, params.courseId, params.courseName, settings]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Show loading state when currentUser is not available
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header section with back button and course info */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Round Settings</Text>
          <Text style={styles.courseName}>{params.courseName}</Text>
        </View>
      </View>

      {/* Scrollable content area */}
      <ScrollView style={styles.content}>
        {/* Game Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Type</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Competitive Round</Text>
            <Switch
              value={settings.isCompetitive}
              onValueChange={(value) => handleSettingChange('isCompetitive', value)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={settings.isCompetitive ? colors.success : colors.background}
            />
          </View>
        </View>

        {/* Statistics Tracking Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics to Track</Text>
          {/* Putts tracking toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Putts</Text>
            <Switch
              value={settings.trackPutts}
              onValueChange={(value) => handleSettingChange('trackPutts', value)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={settings.trackPutts ? colors.success : colors.background}
            />
          </View>
          {/* Greens in Regulation tracking toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Greens in Regulation (GIR)</Text>
            <Switch
              value={settings.trackGIR}
              onValueChange={(value) => handleSettingChange('trackGIR', value)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={settings.trackGIR ? colors.success : colors.background}
            />
          </View>
          {/* Fairways hit tracking toggle */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Fairways Hit</Text>
            <Switch
              value={settings.trackFairways}
              onValueChange={(value) => handleSettingChange('trackFairways', value)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={settings.trackFairways ? colors.success : colors.background}
            />
          </View>
        </View>

        {/* Number of Players Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Players</Text>
          <View style={styles.playerCountContainer}>
            {/* Decrease player count button */}
            <TouchableOpacity 
              style={styles.playerCountButton}
              onPress={() => handlePlayerCountChange(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="remove" size={24} color={colors.success} />
            </TouchableOpacity>
            {/* Player count display */}
            <Text style={styles.playerCount}>{settings.numberOfPlayers}</Text>
            {/* Increase player count button */}
            <TouchableOpacity 
              style={styles.playerCountButton}
              onPress={() => handlePlayerCountChange(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="add" size={24} color={colors.success} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Round Button */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartRound}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.startButtonText}>Start Round</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  playerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerCountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  playerCount: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  startButton: {
    margin: 16,
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
}); 