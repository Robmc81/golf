import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/hooks/use-app-store';
import Colors from '@/constants/colors';
import { Button } from '@/components/Button';
import { ClipboardCheck, Plus } from 'lucide-react-native';

export default function ScorecardScreen() {
  const router = useRouter();
  const { activeRound, rounds } = useAppStore();
  
  // Navigate to new round screen
  const handleNewRound = () => {
    router.push('/new-round');
  };
  
  // Navigate to active round
  const handleContinueRound = () => {
    if (activeRound) {
      router.push(`/round/${activeRound.id}`);
    }
  };
  
  // Navigate to rounds history
  const handleViewHistory = () => {
    router.push('/rounds');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <ClipboardCheck size={32} color="#fff" />
        <Text style={styles.headerTitle}>Scorecard</Text>
        <Text style={styles.headerSubtitle}>
          Track your scores and stats for each round
        </Text>
      </View>
      
      {/* Active Round Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Round</Text>
        
        {activeRound ? (
          <View style={styles.activeRoundCard}>
            <View style={styles.activeRoundHeader}>
              <Text style={styles.activeRoundTitle}>{activeRound.courseName}</Text>
              <View style={styles.activeRoundBadge}>
                <Text style={styles.activeRoundBadgeText}>In Progress</Text>
              </View>
            </View>
            
            <Text style={styles.activeRoundDate}>
              Started on {new Date(activeRound.date).toLocaleDateString()}
            </Text>
            
            <View style={styles.activeRoundPlayers}>
              <Text style={styles.playersLabel}>Players:</Text>
              {activeRound.players.map((player, index) => (
                <Text key={player.id} style={styles.playerName}>
                  {player.name}{index < activeRound.players.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
            
            <Button
              title="Continue Round"
              onPress={handleContinueRound}
              variant="primary"
              fullWidth
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <View style={styles.emptyActiveRound}>
            <Text style={styles.emptyStateText}>No active round</Text>
            <Text style={styles.emptyStateSubtext}>
              Start a new round to track your scores
            </Text>
            <Button
              title="Start New Round"
              onPress={handleNewRound}
              variant="primary"
              icon={<Plus size={18} color="#fff" />}
              style={{ marginTop: 16 }}
            />
          </View>
        )}
      </View>
      
      {/* Recent Rounds Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Rounds Summary</Text>
        
        {rounds.length > 0 ? (
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{rounds.length}</Text>
                <Text style={styles.statLabel}>Total Rounds</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {rounds.filter(r => r.completed).length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {rounds.length - rounds.filter(r => r.completed).length}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
            </View>
            
            <Button
              title="View Round History"
              onPress={handleViewHistory}
              variant="outline"
              fullWidth
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No rounds recorded yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your round history will appear here
            </Text>
          </View>
        )}
      </View>
      
      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Button
          title="Start New Round"
          onPress={handleNewRound}
          variant="primary"
          fullWidth
          icon={<Plus size={18} color="#fff" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.darkBackground,
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  activeRoundCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  activeRoundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeRoundTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  activeRoundBadge: {
    backgroundColor: Colors.primary + '20', // 20% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeRoundBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  activeRoundDate: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 12,
  },
  activeRoundPlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playersLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginRight: 4,
  },
  playerName: {
    fontSize: 14,
    color: Colors.text,
  },
  emptyActiveRound: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.subtext,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
});