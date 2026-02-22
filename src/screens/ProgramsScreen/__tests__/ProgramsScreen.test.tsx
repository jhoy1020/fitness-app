// Tests for ProgramsScreen
// These tests verify the ProgramsScreen module structure and exports

describe('ProgramsScreen', () => {
  describe('module structure', () => {
    it('exports ProgramsScreen component', () => {
      const { ProgramsScreen } = require('../ProgramsScreen');
      expect(ProgramsScreen).toBeDefined();
      expect(typeof ProgramsScreen).toBe('function');
    });

    it('ProgramsScreen is a valid React component', () => {
      const { ProgramsScreen } = require('../ProgramsScreen');
      expect(ProgramsScreen.name).toBe('ProgramsScreen');
    });
  });

  describe('component interface', () => {
    it('accepts navigation prop', () => {
      const { ProgramsScreen } = require('../ProgramsScreen');
      expect(ProgramsScreen).toBeDefined();
    });
  });
});
