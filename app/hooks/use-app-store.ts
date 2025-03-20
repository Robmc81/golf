import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Round {
  id: string;
  courseId: string;
  date: string;
  score: number;
  par: number;
  holes: number;
}

// Mock data for testing
const MOCK_ROUNDS: Round[] = [
  {
    id: '1',
    courseId: '67ccd3636be9b56d96e56dab',
    date: '2024-03-15',
    score: 82,
    par: 72,
    holes: 18
  },
  {
    id: '2',
    courseId: '67ccd3636be9b56d96e56dab',
    date: '2024-03-01',
    score: 85,
    par: 72,
    holes: 18
  },
  {
    id: '3',
    courseId: '67ccd3636be9b56d96e56dab',
    date: '2024-02-15',
    score: 79,
    par: 72,
    holes: 18
  }
];

export type CourseStats = {
  roundsPlayed: number;
  averageScore: number;
  bestScore: number;
  lastRound: Round | null;
};

export type AppState = {
  favoriteCourses: string[];
  rounds: Round[];
  isLoggedIn: boolean;
  currentUser: { email: string } | null;

  // Course actions
  addFavoriteCourse: (courseId: string) => void;
  removeFavoriteCourse: (courseId: string) => void;
  isFavoriteCourse: (courseId: string) => boolean;
  loadFavoriteCourses: () => Promise<void>;

  // Round actions
  getRoundsForCourse: (courseId: string) => Round[];
  getLastRound: (courseId: string) => Round | null;
  getCourseStats: (courseId: string) => CourseStats;
  loadRounds: () => Promise<void>;
  addRound: (round: Round) => void;

  // Auth actions
  login: (email: string) => { email: string } | null;
  logout: () => void;
};

const createStore = (set: any, get: any): AppState => ({
  favoriteCourses: [],
  rounds: MOCK_ROUNDS,
  isLoggedIn: false,
  currentUser: null,
  
  addFavoriteCourse: (courseId: string) => {
    console.log('Adding favorite course:', courseId);
    set((state: AppState) => {
      const newFavorites = [...state.favoriteCourses, courseId];
      AsyncStorage.setItem('favoriteCourses', JSON.stringify(newFavorites));
      return { favoriteCourses: newFavorites };
    });
  },
  
  removeFavoriteCourse: (courseId: string) => {
    console.log('Removing favorite course:', courseId);
    set((state: AppState) => {
      const newFavorites = state.favoriteCourses.filter(id => id !== courseId);
      AsyncStorage.setItem('favoriteCourses', JSON.stringify(newFavorites));
      return { favoriteCourses: newFavorites };
    });
  },
  
  isFavoriteCourse: (courseId: string) => {
    const isFavorite = get().favoriteCourses.includes(courseId);
    console.log('Checking if course is favorite:', courseId, isFavorite);
    return isFavorite;
  },
  
  loadFavoriteCourses: async () => {
    try {
      console.log('Loading favorite courses...');
      const stored = await AsyncStorage.getItem('favoriteCourses');
      if (stored) {
        const favorites = JSON.parse(stored);
        console.log('Loaded favorite courses:', favorites);
        set({ favoriteCourses: favorites });
      }
    } catch (error) {
      console.error('Error loading favorite courses:', error);
    }
  },

  getRoundsForCourse: (courseId: string) => {
    console.log('Getting rounds for course:', courseId);
    const rounds = get().rounds
      .filter((round: Round) => round.courseId === courseId)
      .sort((a: Round, b: Round) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log('Found rounds:', rounds.length);
    return rounds;
  },

  getLastRound: (courseId: string) => {
    console.log('Getting last round for course:', courseId);
    const rounds = get().getRoundsForCourse(courseId);
    const lastRound = rounds.length > 0 ? rounds[0] : null;
    console.log('Last round:', lastRound);
    return lastRound;
  },

  getCourseStats: (courseId: string) => {
    console.log('Calculating stats for course:', courseId);
    const rounds = get().getRoundsForCourse(courseId);
    
    if (rounds.length === 0) {
      console.log('No rounds found for course');
      return {
        roundsPlayed: 0,
        averageScore: 0,
        bestScore: 0,
        lastRound: null,
      };
    }

    const scores = rounds.map((r: Round) => r.score);
    const averageScore = scores.reduce((a: number, b: number) => a + b, 0) / rounds.length;
    const bestScore = Math.min(...scores);

    const stats = {
      roundsPlayed: rounds.length,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      lastRound: rounds[0],
    };
    console.log('Calculated stats:', stats);
    return stats;
  },

  loadRounds: async () => {
    try {
      console.log('Loading rounds...');
      const stored = await AsyncStorage.getItem('rounds');
      if (stored) {
        const storedRounds = JSON.parse(stored);
        console.log('Loaded stored rounds:', storedRounds.length);
        // Only use mock data if there are no stored rounds
        if (storedRounds.length > 0) {
          set({ rounds: storedRounds });
          return;
        }
      }
      
      // Use mock data if no rounds are stored
      console.log('Using mock data');
      set({ rounds: MOCK_ROUNDS });
      // Save mock data to storage for future use
      await AsyncStorage.setItem('rounds', JSON.stringify(MOCK_ROUNDS));
    } catch (error) {
      console.error('Error loading rounds:', error);
      // Fallback to mock data if there's an error
      console.log('Using mock data due to error');
      set({ rounds: MOCK_ROUNDS });
    }
  },

  addRound: (round: Round) => {
    console.log('Adding new round:', round);
    set((state: AppState) => {
      const newRound = {
        ...round,
        id: Date.now().toString(),
      };
      const newRounds = [...state.rounds, newRound];
      AsyncStorage.setItem('rounds', JSON.stringify(newRounds));
      return { rounds: newRounds };
    });
  },

  // Auth actions
  login: (email) => {
    const user = { email };
    set({ currentUser: user, isLoggedIn: true });
    return user;
  },
  logout: () => {
    set({ currentUser: null, isLoggedIn: false });
  },
});

export const useAppStore = create<AppState>(createStore); 