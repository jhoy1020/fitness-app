/**
 * Tests for the SQLite schema definition.
 *
 * Structural tests that verify the schema SQL contains all expected tables
 * and columns, including Phase 8 future-ready fields.
 */

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.join(__dirname, '..', 'schema.ts'),
  'utf8',
);

describe('Database schema', () => {
  describe('required tables', () => {
    const expectedTables = [
      'exercises',
      'workout_templates',
      'template_exercises',
      'workouts',
      'workout_sets',
      'user_profile',
      'exercise_goals',
      'body_measurements',
      'one_rep_max_records',
      'programs',
      'mesocycles',
      'workout_feedback',
      'muscle_fatigue',
      'export_history',
      'app_meta',
    ];

    expectedTables.forEach((table) => {
      it(`contains CREATE TABLE for ${table}`, () => {
        expect(SOURCE).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      });
    });
  });

  describe('Phase 8 future-ready columns in programs table', () => {
    const phaseColumns = [
      'creator_id',
      'creator_name',
      'remote_id',
      'visibility',
      'downloads',
      'rating',
      'rating_count',
      'source',
      'cloned_from_id',
    ];

    phaseColumns.forEach((col) => {
      it(`programs table has ${col} column`, () => {
        // Column should appear after "CREATE TABLE IF NOT EXISTS programs"
        const programsIndex = SOURCE.indexOf('CREATE TABLE IF NOT EXISTS programs');
        expect(programsIndex).toBeGreaterThan(-1);
        const programsSection = SOURCE.substring(programsIndex, SOURCE.indexOf(';', programsIndex));
        expect(programsSection).toContain(col);
      });
    });
  });

  describe('Phase 8 future-ready columns in user_profile table', () => {
    const phaseColumns = [
      'email',
      'display_name',
      'remote_user_id',
      'auth_provider',
      'avatar_url',
    ];

    phaseColumns.forEach((col) => {
      it(`user_profile table has ${col} column`, () => {
        const profileIndex = SOURCE.indexOf('CREATE TABLE IF NOT EXISTS user_profile');
        expect(profileIndex).toBeGreaterThan(-1);
        const profileSection = SOURCE.substring(profileIndex, SOURCE.indexOf(';', profileIndex));
        expect(profileSection).toContain(col);
      });
    });
  });

  describe('schema versioning', () => {
    it('exports SCHEMA_VERSION', () => {
      expect(SOURCE).toContain('export const SCHEMA_VERSION');
    });

    it('exports SCHEMA_V1', () => {
      expect(SOURCE).toContain('export const SCHEMA_V1');
    });
  });
});
