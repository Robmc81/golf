interface HoleCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  heading: number;
  tilt: number;
  tee: {
    latitude: number;
    longitude: number;
  };
  green: {
    latitude: number;
    longitude: number;
  };
  hazards: {
    type: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    description: string;
  }[];
}

export const GOOGLE_MAPS_API_KEY = 'AIzaSyAFRIz-bLmjbPl0iwXfIO7GWghUU2OCaz0'; // Replace with your actual API key

export const CHARLIE_YATES_COORDINATES = {
  latitude: 33.743912,
  longitude: -84.317426,
  altitude: 0.0001, // This will give us zoom level 26.31
  heading: 243.03,
  tilt: 22.59,
  tee: {
    latitude: 33.743847,
    longitude: -84.317421,
  },
  green: {
    latitude: 33.743847,
    longitude: -84.317421,
  },
  hazards: [
    {
      type: 'water',
      coordinates: {
        latitude: 33.743847,
        longitude: -84.317421,
      },
      description: 'Water hazard',
    },
  ],
};

export const HOLE_COORDINATES: Record<number, HoleCoordinates> = {
  1: CHARLIE_YATES_COORDINATES,
  2: {
    latitude: 33.744054,
    longitude: -84.319206,
    altitude: 0.0001,
    heading: 243.03,
    tilt: 22.59,
    tee: {
      latitude: 33.744054,
      longitude: -84.319206,
    },
    green: {
      latitude: 33.744054,
      longitude: -84.319206,
    },
    hazards: [
      {
        type: 'water',
        coordinates: {
          latitude: 33.744054,
          longitude: -84.319206,
        },
        description: 'Water hazard',
      },
    ],
  },
  3: CHARLIE_YATES_COORDINATES,
  4: CHARLIE_YATES_COORDINATES,
  5: CHARLIE_YATES_COORDINATES,
  6: CHARLIE_YATES_COORDINATES,
  7: CHARLIE_YATES_COORDINATES,
  8: CHARLIE_YATES_COORDINATES,
  9: CHARLIE_YATES_COORDINATES,
}; 