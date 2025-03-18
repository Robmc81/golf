import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import Scorecard from './scorecard';

// Mock data for testing
const mockHoles = Array.from({ length: 18 }, (_, i) => ({
  number: i + 1,
  par: i % 2 === 0 ? 4 : i % 3 === 0 ? 5 : 3,
  handicap: i + 1,
}));

const mockPlayers = [
  {
    id: '1',
    name: 'R. McFadden',
    handicap: 27,
    scores: Array(18).fill(null),
    netScores: Array(18).fill(null),
  },
];

export default function ActiveRound() {
  const params = useLocalSearchParams();
  const settings = params.settings ? JSON.parse(params.settings as string) : {};

  return (
    <Scorecard
      courseName="Charlie Yates Golf Course"
      teeName="Black"
      teeColor="black"
      rating={60.6}
      slope={108}
      holes={mockHoles}
      players={mockPlayers}
    />
  );
} 