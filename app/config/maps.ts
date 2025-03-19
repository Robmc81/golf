export const GOOGLE_MAPS_API_KEY = 'AIzaSyAFRIz-bLmjbPl0iwXfIO7GWghUU2OCaz0'; // Replace with your actual API key

export const CHARLIE_YATES_COORDINATES = {
  latitude: 33.743912,
  longitude: -84.317426,
  zoom: 26.31, // This will give us zoom level 26.31
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

export const HOLE_COORDINATES: { [key: number]: typeof CHARLIE_YATES_COORDINATES } = {
  1: CHARLIE_YATES_COORDINATES,
  // Add more holes as needed
}; 