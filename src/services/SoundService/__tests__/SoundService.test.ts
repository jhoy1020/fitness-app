import { soundService } from '../SoundService';

// Mock dependencies
jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          unloadAsync: jest.fn(),
        },
      }),
    },
  },
}));

jest.mock('../../../utils/storage', () => ({
  Storage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock AudioContext for web
const mockOscillator = {
  connect: jest.fn(),
  frequency: { value: 0 },
  type: 'sine',
  start: jest.fn(),
  stop: jest.fn(),
};

const mockGainNode = {
  connect: jest.fn(),
  gain: {
    setValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
};

const mockAudioContext = {
  createOscillator: jest.fn(() => mockOscillator),
  createGain: jest.fn(() => mockGainNode),
  destination: {},
  currentTime: 0,
};

(global as any).AudioContext = jest.fn(() => mockAudioContext);

describe('SoundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('module structure', () => {
    it('exports soundService singleton', () => {
      expect(soundService).toBeDefined();
    });

    it('has isEnabled method', () => {
      expect(typeof soundService.isEnabled).toBe('function');
    });

    it('has setEnabled method', () => {
      expect(typeof soundService.setEnabled).toBe('function');
    });

    it('has playBeep method', () => {
      expect(typeof soundService.playBeep).toBe('function');
    });

    it('has playTimerComplete method', () => {
      expect(typeof soundService.playTimerComplete).toBe('function');
    });

    it('has playSetLogged method', () => {
      expect(typeof soundService.playSetLogged).toBe('function');
    });

    it('has playWorkoutComplete method', () => {
      expect(typeof soundService.playWorkoutComplete).toBe('function');
    });

    it('has playPR method', () => {
      expect(typeof soundService.playPR).toBe('function');
    });

    it('has playError method', () => {
      expect(typeof soundService.playError).toBe('function');
    });

    it('has playTap method', () => {
      expect(typeof soundService.playTap).toBe('function');
    });
  });

  describe('isEnabled', () => {
    it('returns boolean', () => {
      const result = soundService.isEnabled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('setEnabled', () => {
    it('can toggle sounds on and off', async () => {
      await soundService.setEnabled(false);
      expect(soundService.isEnabled()).toBe(false);

      await soundService.setEnabled(true);
      expect(soundService.isEnabled()).toBe(true);
    });
  });

  describe('sound methods do not throw', () => {
    beforeEach(async () => {
      await soundService.setEnabled(true);
    });

    it('playBeep does not throw', () => {
      expect(() => soundService.playBeep()).not.toThrow();
    });

    it('playBeep with custom params does not throw', () => {
      expect(() => soundService.playBeep(440, 100, 0.5)).not.toThrow();
    });

    it('playTimerComplete does not throw', () => {
      expect(() => soundService.playTimerComplete()).not.toThrow();
    });

    it('playSetLogged does not throw', () => {
      expect(() => soundService.playSetLogged()).not.toThrow();
    });

    it('playWorkoutComplete does not throw', () => {
      expect(() => soundService.playWorkoutComplete()).not.toThrow();
    });

    it('playPR does not throw', () => {
      expect(() => soundService.playPR()).not.toThrow();
    });

    it('playError does not throw', () => {
      expect(() => soundService.playError()).not.toThrow();
    });

    it('playTap does not throw', () => {
      expect(() => soundService.playTap()).not.toThrow();
    });
  });

  describe('when disabled', () => {
    beforeEach(async () => {
      await soundService.setEnabled(false);
      jest.clearAllMocks();
    });

    it('playBeep does nothing when disabled', () => {
      soundService.playBeep();
      // AudioContext methods should not be called
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('playTimerComplete does nothing when disabled', () => {
      soundService.playTimerComplete();
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });
});
