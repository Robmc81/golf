interface HoleCoordinates {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  tilt: number;
  latitudeDelta: number;
  longitudeDelta: number;
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

export const HOLE_COORDINATES: Record<number, HoleCoordinates> = {
  1: {
    latitude: 33.743912,
    longitude: -84.317426,
    altitude: 0.0050, // This will give us zoom level 26.31
    heading: 241.7,
    tilt: 22.59,
    latitudeDelta: 0.001, // Changed from 0.002 to 0.001 (zoomed in halfway)
    longitudeDelta: 0.001, // Changed from 0.002 to 0.001 (zoomed in halfway)
    tee: {
      latitude: 33.743847,
      longitude: -84.317421,
    },
    green: {
      latitude: 33.7436305,
      longitude: -84.3179454,
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
  },
  2: {
    latitude: 33.743884,
    longitude: -84.319180,
    altitude: 0.0001,
    heading: 325.43,
    tilt: 22.59,
    latitudeDelta: 0.00125, // Changed from 0.0025 to 0.00125 (zoomed in halfway)
    longitudeDelta: 0.00125, // Changed from 0.0025 to 0.00125 (zoomed in halfway)
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
  3: {
    latitude: 33.743762,
    longitude: -84.320343,
    altitude: 0.05,
    heading: 179.50,
    tilt: 22.59,
    latitudeDelta: 0.003261,
    longitudeDelta: 0.002012,
    tee: {
      latitude: 33.743667,
      longitude: -84.320338,
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
  4: {
    latitude: 33.741808,
    longitude: -84.31933,
    altitude: 0.0001,
    heading: 130.65,
    tilt: 22.59,
    latitudeDelta: 0.00201, // Corresponds to altitude 0.0001
    longitudeDelta: 0.00240,
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
  },
  5: {
    latitude: 33.7410,
    longitude: -84.3214,
    altitude: 0.0001,
    heading: 246.3,
    tilt: 22.59,
    latitudeDelta: 0.001525, // Halved from 0.00305 for closer zoom
    longitudeDelta: 0.00215, // Halved from 0.0043 for closer zoom
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
  },
  6: {
    latitude: 33.7404,
    longitude: -84.32022,
    altitude: 0.0001,
    heading: 65.43,
    tilt: 22.59,
    latitudeDelta: 0.00187, // Halved from 0.00374 for closer zoom
    longitudeDelta: 0.00253, // Halved from 0.00506 for closer zoom
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
  },
  7: {
    latitude: 33.7405,
    longitude: -84.31809,
    altitude: 0.0001,
    heading: 86.52,
    tilt: 22.59,
    latitudeDelta: 0.00079, // Halved from 0.00158 for closer zoom
    longitudeDelta: 0.00145, // Halved from 0.00290 for closer zoom
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
  },
  8: {
    latitude: 33.7414,
    longitude: -84.317814,
    altitude: 0.0001,
    heading: 273.48,
    tilt: 22.59,
    latitudeDelta: 0.000680, // Halved from 0.001359 for closer zoom
    longitudeDelta: 0.001313, // Halved from 0.002625 for closer zoom
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
  },
  9: {
    latitude: 33.74165,
    longitude: -84.31806,
    altitude: 0.0001,
    heading: 108.9,
    tilt: 22.59,
    latitudeDelta: 0.001411, // Halved from 0.002821 for closer zoom
    longitudeDelta: 0.002597, // Halved from 0.005194 for closer zoom
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
  },
}; 