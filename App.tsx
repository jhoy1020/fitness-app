// Main App Component
// Sets up providers, navigation, and theme

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { lightTheme, darkTheme } from './src/theme';
import { WorkoutProvider, UserProvider, TimerProvider, MesoCycleProvider, ThemeProvider, useThemeMode } from './src/context';
import { initDatabase, seedExercises, EXERCISE_LIBRARY } from './src/services/db';
import {
  HomeScreen,
  ActiveWorkoutScreen,
  ProfileScreen,
  HistoryScreen,
  ProgressScreen,
  WorkoutSummaryScreen,
  ProgramsScreen,
  VolumeTrackerScreen,
  MesoCycleScreen,
  CreateProgramScreen,
} from './src/screens';

// Navigation types
type RootStackParamList = {
  Main: undefined;
  ActiveWorkout: undefined;
  WorkoutDetail: { workoutId: string };
  WorkoutSummary: { workout: any };
  Templates: undefined;
  CreateTemplate: undefined;
  TemplateDetail: { templateId: string };
  Programs: undefined;
  CreateProgram: undefined;
  VolumeTracker: undefined;
  MesoCycle: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Programs: undefined;
  History: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Programs"
        component={ProgramsScreen}
        options={{
          title: 'Programs',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📝</Text>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{
          title: 'Workout',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{
          title: 'Workout Complete',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="Programs"
        component={ProgramsScreen}
        options={{
          title: 'Training Programs',
        }}
      />
      <Stack.Screen
        name="CreateProgram"
        component={CreateProgramScreen}
        options={{
          title: 'Create Program',
        }}
      />
      <Stack.Screen
        name="VolumeTracker"
        component={VolumeTrackerScreen}
        options={{
          title: 'Volume Tracker',
        }}
      />
      <Stack.Screen
        name="MesoCycle"
        component={MesoCycleScreen}
        options={{
          title: 'Training Program',
        }}
      />
    </Stack.Navigator>
  );
}

// App Component with Theme Toggle Support
function AppContent() {
  const { isDark } = useThemeMode();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initDatabase();

      // Seed exercise library
      await seedExercises(EXERCISE_LIBRARY);

      setIsLoading(false);
    } catch (e) {
      console.error('Failed to initialize app:', e);
      setError('Failed to initialize app. Please restart.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Loading Fitness Tracker...</Text>
        </View>
      </PaperProvider>
    );
  }

  if (error) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={{ color: 'red' }}>{error}</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <UserProvider>
        <WorkoutProvider>
          <TimerProvider>
            <MesoCycleProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </MesoCycleProvider>
          </TimerProvider>
        </WorkoutProvider>
      </UserProvider>
    </PaperProvider>
  );
}

// Main App with ThemeProvider wrapper
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
