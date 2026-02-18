module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-paper|react-native-vector-icons|react-native-safe-area-context|@react-native-async-storage/async-storage|uuid)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/components/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    'src/data/**/*.{ts,tsx}',
    'src/context/ThemeContext.tsx',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    // Exclude complex components
    '!src/components/MonthCalendar/**',
    '!src/components/WeightGraph/**',
    '!src/components/SetInput/**',
    // Exclude storage utilities that require native modules
    '!src/utils/storage.ts',
    '!src/utils/storage.native.ts',
    // Exclude exercise video data that's static content
    '!src/data/exerciseVideos.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/__tests__/**/*.(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
};
