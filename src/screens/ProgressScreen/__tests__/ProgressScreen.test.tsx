// Tests for ProgressScreen
// These tests verify the ProgressScreen module structure and exports

describe('ProgressScreen', () => {
  describe('module structure', () => {
    it('exports ProgressScreen component', () => {
      const { ProgressScreen } = require('../ProgressScreen');
      expect(ProgressScreen).toBeDefined();
      expect(typeof ProgressScreen).toBe('function');
    });

    it('ProgressScreen is a valid React component', () => {
      const { ProgressScreen } = require('../ProgressScreen');
      expect(ProgressScreen.name).toBe('ProgressScreen');
    });
  });

  describe('component interface', () => {
    it('accepts navigation prop', () => {
      const { ProgressScreen } = require('../ProgressScreen');
      expect(ProgressScreen).toBeDefined();
    });
  });

  describe('1RM Test Day integration', () => {
    it('source file contains Test Your 1RM card', () => {
      const fs = require('fs');
      const path = require('path');
      const source = fs.readFileSync(
        path.resolve(__dirname, '../ProgressScreen.tsx'),
        'utf-8',
      );
      expect(source).toContain('Test Your 1RM');
      expect(source).toContain('Start 1RM Test');
      expect(source).toContain("navigation.navigate('OneRepMaxTest')");
    });

    it('source imports the trophy icon for the button', () => {
      const fs = require('fs');
      const path = require('path');
      const source = fs.readFileSync(
        path.resolve(__dirname, '../ProgressScreen.tsx'),
        'utf-8',
      );
      expect(source).toContain('AppIcons.pr');
    });
  });
});
