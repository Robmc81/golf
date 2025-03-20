import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../hooks/use-app-store';
import { colors } from '../constants/colors';

export default function ProfileScreen() {
  const { currentUser, rounds } = useAppStore();
  
  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Golf Profile</Text>
        <Text style={styles.email}>{currentUser.email}</Text>
      </View>
      
      <FlatList
        data={rounds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.roundCard}>
            <Text style={styles.roundDate}>{new Date(item.date).toLocaleDateString()}</Text>
            <View style={styles.roundStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>{item.score}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Par</Text>
                <Text style={styles.statValue}>{item.par}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Holes</Text>
                <Text style={styles.statValue}>{item.holes}</Text>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rounds played yet</Text>
            <Text style={styles.emptySubtext}>Start playing to track your progress!</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  roundCard: {
    backgroundColor: colors.card,
    margin: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roundDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  roundStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});