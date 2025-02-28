import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      login: async (email, password) => {
        // In a real app, we would validate credentials with an API
        // For demo purposes, we'll just set the user as authenticated
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({
          isAuthenticated: true,
          user: {
            id: 'user1',
            name: 'Rob Mc',
            email: email
          }
        });
        
        return true;
      },
      
      register: async (name, email, password) => {
        // In a real app, we would register the user with an API
        // For demo purposes, we'll just set the user as authenticated
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({
          isAuthenticated: true,
          user: {
            id: 'user1',
            name: name,
            email: email
          }
        });
        
        return true;
      },
      
      logout: () => {
        // Clear the authentication state
        set({
          isAuthenticated: false,
          user: null
        });
        
        // Clear AsyncStorage for auth data to ensure complete logout
        AsyncStorage.removeItem('auth-storage');
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);