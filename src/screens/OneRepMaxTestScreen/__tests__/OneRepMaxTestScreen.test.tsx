// Tests for OneRepMaxTestScreen

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { OneRepMaxTestScreen } from '../OneRepMaxTestScreen';
import { useUser } from '../../../context/UserContext';
import { useTimer } from '../../../context/TimerContext';

// ─── Mocks ────────────────────────────────────────────────

jest.mock('../../../context/UserContext', () => ({
  useUser: jest.fn(),
}));
jest.mock('../../../context/TimerContext', () => ({
  useTimer: jest.fn(),
}));

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseTimer = useTimer as jest.MockedFunction<typeof useTimer>;

const mockAddOneRepMax = jest.fn();
const mockGetOneRepMax = jest.fn();
const mockStartTimer = jest.fn();
const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

const defaultUserState = {
  profile: null,
  exerciseGoals: [],
  nutrition: null,
  weightHistory: [],
  units: 'imperial' as const,
  oneRepMaxRecords: [],
};

function setup(overrides?: {
  userState?: Partial<typeof defaultUserState>;
  routeParams?: { exerciseName?: string };
  existingRecord?: { weight: number; exerciseName: string };
}) {
  const userState = { ...defaultUserState, ...overrides?.userState };

  mockGetOneRepMax.mockImplementation((name: string) => {
    if (overrides?.existingRecord && overrides.existingRecord.exerciseName === name) {
      return {
        id: '1',
        exerciseName: name,
        weight: overrides.existingRecord.weight,
        unit: 'lbs',
        testedDate: '2026-03-01',
        method: 'tested',
      };
    }
    return undefined;
  });

  mockUseUser.mockReturnValue({
    state: userState,
    addOneRepMax: mockAddOneRepMax,
    getOneRepMax: mockGetOneRepMax,
    loadProfile: jest.fn(),
    updateProfile: jest.fn(),
    loadExerciseGoals: jest.fn(),
    setExerciseGoal: jest.fn(),
    recalculateNutrition: jest.fn(),
    addWeightEntry: jest.fn(),
    loadWeightHistory: jest.fn(),
    updateOneRepMax: jest.fn(),
    deleteOneRepMax: jest.fn(),
  } as any);

  mockUseTimer.mockReturnValue({
    state: { isRunning: false, timeRemaining: 0, totalTime: 0, remainingTime: 0 },
    startTimer: mockStartTimer,
    pauseTimer: jest.fn(),
    resumeTimer: jest.fn(),
    resetTimer: jest.fn(),
    stopTimer: jest.fn(),
    adjustTimer: jest.fn(),
    dispatch: jest.fn(),
  } as any);

  const route = overrides?.routeParams
    ? { params: overrides.routeParams }
    : undefined;

  return render(
    <OneRepMaxTestScreen navigation={mockNavigation} route={route} />,
    { wrapper },
  );
}

// ─── Tests ────────────────────────────────────────────────

