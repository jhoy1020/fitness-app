// Jest setup file
import React from 'react';
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: { playAsync: jest.fn(), unloadAsync: jest.fn() } })),
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-safe-area-context with proper context
const mockSafeAreaInsets = { top: 0, right: 0, bottom: 0, left: 0, frame: { x: 0, y: 0, width: 390, height: 844 } };

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const SafeAreaContext = React.createContext(mockSafeAreaInsets);
  
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => (
      React.createElement(SafeAreaContext.Provider, { value: mockSafeAreaInsets }, children)
    ),
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaConsumer: SafeAreaContext.Consumer,
    useSafeAreaInsets: () => mockSafeAreaInsets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    SafeAreaFrameContext: SafeAreaContext,
    SafeAreaInsetsContext: SafeAreaContext,
  };
});

// Silence console warnings during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Animated') || args[0].includes('NativeEventEmitter'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
