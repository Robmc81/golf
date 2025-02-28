export interface User {
  id: string;
  name: string;
  email: string;
  handicap: number;
  profileImage?: string;
  stats?: UserStats;
}

export interface UserStats {
  averageScore: number;
  fairwaysHit: number;
  greensInRegulation: number;
  puttsPerRound: number;
  averageDriveDistance: number;
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  slope: number;
  par: number;
  holes: Hole[];
  tees: Tee[];
}

export interface Tee {
  id: string;
  name: string;
  color: string;
  rating: number;
  slope: number;
}

export interface Hole {
  number: number;
  par: number;
  distance: {
    [key: string]: number; // teeId: distance
  };
  handicap: number;
}

export interface Round {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  teeId: string;
  teeName: string;
  players: Player[];
  completed: boolean;
  weather?: string;
  notes?: string;
}

export interface Player {
  id: string;
  name: string;
  scores: HoleScore[];
  totalScore: number;
  totalToPar: number;
}

export interface HoleScore {
  holeNumber: number;
  strokes: number;
  putts?: number;
  fairwayHit?: boolean | null;
  greenInRegulation?: boolean;
  penaltyStrokes?: number;
}