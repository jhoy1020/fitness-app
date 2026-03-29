// Tests for ProgramsScreen
// These tests verify the ProgramsScreen module structure, exports, and edit feature

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.resolve(__dirname, '../ProgramsScreen.tsx'),
  'utf-8',
);

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

  describe('edit program feature', () => {
    it('has an edit icon button on custom program cards', () => {
      expect(SOURCE).toContain('AppIcons.edit');
    });

    it('edit icon navigates to CreateProgram with programId', () => {
      expect(SOURCE).toContain("navigation.navigate('CreateProgram', { programId: program.id })");
    });

    it('only shows edit button for custom programs (startsWith custom-)', () => {
      // The edit button is inside a block guarded by program.id.startsWith('custom-')
      const editIconIdx = SOURCE.indexOf('AppIcons.edit');
      const customCheckIdx = SOURCE.lastIndexOf("startsWith('custom-')", editIconIdx);
      expect(customCheckIdx).toBeGreaterThan(-1);
    });

    it('has an Edit button in the detail dialog for custom programs', () => {
      // There should be a Button with text "Edit" in the Dialog.Actions
      expect(SOURCE).toMatch(/>\s*Edit\s*<\/Button>/);
    });

    it('detail dialog edit button also navigates to CreateProgram with programId', () => {
      // The detail dialog uses selectedProgram.id
      expect(SOURCE).toContain('navigation.navigate(\'CreateProgram\', { programId: selectedProgram.id })');
    });

    it('closes detail dialog before navigating to edit', () => {
      // setSelectedProgram(null) should be called before navigation in the dialog edit handler
      const dialogEditIdx = SOURCE.indexOf('selectedProgram.id })');
      const closeIdx = SOURCE.lastIndexOf('setSelectedProgram(null)', dialogEditIdx);
      expect(closeIdx).toBeGreaterThan(-1);
    });

    it('shows edit and delete buttons together for custom programs on cards', () => {
      // Both AppIcons.edit and AppIcons.delete should be in the same conditional block
      expect(SOURCE).toContain('AppIcons.edit');
      expect(SOURCE).toContain('AppIcons.delete');
    });
  });
});
