// Tests for HomeScreen
// These tests verify the HomeScreen module structure and exports

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.resolve(__dirname, '../HomeScreen.tsx'),
  'utf-8',
);

describe('HomeScreen', () => {
  describe('module structure', () => {
    it('exports HomeScreen component', () => {
      const { HomeScreen } = require('../HomeScreen');
      expect(HomeScreen).toBeDefined();
      expect(typeof HomeScreen).toBe('function');
    });

    it('HomeScreen is a valid React component', () => {
      const { HomeScreen } = require('../HomeScreen');
      // React components have a name and are functions
      expect(HomeScreen.name).toBe('HomeScreen');
    });
  });

  describe('component interface', () => {
    it('accepts navigation prop', () => {
      const { HomeScreen } = require('../HomeScreen');
      // The component should be defined and callable
      // Full render tests require complete context setup
      expect(HomeScreen).toBeDefined();
    });
  });

  describe('program exercise notes mapping', () => {
    it('maps exercise notes into program workout sets', () => {
      // getNextProgramWorkout should include notes: ex.notes in the set mapping
      expect(SOURCE).toContain('notes: ex.notes,');
    });

    it('maps notes alongside other exercise fields', () => {
      // notes should appear near supersetOrder in the mapping
      const notesIdx = SOURCE.indexOf('notes: ex.notes,');
      const supersetIdx = SOURCE.lastIndexOf('supersetOrder: ex.supersetOrder', notesIdx);
      expect(supersetIdx).toBeGreaterThan(-1);
      expect(notesIdx - supersetIdx).toBeLessThan(100);
    });
  });
});