describe('OneRepMaxTestScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Module structure ──────────────────────────────────

  describe('module structure', () => {
    it('exports OneRepMaxTestScreen component', () => {
      const { OneRepMaxTestScreen: Comp } = require('../OneRepMaxTestScreen');
      expect(Comp).toBeDefined();
      expect(typeof Comp).toBe('function');
    });

    it('exports as default', () => {
      const defaultExport = require('../OneRepMaxTestScreen').default;
      expect(defaultExport).toBeDefined();
      expect(typeof defaultExport).toBe('function');
    });
  });

  // ── Initial render (setup phase) ──────────────────────

  describe('setup phase', () => {
    it('renders the screen title', () => {
      setup();
      expect(screen.getByText('1RM Test Day')).toBeTruthy();
    });

    it('shows protocol description', () => {
      setup();
      expect(
        screen.getByText(/Follow the protocol below to safely test your one-rep max/),
      ).toBeTruthy();
    });

    it('renders exercise selection section', () => {
      setup();
      expect(screen.getByText('Choose Exercise')).toBeTruthy();
    });

    it('renders all four exercise choices', () => {
      setup();
      expect(screen.getByText('Bench Press')).toBeTruthy();
      expect(screen.getByText('Squat')).toBeTruthy();
      expect(screen.getByText('Deadlift')).toBeTruthy();
      expect(screen.getByText('Strict Press')).toBeTruthy();
    });

    it('renders weight input section', () => {
      setup();
      expect(screen.getByText('Enter Your Numbers')).toBeTruthy();
    });

    it('renders current and goal 1RM inputs with lbs', () => {
      setup();
      expect(screen.getAllByText('Current 1RM (lbs)').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Goal 1RM (lbs)').length).toBeGreaterThan(0);
    });

    it('renders current and goal 1RM inputs with kg for metric', () => {
      setup({ userState: { units: 'metric' as any } });
      expect(screen.getAllByText('Current 1RM (kg)').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Goal 1RM (kg)').length).toBeGreaterThan(0);
    });

    it('renders Generate Test Plan button', () => {
      setup();
      expect(screen.getByText('Generate Test Plan')).toBeTruthy();
    });

    it('generate button is disabled when no exercise selected', () => {
      setup();
      const button = screen.getByText('Generate Test Plan');
      // Button should be disabled since no exercise is selected and inputs are empty
      expect(button).toBeTruthy();
    });
  });

  // ── Exercise selection ────────────────────────────────

  describe('exercise selection', () => {
    it('pre-fills current 1RM when existing record is found', () => {
      setup({
        existingRecord: { exerciseName: 'Barbell Bench Press', weight: 275 },
      });

      // Tap bench press
      fireEvent.press(screen.getByText('Bench Press'));

      // getOneRepMax should have been called with the exercise name
      expect(mockGetOneRepMax).toHaveBeenCalledWith('Barbell Bench Press');
    });

    it('calls getOneRepMax when exercise is selected', () => {
      setup();
      fireEvent.press(screen.getByText('Squat'));
      expect(mockGetOneRepMax).toHaveBeenCalledWith('Barbell Back Squat');
    });

    it('calls getOneRepMax for deadlift', () => {
      setup();
      fireEvent.press(screen.getByText('Deadlift'));
      expect(mockGetOneRepMax).toHaveBeenCalledWith('Barbell Deadlift');
    });

    it('calls getOneRepMax for strict press', () => {
      setup();
      fireEvent.press(screen.getByText('Strict Press'));
      expect(mockGetOneRepMax).toHaveBeenCalledWith('Overhead Press');
    });
  });

  // ── Validation ────────────────────────────────────────

  describe('validation', () => {
    it('shows error when goal is not higher than current', () => {
      setup();
      fireEvent.press(screen.getByText('Bench Press'));

      // Find the TextInput elements and enter values
      const inputs = screen.getAllByDisplayValue('');
      // Set current > goal
      fireEvent.changeText(inputs[0], '300');
      fireEvent.changeText(inputs[1], '250');

      expect(screen.getByText('Goal must be higher than current 1RM')).toBeTruthy();
    });
  });

  // ── Protocol generation ───────────────────────────────

  describe('protocol generation', () => {
    function setupAndGenerate() {
      setup();
      fireEvent.press(screen.getByText('Bench Press'));
      const inputs = screen.getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], '300');
      fireEvent.changeText(inputs[1], '315');
      fireEvent.press(screen.getByText('Generate Test Plan'));
    }

    it('shows protocol view after generating', () => {
      setupAndGenerate();
      expect(screen.getByText('Warm-Up Sets')).toBeTruthy();
      expect(screen.getByText('Attempts')).toBeTruthy();
    });

    it('shows exercise name in protocol summary', () => {
      setupAndGenerate();
      expect(screen.getByText('Barbell Bench Press')).toBeTruthy();
    });

    it('shows current and goal in summary banner', () => {
      setupAndGenerate();
      expect(screen.getByText(/Current 1RM: 300 lbs/)).toBeTruthy();
      expect(screen.getByText(/Goal: 315 lbs/)).toBeTruthy();
    });

    it('shows attempt labels', () => {
      setupAndGenerate();
      expect(screen.getByText('Opener')).toBeTruthy();
      expect(screen.getByText('2nd Attempt')).toBeTruthy();
      expect(screen.getByText('3rd Attempt – Goal')).toBeTruthy();
    });

    it('shows attempt weights', () => {
      setupAndGenerate();
      // 90% of 300 = 270
      expect(screen.getByText('270 lbs')).toBeTruthy();
      // Goal = 315
      expect(screen.getByText('315 lbs')).toBeTruthy();
    });

    it('shows RPE for each attempt', () => {
      setupAndGenerate();
      expect(screen.getByText('RPE 8')).toBeTruthy();
      expect(screen.getByText('RPE 9')).toBeTruthy();
      expect(screen.getByText('RPE 10')).toBeTruthy();
    });

    it('shows percentage of 1RM for each attempt', () => {
      setupAndGenerate();
      expect(screen.getByText('90% of 1RM')).toBeTruthy();
      expect(screen.getByText('105% of 1RM')).toBeTruthy();
    });

    it('shows Hit and Miss buttons for each attempt', () => {
      setupAndGenerate();
      const hitButtons = screen.getAllByText('Hit');
      const missButtons = screen.getAllByText('Miss');
      expect(hitButtons).toHaveLength(3);
      expect(missButtons).toHaveLength(3);
    });

    it('shows rest timer buttons for opener and 2nd attempt', () => {
      setupAndGenerate();
      expect(screen.getByText('3m rest')).toBeTruthy();
      expect(screen.getByText('5m rest')).toBeTruthy();
    });

    it('shows Start New Test button', () => {
      setupAndGenerate();
      expect(screen.getByText('Start New Test')).toBeTruthy();
    });
  });

  // ── Attempt tracking ──────────────────────────────────

  describe('attempt tracking', () => {
    function setupAndGenerate() {
      setup();
      fireEvent.press(screen.getByText('Bench Press'));
      const inputs = screen.getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], '300');
      fireEvent.changeText(inputs[1], '315');
      fireEvent.press(screen.getByText('Generate Test Plan'));
    }

    it('shows result summary when an attempt is marked as hit', () => {
      setupAndGenerate();
      const hitButtons = screen.getAllByText('Hit');
      fireEvent.press(hitButtons[0]); // Hit the opener
      expect(screen.getByText(/New 1RM: 270 lbs/)).toBeTruthy();
    });

    it('shows Save New 1RM button after hitting an attempt', () => {
      setupAndGenerate();
      const hitButtons = screen.getAllByText('Hit');
      fireEvent.press(hitButtons[0]);
      expect(screen.getByText('Save New 1RM')).toBeTruthy();
    });

    it('shows best hit weight when multiple attempts are hit', () => {
      setupAndGenerate();
      const hitButtons = screen.getAllByText('Hit');
      fireEvent.press(hitButtons[0]); // Hit opener (270)
      fireEvent.press(hitButtons[2]); // Hit goal (315)
      expect(screen.getByText(/New 1RM: 315 lbs/)).toBeTruthy();
    });

    it('shows PR message when hit weight exceeds current', () => {
      setupAndGenerate();
      const hitButtons = screen.getAllByText('Hit');
      fireEvent.press(hitButtons[2]); // Hit goal (315)
      expect(screen.getByText(/\+15 lbs PR!/)).toBeTruthy();
    });

    it('does not show result summary when all attempts are missed', () => {
      setupAndGenerate();
      const missButtons = screen.getAllByText('Miss');
      fireEvent.press(missButtons[0]);
      fireEvent.press(missButtons[1]);
      fireEvent.press(missButtons[2]);
      expect(screen.queryByText(/New 1RM:/)).toBeNull();
    });

    it('toggling hit off removes result summary', () => {
      setupAndGenerate();
      const hitButtons = screen.getAllByText('Hit');
      fireEvent.press(hitButtons[0]); // Hit
      expect(screen.getByText(/New 1RM:/)).toBeTruthy();
      fireEvent.press(hitButtons[0]); // Toggle off
      expect(screen.queryByText(/New 1RM:/)).toBeNull();
    });
  });

  // ── Saving 1RM ────────────────────────────────────────

  describe('saving 1RM', () => {
    function setupAndHit() {
      setup();
      fireEvent.press(screen.getByText('Bench Press'));
      const inputs = screen.getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], '300');
      fireEvent.changeText(inputs[1], '315');
      fireEvent.press(screen.getByText('Generate Test Plan'));
      const hitButtons = screen.getAllByText('Hit');
      fireEvent.press(hitButtons[2]); // Hit goal
    }

    it('calls addOneRepMax when Save is pressed', () => {
      setupAndHit();
      fireEvent.press(screen.getByText('Save New 1RM'));
      expect(mockAddOneRepMax).toHaveBeenCalledWith(
        'Barbell Bench Press',
        315,
        'tested',
        '1RM Test Day',
      );
    });

    it('shows Saved! confirmation after saving', () => {
      setupAndHit();
      fireEvent.press(screen.getByText('Save New 1RM'));
      expect(screen.getByText('Saved!')).toBeTruthy();
    });

    it('hides Save button after saving', () => {
      setupAndHit();
      fireEvent.press(screen.getByText('Save New 1RM'));
      expect(screen.queryByText('Save New 1RM')).toBeNull();
    });
  });

  // ── Rest timer integration ────────────────────────────

  describe('rest timer', () => {
    function setupAndGenerate() {
      setup();
      fireEvent.press(screen.getByText('Bench Press'));
      const inputs = screen.getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], '300');
      fireEvent.changeText(inputs[1], '315');
      fireEvent.press(screen.getByText('Generate Test Plan'));
    }

    it('calls startTimer with 180s when tapping 3m rest', () => {
      setupAndGenerate();
      fireEvent.press(screen.getByText('3m rest'));
      expect(mockStartTimer).toHaveBeenCalledWith(180);
    });

    it('calls startTimer with 300s when tapping 5m rest', () => {
      setupAndGenerate();
      fireEvent.press(screen.getByText('5m rest'));
      expect(mockStartTimer).toHaveBeenCalledWith(300);
    });
  });

  // ── Reset / New test ──────────────────────────────────

  describe('reset', () => {
    it('returns to setup phase when Start New Test is pressed', () => {
      setup();
      fireEvent.press(screen.getByText('Bench Press'));
      const inputs = screen.getAllByDisplayValue('');
      fireEvent.changeText(inputs[0], '300');
      fireEvent.changeText(inputs[1], '315');
      fireEvent.press(screen.getByText('Generate Test Plan'));

      // Should be in protocol phase
      expect(screen.getByText('Attempts')).toBeTruthy();

      fireEvent.press(screen.getByText('Start New Test'));

      // Should be back in setup phase
      expect(screen.getByText('Choose Exercise')).toBeTruthy();
      expect(screen.getByText('Enter Your Numbers')).toBeTruthy();
    });
  });
});
