export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  following: number;
  followers: number;
  handicap?: number;
  favoriteCourse?: string;
  location?: string;
  joinedDate: string;
  friends?: string[]; // IDs of friends
}

export interface Post {
  id: string;
  userId: string;
  text: string;
  images?: string[];
  course?: string;
  score?: number;
  par?: number;
  date: string;
  likes: number;
  comments: number;
  retweets: number;
  isLiked?: boolean;
  isRetweeted?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  date: string;
  likes: number;
}