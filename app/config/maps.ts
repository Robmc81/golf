export const GOOGLE_MAPS_API_KEY = 'AIzaSyAFRIz-bLmjbPl0iwXfIO7GWghUU2OCaz0'; // Replace with your actual API key

export const CHARLIE_YATES_COORDINATES = {
  latitude: 33.7443421,
  longitude: -84.3164485,
};

export const HOLE_COORDINATES = {
  // Add specific coordinates for each hole
  1: { 
    latitude: 33.7443421,
    longitude: -84.3164485,
    tee: { latitude: 33.7443421, longitude: -84.3164485 },
    green: { latitude: 33.7443421, longitude: -84.3164485 },
    hazards: [
      { latitude: 33.7443421, longitude: -84.3164485, type: 'water' },
      { latitude: 33.7443421, longitude: -84.3164485, type: 'bunker' }
    ]
  },
  // Add more holes as needed
}; 