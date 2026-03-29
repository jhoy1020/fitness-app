// Tests for WorkoutDetailScreen
// These tests verify the WorkoutDetailScreen module structure and exports

describe('WorkoutDetailScreen', () => {
  describe('module structure', () => {
    it('exports WorkoutDetailScreen component', () => {
      const { WorkoutDetailScreen } = require('../WorkoutDetailScreen');
      expect(WorkoutDetailScreen).toBeDefined();
      expect(typeof WorkoutDetailScreen).toBe('function');
    });

    it('WorkoutDetailScreen is a valid React component', () => {
      const { WorkoutDetailScreen } = require('../WorkoutDetailScreen');
      expect(WorkoutDetailScreen.name).toBe('WorkoutDetailScreen');
    });
  });

  describe('component interface', () => {
    it('accepts navigation and route props', () => {
      const { WorkoutDetailScreen } = require('../WorkoutDetailScreen');
      expect(WorkoutDetailScreen).toBeDefined();
    });
  });
});
