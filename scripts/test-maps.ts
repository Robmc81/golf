import { CHARLIE_YATES_COORDINATES, HOLE_COORDINATES } from '../app/config/maps';

interface Hazard {
  latitude: number;
  longitude: number;
  type: string;
}

interface HoleCoordinates {
  latitude: number;
  longitude: number;
  tee: {
    latitude: number;
    longitude: number;
  };
  green: {
    latitude: number;
    longitude: number;
  };
  hazards: Hazard[];
}

// Test coordinates
const testCoordinates = {
  // Test 1: Main course coordinates
  testMainCoordinates: () => {
    console.log('Test 1: Main Course Coordinates');
    console.log('Expected coordinates:', CHARLIE_YATES_COORDINATES);
    console.log('Actual coordinates:', {
      latitude: 33.7443421,
      longitude: -84.3164485
    });
    console.log('Test passed:', 
      CHARLIE_YATES_COORDINATES.latitude === 33.7443421 && 
      CHARLIE_YATES_COORDINATES.longitude === -84.3164485
    );
  },

  // Test 2: Hole coordinates structure
  testHoleCoordinates: () => {
    console.log('\nTest 2: Hole Coordinates Structure');
    const hole1 = HOLE_COORDINATES[1] as HoleCoordinates;
    console.log('Available holes:', Object.keys(HOLE_COORDINATES));
    console.log('Hole 1 structure:', {
      hasTee: !!hole1.tee,
      hasGreen: !!hole1.green,
      hasHazards: !!hole1.hazards,
      hazardsCount: hole1.hazards?.length
    });
    console.log('Test passed:', 
      !!hole1.tee && 
      !!hole1.green && 
      Array.isArray(hole1.hazards)
    );
  },

  // Test 3: Coordinate format
  testCoordinateFormat: () => {
    console.log('\nTest 3: Coordinate Format');
    const isValidFormat = (coords: any) => {
      return (
        typeof coords.latitude === 'number' &&
        typeof coords.longitude === 'number' &&
        coords.latitude >= -90 &&
        coords.latitude <= 90 &&
        coords.longitude >= -180 &&
        coords.longitude <= 180
      );
    };

    const hole1 = HOLE_COORDINATES[1] as HoleCoordinates;
    console.log('Main coordinates format valid:', isValidFormat(CHARLIE_YATES_COORDINATES));
    console.log('Hole 1 coordinates format valid:', isValidFormat(hole1));
    console.log('Tee coordinates format valid:', isValidFormat(hole1.tee));
    console.log('Green coordinates format valid:', isValidFormat(hole1.green));
    console.log('Hazards coordinates format valid:', 
      hole1.hazards.every(hazard => isValidFormat(hazard))
    );
  },

  // Test 4: Distance calculations
  testDistanceCalculation: () => {
    console.log('\nTest 4: Distance Calculations');
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const hole1 = HOLE_COORDINATES[1] as HoleCoordinates;
    
    // Calculate distances
    const teeToGreen = calculateDistance(
      hole1.tee.latitude,
      hole1.tee.longitude,
      hole1.green.latitude,
      hole1.green.longitude
    );

    const mainToTee = calculateDistance(
      CHARLIE_YATES_COORDINATES.latitude,
      CHARLIE_YATES_COORDINATES.longitude,
      hole1.tee.latitude,
      hole1.tee.longitude
    );

    console.log('Distance from tee to green:', teeToGreen.toFixed(2), 'km');
    console.log('Distance from main to tee:', mainToTee.toFixed(2), 'km');
    console.log('Test passed:', teeToGreen > 0 && mainToTee > 0);
  },

  // Test 5: Hazard validation
  testHazards: () => {
    console.log('\nTest 5: Hazard Validation');
    const hole1 = HOLE_COORDINATES[1] as HoleCoordinates;
    const validHazardTypes = ['water', 'bunker', 'trees', 'rough'];
    
    const hazardsValid = hole1.hazards.every(hazard => 
      validHazardTypes.includes(hazard.type) &&
      typeof hazard.latitude === 'number' &&
      typeof hazard.longitude === 'number'
    );

    console.log('Hazard types:', hole1.hazards.map(h => h.type));
    console.log('Test passed:', hazardsValid);
  }
};

// Run all tests
console.log('Starting Google Maps Integration Tests...\n');
testCoordinates.testMainCoordinates();
testCoordinates.testHoleCoordinates();
testCoordinates.testCoordinateFormat();
testCoordinates.testDistanceCalculation();
testCoordinates.testHazards();
console.log('\nAll tests completed.'); 