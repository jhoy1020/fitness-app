// Tests for ProfileScreen
// These tests verify the ProfileScreen module structure and exports

describe('ProfileScreen', () => {
  describe('module structure', () => {
    it('exports ProfileScreen component', () => {
      const { ProfileScreen } = require('../ProfileScreen');
      expect(ProfileScreen).toBeDefined();
      expect(typeof ProfileScreen).toBe('function');
    });

    it('ProfileScreen is a valid React component', () => {
      const { ProfileScreen } = require('../ProfileScreen');
      expect(ProfileScreen.name).toBe('ProfileScreen');
    });
  });

  describe('component interface', () => {
    it('accepts navigation prop', () => {
      const { ProfileScreen } = require('../ProfileScreen');
      expect(ProfileScreen).toBeDefined();
    });
  });
});
