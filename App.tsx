// Main App Component
// Sets up providers, navigation, and theme

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme, useWindowDimensions, TouchableOpacity, Modal, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, ActivityIndicator, Text, Surface } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

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

// Breakpoint for narrow screens (hamburger menu threshold)
// Set to 400px to trigger on small phones like iPhone SE
const NARROW_SCREEN_WIDTH = 400;

// Tab configuration
const TAB_CONFIG = [
  { name: 'Home' as const, title: 'Dashboard', icon: '🏠', component: HomeScreen },
  { name: 'Programs' as const, title: 'Programs', icon: '📝', component: ProgramsScreen },
  { name: 'History' as const, title: 'History', icon: '📋', component: HistoryScreen },
  { name: 'Progress' as const, title: 'Progress', icon: '📈', component: ProgressScreen },
  { name: 'Profile' as const, title: 'Profile', icon: '👤', component: ProfileScreen },
];

// Hamburger Menu Component for narrow screens
function HamburgerMenu({ navigation, currentRoute }: { navigation: any; currentRoute: string }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();
  
  return (
    <>
      {/* Menu Button in bottom bar */}
      <View style={[
        styles.hamburgerBar, 
        { paddingBottom: Math.max(insets.bottom, 8) }
      ]}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
          <Text style={styles.hamburgerLabel}>Menu</Text>
        </TouchableOpacity>
        <Text style={styles.currentScreen}>
          {TAB_CONFIG.find(t => t.name === currentRoute)?.icon} {TAB_CONFIG.find(t => t.name === currentRoute)?.title}
        </Text>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.menuOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.menuHandle} />
            <Text style={styles.menuTitle}>Navigation</Text>
            {TAB_CONFIG.map((tab) => (
              <TouchableOpacity
                key={tab.name}
                style={[
                  styles.menuItem,
                  currentRoute === tab.name && styles.menuItemActive
                ]}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate(tab.name);
                }}
              >
                <Text style={styles.menuItemIcon}>{tab.icon}</Text>
                <Text style={[
                  styles.menuItemText,
                  currentRoute === tab.name && styles.menuItemTextActive
                ]}>
                  {tab.title}
                </Text>
                {currentRoute === tab.name && (
                  <Text style={styles.menuItemCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// Main Tab Navigator with responsive layout
function MainTabs() {
  const { width } = useWindowDimensions();
  const isNarrowScreen = width < NARROW_SCREEN_WIDTH;
  const insets = useSafeAreaInsets();

  // For narrow screens, we'll use a custom tab bar with hamburger menu
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarStyle: isNarrowScreen ? { display: 'none' } : {
          paddingBottom: Math.max(insets.bottom, 4),
          paddingTop: 4,
          height: 56 + Math.max(insets.bottom, 4),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          minHeight: 48,
        },
      }}
      tabBar={(props) => isNarrowScreen ? (
        <HamburgerMenu 
          navigation={props.navigation} 
          currentRoute={props.state.routes[props.state.index].name}
        />
      ) : (
        <BottomTabBar {...props} />
      )}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>{tab.icon}</Text>
            ),
          }}
        />
      ))}
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
  // Hamburger menu styles for narrow screens
  hamburgerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B2838',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 130, 153, 0.3)',
    zIndex: 1000,
    elevation: 10,
  },
  hamburgerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minHeight: 44,
    minWidth: 80,
  },
  hamburgerIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: 8,
  },
  hamburgerLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  currentScreen: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#1B2838',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  menuHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 56,
  },
  menuItemActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  menuItemTextActive: {
    color: '#00D4FF',
    fontWeight: '600',
  },
  menuItemCheck: {
    fontSize: 18,
    color: '#00D4FF',
  },
});
