export interface RoundSummary {
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
  active: boolean;
}

export interface RoundSettings {
  courseName: string;
  teeName: string;
  roundId?: string;
  loadActive?: string;
}

export interface Player {
  id: string;
  username: string;
  scores: (number | null)[];
  roundId: string;
}

export interface Hole {
  number: number;
  par: number;
  handicap: number;
  distance: {
    front: number;
    middle: number;
    back: number;
  };
  coordinates: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
    heading: number;
    tilt: number;
  };
} 