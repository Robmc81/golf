import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Post, Comment } from '@/types';
import { users, currentUser } from '@/mocks/users';
import { posts, comments } from '@/mocks/posts';

interface AppState {
  users: User[];
  currentUser: User | null;
  posts: Post[];
  comments: Comment[];
  likedPosts: string[];
  retweetedPosts: string[];
  isLoggedIn: boolean;
  
  // Actions
  login: (email: string) => User | null;
  logout: () => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  retweetPost: (postId: string) => void;
  unretweetPost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  createPost: (text: string, images?: string[], course?: string, score?: number, par?: number) => void;
  getUserById: (userId: string) => User | undefined;
  getPostsByUserId: (userId: string) => Post[];
  getCommentsForPost: (postId: string) => Comment[];
  getFriendsPosts: () => Post[];
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  updateProfilePicture: (imageUri: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users,
      currentUser: null,
      posts,
      comments,
      likedPosts: [],
      retweetedPosts: [],
      isLoggedIn: false,

      login: (email: string) => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          set({ currentUser: user, isLoggedIn: true });
          return user;
        }
        return null;
      },

      logout: () => {
        set({ currentUser: null, isLoggedIn: false });
      },

      likePost: (postId: string) => {
        set((state) => {
          const updatedPosts = state.posts.map(post => 
            post.id === postId ? { ...post, likes: post.likes + 1, isLiked: true } : post
          );
          return { 
            posts: updatedPosts,
            likedPosts: [...state.likedPosts, postId]
          };
        });
      },

      unlikePost: (postId: string) => {
        set((state) => {
          const updatedPosts = state.posts.map(post => 
            post.id === postId ? { ...post, likes: post.likes - 1, isLiked: false } : post
          );
          return { 
            posts: updatedPosts,
            likedPosts: state.likedPosts.filter(id => id !== postId)
          };
        });
      },

      retweetPost: (postId: string) => {
        set((state) => {
          const updatedPosts = state.posts.map(post => 
            post.id === postId ? { ...post, retweets: post.retweets + 1, isRetweeted: true } : post
          );
          return { 
            posts: updatedPosts,
            retweetedPosts: [...state.retweetedPosts, postId]
          };
        });
      },

      unretweetPost: (postId: string) => {
        set((state) => {
          const updatedPosts = state.posts.map(post => 
            post.id === postId ? { ...post, retweets: post.retweets - 1, isRetweeted: false } : post
          );
          return { 
            posts: updatedPosts,
            retweetedPosts: state.retweetedPosts.filter(id => id !== postId)
          };
        });
      },

      addComment: (postId: string, text: string) => {
        set((state) => {
          const newComment: Comment = {
            id: `comment-${Date.now()}`,
            postId,
            userId: state.currentUser?.id || '',
            text,
            date: new Date().toISOString(),
            likes: 0
          };
          
          const updatedPosts = state.posts.map(post => 
            post.id === postId ? { ...post, comments: post.comments + 1 } : post
          );
          
          return { 
            comments: [...state.comments, newComment],
            posts: updatedPosts
          };
        });
      },

      createPost: (text: string, images?: string[], course?: string, score?: number, par?: number) => {
        set((state) => {
          const newPost: Post = {
            id: `post-${Date.now()}`,
            userId: state.currentUser?.id || '',
            text,
            images,
            course,
            score,
            par,
            date: new Date().toISOString(),
            likes: 0,
            comments: 0,
            retweets: 0
          };
          
          return { 
            posts: [newPost, ...state.posts]
          };
        });
      },

      getUserById: (userId: string) => {
        return get().users.find(user => user.id === userId);
      },

      getPostsByUserId: (userId: string) => {
        return get().posts.filter(post => post.userId === userId);
      },

      getCommentsForPost: (postId: string) => {
        return get().comments.filter(comment => comment.postId === postId);
      },

      getFriendsPosts: () => {
        const { currentUser, posts } = get();
        const friendIds = currentUser?.friends || [];
        
        // Include current user's posts and friends' posts
        return posts.filter(post => 
          post.userId === currentUser?.id || friendIds.includes(post.userId)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      followUser: (userId: string) => {
        set((state) => {
          // Add user to current user's friends list
          const updatedFriends = [...(state.currentUser?.friends || [])];
          if (!updatedFriends.includes(userId)) {
            updatedFriends.push(userId);
          }
          
          // Update the user's followers count
          const updatedUsers = state.users.map(user => 
            user.id === userId 
              ? { ...user, followers: user.followers + 1 }
              : user
          );
          
          // Update current user
          const updatedCurrentUser = {
            ...state.currentUser,
            friends: updatedFriends,
            following: state.currentUser?.following + 1
          };
          
          return {
            users: updatedUsers,
            currentUser: updatedCurrentUser
          };
        });
      },

      unfollowUser: (userId: string) => {
        set((state) => {
          // Remove user from current user's friends list
          const updatedFriends = (state.currentUser?.friends || []).filter(id => id !== userId);
          
          // Update the user's followers count
          const updatedUsers = state.users.map(user => 
            user.id === userId 
              ? { ...user, followers: Math.max(0, user.followers - 1) }
              : user
          );
          
          // Update current user
          const updatedCurrentUser = {
            ...state.currentUser,
            friends: updatedFriends,
            following: Math.max(0, state.currentUser?.following - 1)
          };
          
          return {
            users: updatedUsers,
            currentUser: updatedCurrentUser
          };
        });
      },

      updateProfilePicture: (imageUri: string) => {
        set((state) => {
          // Update current user's avatar
          const updatedCurrentUser = {
            ...state.currentUser,
            avatar: imageUri
          };
          
          // Also update the user in the users array
          const updatedUsers = state.users.map(user => 
            user.id === state.currentUser?.id 
              ? { ...user, avatar: imageUri }
              : user
          );
          
          return {
            currentUser: updatedCurrentUser,
            users: updatedUsers
          };
        });
      }
    }),
    {
      name: 'fairway-feed-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        likedPosts: state.likedPosts,
        retweetedPosts: state.retweetedPosts,
        currentUser: state.currentUser,
      }),
    }
  )
);