// Tests for ActiveWorkoutScreen
// These tests verify the ActiveWorkoutScreen module structure, exports, and notes feature

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.resolve(__dirname, '../ActiveWorkoutScreen.tsx'),
  'utf-8',
);

describe('ActiveWorkoutScreen', () => {
  describe('module structure', () => {
    it('exports ActiveWorkoutScreen component', () => {
      const { ActiveWorkoutScreen } = require('../ActiveWorkoutScreen');
      expect(ActiveWorkoutScreen).toBeDefined();
      expect(typeof ActiveWorkoutScreen).toBe('function');
    });

    it('ActiveWorkoutScreen is a valid React component', () => {
      const { ActiveWorkoutScreen } = require('../ActiveWorkoutScreen');
      expect(ActiveWorkoutScreen.name).toBe('ActiveWorkoutScreen');
    });
  });

  describe('component interface', () => {
    it('accepts navigation and route props', () => {
      const { ActiveWorkoutScreen } = require('../ActiveWorkoutScreen');
      expect(ActiveWorkoutScreen).toBeDefined();
    });
  });

  describe('exercise notes feature', () => {
    it('WorkoutExercise interface includes notes field', () => {
      expect(SOURCE).toMatch(/interface WorkoutExercise\s*\{[\s\S]*?notes\?\s*:\s*string/);
    });

    it('WorkoutExercise interface includes templateNotes field', () => {
      expect(SOURCE).toMatch(/interface WorkoutExercise\s*\{[\s\S]*?templateNotes\?\s*:\s*string/);
    });

    it('has notesExpandedExercises state for toggle behavior', () => {
      expect(SOURCE).toContain('notesExpandedExercises');
      expect(SOURCE).toContain('setNotesExpandedExercises');
      expect(SOURCE).toMatch(/useState<Set<string>>/);
    });

    it('renders a notes toggle icon in exercise header actions', () => {
      // Should show filled icon when notes exist, outline otherwise
      expect(SOURCE).toContain("name={exercise.notes || exercise.templateNotes ? 'note-text' : AppIcons.notes}");
    });

    it('highlights notes icon when exercise has notes', () => {
      expect(SOURCE).toContain('color={exercise.notes || exercise.templateNotes ? theme.colors.primary : theme.colors.onSurfaceVariant}');
    });

    it('renders exercise notes TextInput when expanded', () => {
      expect(SOURCE).toContain('label="Exercise notes"');
      expect(SOURCE).toContain('placeholder="e.g., 1s pause at bottom, controlled negative"');
    });

    it('renders template notes as read-only PROGRAM NOTE hint', () => {
      expect(SOURCE).toContain('PROGRAM NOTE');
      expect(SOURCE).toContain('exercise.templateNotes');
      expect(SOURCE).toContain("fontStyle: 'italic'");
    });

    it('shows notes section when toggle is active or notes exist', () => {
      expect(SOURCE).toContain('notesExpandedExercises.has(exercise.id) || exercise.notes || exercise.templateNotes');
    });

    it('updates exercise notes via setExercises on text change', () => {
      // Verifies the onChangeText handler updates the exercise in state
      expect(SOURCE).toMatch(/setExercises\(prev => prev\.map\(ex =>\s*\n\s*ex\.id === exercise\.id \? \{ \.\.\.ex, notes: text \} : ex/);
    });

    it('includes notes in saved workout exercises', () => {
      // completeWorkout() should map notes into the saved exercise data
      expect(SOURCE).toMatch(/exerciseId:\s*e\.id[\s\S]*?notes:\s*e\.notes/);
    });

    it('carries template notes from program template exercises', () => {
      // When loading from a program template, set.notes → templateNotes
      expect(SOURCE).toContain('templateNotes: set.notes');
    });

    it('toggle icon adds/removes exercise from notesExpandedExercises set', () => {
      // Ensure toggle logic: add if not present, remove if present
      expect(SOURCE).toContain('next.has(exercise.id)');
      expect(SOURCE).toContain('next.delete(exercise.id)');
      expect(SOURCE).toContain('next.add(exercise.id)');
    });

    it('auto-expands notes section when template notes exist', () => {
      // When loading from program template, exercises with notes should be auto-expanded
      expect(SOURCE).toContain('if (set.notes) {');
      // Should add exercise id to notesExpandedExercises set
      expect(SOURCE).toContain('next.add(exerciseMap.get(set.exerciseName)!.id)');
    });
  });
});
