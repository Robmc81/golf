import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Round } from '@/types';
import Colors from '@/constants/colors';
import { Calendar, Flag } from 'lucide-react-native';

interface RoundCardProps {
  round: Round;
}

export const RoundCard: React.FC<RoundCardProps> = ({ round }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/round/${round.id}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get player score
  const mainPlayer = round.players[0];
  const score = mainPlayer ? mainPlayer.totalScore : 0;
  const toPar = mainPlayer ? mainPlayer.totalToPar : 0;
  const toParText = toPar > 0 ? `+${toPar}` : toPar.toString();

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <Text style={styles.courseName}>{round.courseName}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{score}</Text>
          <Text style={[
            styles.toPar,
            toPar < 0 ? styles.under : toPar > 0 ? styles.over : styles.even
          ]}>
            {toParText}
          </Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Calendar size={14} color={Colors.subtext} />
          <Text style={styles.detailText}>{formatDate(round.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Flag size={14} color={Colors.subtext} />
          <Text style={styles.detailText}>{round.teeName} Tees</Text>
        </View>
        {round.completed ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <View style={styles.inProgressBadge}>
            <Text style={styles.inProgressText}>In Progress</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 4,
  },
  toPar: {
    fontSize: 14,
    fontWeight: '600',
  },
  under: {
    color: Colors.secondary,
  },
  over: {
    color: Colors.error,
  },
  even: {
    color: Colors.text,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.subtext,
    marginLeft: 4,
  },
  completedBadge: {
    backgroundColor: Colors.secondary + '20', // 20% opacity
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  inProgressBadge: {
    backgroundColor: Colors.primary + '20', // 20% opacity
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inProgressText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
});