import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Round, GolfCourse } from '@/types';
import { currentUser } from '@/mocks/user';
import { courses } from '@/mocks/courses';
import { rounds } from '@/mocks/rounds';

interface AppState {
  user: User;
  courses: GolfCourse[];
  rounds: Round[];
  activeRound: Round | null;
  isLoading: boolean;
  
  // User actions
  updateUser: (user: Partial<User>) => void;
  
  // Course actions
  getCourse: (id: string) => GolfCourse | undefined;
  
  // Round actions
  createRound: (round: Omit<Round, 'id'>) => Round;
  updateRound: (round: Round) => void;
  deleteRound: (id: string) => void;
  setActiveRound: (round: Round | null) => void;
  updateScore: (playerId: string, holeNumber: number, strokes: number, putts?: number, fairwayHit?: boolean | null, greenInRegulation?: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: currentUser,
      courses: courses,
      rounds: rounds,
      activeRound: null,
      isLoading: false,
      
      updateUser: (userData) => {
        set((state) => ({
          user: {
            ...state.user,
            ...userData
          }
        }));
      },
      
      getCourse: (id) => {
        return get().courses.find(course => course.id === id);
      },
      
      createRound: (roundData) => {
        const newRound = {
          ...roundData,
          id: Date.now().toString(),
        };
        
        set((state) => ({
          rounds: [...state.rounds, newRound],
          activeRound: newRound
        }));
        
        return newRound;
      },
      
      updateRound: (updatedRound) => {
        set((state) => ({
          rounds: state.rounds.map(round => 
            round.id === updatedRound.id ? updatedRound : round
          ),
          activeRound: state.activeRound?.id === updatedRound.id 
            ? updatedRound 
            : state.activeRound
        }));
      },
      
      deleteRound: (id) => {
        set((state) => ({
          rounds: state.rounds.filter(round => round.id !== id),
          activeRound: state.activeRound?.id === id ? null : state.activeRound
        }));
      },
      
      setActiveRound: (round) => {
        set({ activeRound: round });
      },
      
      updateScore: (playerId, holeNumber, strokes, putts, fairwayHit, greenInRegulation) => {
        const { rounds, activeRound } = get();
        
        if (!activeRound) return;
        
        const updatedRound = { ...activeRound };
        const playerIndex = updatedRound.players.findIndex(p => p.id === playerId);
        
        if (playerIndex === -1) return;
        
        const player = { ...updatedRound.players[playerIndex] };
        const scoreIndex = player.scores.findIndex(s => s.holeNumber === holeNumber);
        
        if (scoreIndex === -1) {
          // Add new score
          player.scores.push({
            holeNumber,
            strokes,
            putts,
            fairwayHit,
            greenInRegulation
          });
        } else {
          // Update existing score
          player.scores[scoreIndex] = {
            ...player.scores[scoreIndex],
            strokes,
            putts: putts !== undefined ? putts : player.scores[scoreIndex].putts,
            fairwayHit: fairwayHit !== undefined ? fairwayHit : player.scores[scoreIndex].fairwayHit,
            greenInRegulation: greenInRegulation !== undefined ? greenInRegulation : player.scores[scoreIndex].greenInRegulation
          };
        }
        
        // Recalculate total score
        player.totalScore = player.scores.reduce((total, score) => total + score.strokes, 0);
        
        // Calculate total to par
        const course = get().getCourse(activeRound.courseId);
        if (course) {
          const totalPar = course.holes.reduce((total, hole) => total + hole.par, 0);
          player.totalToPar = player.totalScore - totalPar;
        }
        
        updatedRound.players[playerIndex] = player;
        
        get().updateRound(updatedRound);
      }
    }),
    {
      name: 'golf-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        rounds: state.rounds,
        activeRound: state.activeRound
      }),
    }
  )
);