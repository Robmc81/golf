import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from './utils/supabaseClient';
import { Ionicons } from '@expo/vector-icons';

interface RoundSummary {
  id: string;
  user_id: string;
  date_played: string;
  course: string;
  tee_box: string;
  weather_conditions: string | null;
  playing_partners: string[] | null;
  total_score: number | null;
  total_putts: number | null;
  total_fairways: number | null;
  total_gir: number | null;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  hole_1_score: number | null;
  hole_2_score: number | null;
  hole_3_score: number | null;
  hole_4_score: number | null;
  hole_5_score: number | null;
  hole_6_score: number | null;
  hole_7_score: number | null;
  hole_8_score: number | null;
  hole_9_score: number | null;
}

export default function RoundSummary() {
  const router = useRouter();
  const { roundId } = useLocalSearchParams();
  const [roundData, setRoundData] = useState<RoundSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoundData();
  }, [roundId]);

  const fetchRoundData = async () => {
    try {
      const { data, error } = await supabase
        .from('charlie_yates_scorecards')
        .select('*')
        .eq('id', roundId)
        .single();

      if (error) throw error;
      setRoundData(data);
    } catch (error) {
      console.error('Error fetching round data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (data: RoundSummary): number => {
    let total = 0;
    for (let i = 1; i <= 9; i++) {
      const score = data[`hole_${i}_score` as keyof RoundSummary];
      if (typeof score === 'number') total += score;
    }
    return total;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading round summary...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Round Summary</Text>
      </View>

      <ScrollView style={styles.content}>
        {roundData && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Round Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Course:</Text>
                <Text style={styles.value}>{roundData.course}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>
                  {new Date(roundData.date_played).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Tee Box:</Text>
                <Text style={styles.value}>{roundData.tee_box}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scores</Text>
              <View style={styles.scoreGrid}>
                {Array.from({ length: 9 }, (_, i) => i + 1).map((hole) => (
                  <View key={hole} style={styles.scoreCell}>
                    <Text style={styles.holeNumber}>Hole {hole}</Text>
                    <Text style={styles.score}>
                      {roundData[`hole_${hole}_score` as keyof RoundSummary] || '-'}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.totalScore}>
                <Text style={styles.totalLabel}>Total Score:</Text>
                <Text style={styles.totalValue}>{calculateTotalScore(roundData)}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.finishButton}
              onPress={() => {
                // Navigate back to home or another appropriate screen
                router.replace('/');
              }}
            >
              <Text style={styles.finishButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scoreCell: {
    width: '30%',
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  holeNumber: {
    fontSize: 14,
    color: '#666',
  },
  score: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  totalScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  finishButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 