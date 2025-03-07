export type RootStackParamList = {
  '/(tabs)': undefined;
  '/(tabs)/golf-courses': undefined;
  '/(tabs)/profile': undefined;
  '/(tabs)/create': undefined;
  '/(tabs)/explore': undefined;
  '/(tabs)/friends': undefined;
  '/(tabs)/notifications': undefined;
  '/course-details': {
    id: string;
    name: string;
    location: string;
    rating: string;
    price: string;
    description: string;
    distance?: string;
    latitude?: string;
    longitude?: string;
  };
  '/course-stats': undefined;
  '/error-boundary': undefined;
  '/login': undefined;
  '/modal': undefined;
  '/post/[id]': { id: string };
  '/profile/[id]': { id: string };
  '/round-settings': {
    courseId: string;
    courseName: string;
  };
  '/active-round': {
    courseId: string;
    courseName: string;
    settings: string;
  };
};

export type AppRoutes = keyof RootStackParamList; 