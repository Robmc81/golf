export type RootStackParamList = {
  '/(tabs)': undefined;
  '/(tabs)/profile': undefined;
  '/(tabs)/create': undefined;
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
}; 