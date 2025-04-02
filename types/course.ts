import { Hole } from './round';

export interface Course {
  id: string;
  name: string;
  location: string;
  description: string;
  total_holes: number;
  created_at: string;
  updated_at: string;
}

export interface TeeBox {
  id: string;
  course_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CourseDetails {
  course: Course;
  teeBoxes: TeeBox[];
  holes: Hole[];
}

export interface CourseStats {
  total_rounds: number;
  average_score: number;
  best_score: number;
  last_played: string;
} 