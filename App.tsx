// Main App Component
// Sets up providers, navigation, and theme

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme, useWindowDimensions, TouchableOpacity, Modal, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, ActivityIndicator, Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { lightTheme, darkTheme, NARROW_SCREEN_WIDTH, withAlpha, spacing } from './src/theme';
import { AppIcons } from './src/theme/icons';
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
  WorkoutDetailScreen,
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

// Tab configuration — icons reference the centralized AppIcons map
const TAB_CONFIG = [
  { name: 'Home' as const, title: 'Dashboard', icon: AppIcons.home, iconOutline: AppIcons.homeOutline, component: HomeScreen },
  { name: 'Programs' as const, title: 'Programs', icon: AppIcons.programs, iconOutline: AppIcons.programsOutline, component: ProgramsScreen },
  { name: 'History' as const, title: 'History', icon: AppIcons.history, iconOutline: AppIcons.history, component: HistoryScreen },
  { name: 'Progress' as const, title: 'Progress', icon: AppIcons.progress, iconOutline: AppIcons.progressOutline, component: ProgressScreen },
  { name: 'Profile' as const, title: 'Profile', icon: AppIcons.profile, iconOutline: AppIcons.profileOutline, component: ProfileScreen },
];

// Hamburger Menu Component for narrow screens
function HamburgerMenu({ navigation, currentRoute }: { navigation: any; currentRoute: string }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const c = theme.colors;

  return (
    <>
      {/* Menu Button in bottom bar */}
      <View style={[
        styles.hamburgerBar,
        { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: c.surface, borderTopColor: withAlpha(c.outline, 0.3) }
      ]}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Open navigation menu"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name={AppIcons.menu} size={24} color={c.onSurface} style={{ marginRight: 8 }} />
          <Text style={[styles.hamburgerLabel, { color: c.onSurface }]}>Menu</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons
            name={TAB_CONFIG.find(t => t.name === currentRoute)?.icon || AppIcons.home}
            size={18}
            color={withAlpha(c.onSurface, 0.7)}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.currentScreen, { color: withAlpha(c.onSurface, 0.7) }]}>
            {TAB_CONFIG.find(t => t.name === currentRoute)?.title}
          </Text>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={[styles.menuOverlay, { backgroundColor: (c as any).scrim || 'rgba(0,0,0,0.5)' }]}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuSheet, { paddingBottom: Math.max(insets.bottom, 16), backgroundColor: c.surface }]}>
            <View style={[styles.menuHandle, { backgroundColor: withAlpha(c.onSurface, 0.3) }]} />
            <Text style={[styles.menuTitle, { color: c.onSurface }]}>Navigation</Text>
            {TAB_CONFIG.map((tab) => {
              const isActive = currentRoute === tab.name;
              return (
                <TouchableOpacity
                  key={tab.name}
                  style={[
                    styles.menuItem,
                    isActive && { backgroundColor: withAlpha(c.primary, 0.15) }
                  ]}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate(tab.name);
                  }}
                  accessibilityLabel={tab.title}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <MaterialCommunityIcons
                    name={isActive ? tab.icon : tab.iconOutline}
                    size={24}
                    color={isActive ? c.primary : c.onSurface}
                    style={{ marginRight: spacing.md }}
                  />
                  <Text style={[
                    styles.menuItemText,
                    { color: isActive ? c.primary : c.onSurface },
                    isActive && { fontWeight: '600' }
                  ]}>
                    {tab.title}
                  </Text>
                  {isActive && (
                    <MaterialCommunityIcons name={AppIcons.check} size={18} color={c.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
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
        headerStyle: {
          height: 56,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        headerTitleAlign: 'left',
        headerStatusBarHeight: 0,
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
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? tab.icon : tab.iconOutline}
                size={size}
                color={color}
              />
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
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          height: 56,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        headerTitleAlign: 'left',
        headerStatusBarHeight: 0,
      }}
    >
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
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{
          title: 'Workout Details',
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
          <Text variant="titleMedium" style={{ color: theme.colors.error }}>{error}</Text>
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
  // Hamburger menu styles for narrow screens (colors applied inline from theme)
  hamburgerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + 4,
    borderTopWidth: 1,
    zIndex: 1000,
    elevation: 10,
  },
  hamburgerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    minHeight: 44,
    minWidth: 80,
  },
  hamburgerLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentScreen: {
    fontSize: 14,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  menuHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
    minHeight: 56,
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
});
