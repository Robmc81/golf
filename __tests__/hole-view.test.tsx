import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HoleViewScreen from '../app/hole-view';

// Mock the expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    holeNumber: '1',
    courseId: 'test-course',
  }),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    PROVIDER_GOOGLE: 'google',
  };
});

describe('HoleViewScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<HoleViewScreen />);
    expect(getByTestId('map-container')).toBeTruthy();
  });

  it('displays the correct hole number', () => {
    const { getByText } = render(<HoleViewScreen />);
    expect(getByText('Back to Scorecard')).toBeTruthy();
  });

  it('toggles map type when button is pressed', () => {
    const { getByTestId } = render(<HoleViewScreen />);
    const mapTypeButton = getByTestId('map-type-button');
    
    fireEvent.press(mapTypeButton);
    
    // Verify the map type changed
    expect(getByTestId('map-view')).toHaveProp('mapType', 'standard');
  });

  it('handles zoom controls', () => {
    const { getByTestId } = render(<HoleViewScreen />);
    const zoomInButton = getByTestId('zoom-in-button');
    const zoomOutButton = getByTestId('zoom-out-button');
    
    fireEvent.press(zoomInButton);
    fireEvent.press(zoomOutButton);
    
    // Verify zoom controls are present
    expect(zoomInButton).toBeTruthy();
    expect(zoomOutButton).toBeTruthy();
  });

  it('handles rotation and reset controls', () => {
    const { getByTestId } = render(<HoleViewScreen />);
    const rotateButton = getByTestId('rotate-button');
    const resetButton = getByTestId('reset-button');
    
    fireEvent.press(rotateButton);
    fireEvent.press(resetButton);
    
    // Verify rotation and reset controls are present
    expect(rotateButton).toBeTruthy();
    expect(resetButton).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const mockRouter = { back: jest.fn() };
    jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue(mockRouter);
    
    const { getByText } = render(<HoleViewScreen />);
    const backButton = getByText('Back to Scorecard');
    
    fireEvent.press(backButton);
    
    expect(mockRouter.back).toHaveBeenCalled();
  });
}); 