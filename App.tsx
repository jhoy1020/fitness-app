// Main App Component
// Sets up providers, navigation, and theme

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme, useWindowDimensions, TouchableOpacity, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, ActivityIndicator, Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { lightTheme, darkTheme, withAlpha, spacing } from './src/theme';

// Tab bar narrow-screen breakpoint.
//
// The shared theme `NARROW_SCREEN_WIDTH` (400) was originally used here too,
// but at 400px iPhone 13 mini (375pt), iPhone SE 2nd/3rd gen (375pt), and
// many compact Android devices fell below the threshold and were forced
// into a hamburger menu — a measurable hit to navigation discoverability vs.
// visible tabs on a 5-destination app.
//
// 340 keeps real phones on the visible tab bar and only collapses to the
// hamburger sheet on genuinely tiny widths (original iPhone SE 1st gen at
// 320pt, narrow split-screen / foldable inner edges).
//
// TODO(nav): A richer fix would render a 3-icon "primary + More sheet" tab
// bar at narrow widths so users still see direct entry points for Home /
// Programs / Profile. That requires reworking the Tab.Navigator's
// tabBarStyle + a synthetic More tab and was deferred to keep this change
// surgical.
const TAB_BAR_HAMBURGER_BREAKPOINT = 340;
import { AppIcons } from './src/theme/icons';
import {
  WorkoutProvider,
  UserProvider,
  TimerProvider,
  MesoCycleProvider,
  ThemeProvider,
  AuthProvider,
  DatabaseProvider,
  useAuth,
  useThemeMode,
} from './src/context';
import { initDatabase, seedExercises, EXERCISE_LIBRARY } from './src/services/db';
import { FEATURE_FLAGS } from './src/config/featureFlags';
import type { RootStackParamList, MainTabParamList } from './src/navigation';
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
  OneRepMaxTestScreen,
  LoginScreen,
} from './src/screens';

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
  const isNarrowScreen = width < TAB_BAR_HAMBURGER_BREAKPOINT;
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
        options={({ route }) => ({
          title: (route.params as any)?.programId ? 'Edit Program' : 'Create Program',
        })}
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
      <Stack.Screen
        name="OneRepMaxTest"
        component={OneRepMaxTestScreen}
        options={{
          title: '1RM Test Day',
        }}
      />
    </Stack.Navigator>
  );
}

// Auth Stack Navigator — rendered when the user is not authenticated.
// LoginScreen is full-screen here (no `presentation: 'modal'`); successful
// auth flips `useAuth().isAuthenticated`, which causes AppContent to swap
// in the main RootNavigator below.
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
    </Stack.Navigator>
  );
}

// Auth-aware navigation switch. Lives inside AuthProvider so it can read
// useAuth(); renders the auth stack until the user is authenticated, then
// swaps in the main app stack. Re-renders automatically when auth state
// flips, so LoginScreen no longer needs to call navigation.goBack().
function NavigationGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Signing you in...</Text>
      </View>
    );
  }

  // When auth is gated off, the auth stack is unreachable — every launch
  // lands directly in the main app. AuthProvider stays mounted so any
  // remaining useAuth() readers get a stable null-user state.
  if (!FEATURE_FLAGS.authAndAccount) {
    return (
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
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
      // Start the mock API layer before anything else makes a network call.
      if (__DEV__) {
        const { startMockApi } = await import('./src/mocks/start');
        await startMockApi();
      }

      // TODO: Consolidate DB init paths. Today the legacy services/db memory
      // store (initDatabase + seedExercises) runs here while DatabaseProvider
      // owns the SQLite path. Pick one and migrate the rest in a follow-up.
      await initDatabase();
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
      <AuthProvider>
        {/* DatabaseProvider sits above the data-consuming providers so they
            can eventually read repos via useDatabase(). */}
        <DatabaseProvider>
          <UserProvider>
            <WorkoutProvider>
              <TimerProvider>
                <MesoCycleProvider>
                  <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                  >
                    <NavigationGate />
                  </KeyboardAvoidingView>
                </MesoCycleProvider>
              </TimerProvider>
            </WorkoutProvider>
          </UserProvider>
        </DatabaseProvider>
      </AuthProvider>
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
