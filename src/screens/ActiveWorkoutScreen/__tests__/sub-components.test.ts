/**
 * Tests for ActiveWorkoutScreen sub-components (Phase 5 extractions).
 */

import * as fs from 'fs';
import * as path from 'path';

const dir = path.join(__dirname, '..');

const readSrc = (file: string) =>
  fs.readFileSync(path.join(dir, file), 'utf8');

describe('ActiveWorkoutScreen sub-components', () => {
  describe('PlateCalculatorDialog', () => {
    const src = readSrc('PlateCalculatorDialog.tsx');

    it('exports PlateCalculatorDialog component', () => {
      expect(src).toContain('export function PlateCalculatorDialog');
    });

    it('accepts visible, onDismiss, initialWeight, initialBarWeight props', () => {
      expect(src).toContain('visible: boolean');
      expect(src).toContain('onDismiss: () => void');
      expect(src).toContain('initialWeight?:');
      expect(src).toContain('initialBarWeight?:');
    });

    it('uses calculatePlates utility', () => {
      expect(src).toContain('calculatePlates');
    });

    it('shows achievability warning', () => {
      expect(src).toContain('achievable');
      expect(src).toContain("Can't hit exact weight");
    });

    it('manages its own input state', () => {
      expect(src).toContain('useState(initialWeight)');
      expect(src).toContain('useState(initialBarWeight)');
    });
  });

  describe('WarmupSetsDialog', () => {
    const src = readSrc('WarmupSetsDialog.tsx');

    it('exports WarmupSetsDialog component', () => {
      expect(src).toContain('export function WarmupSetsDialog');
    });

    it('accepts warmupSets array prop', () => {
      expect(src).toContain('warmupSets: WarmupSet[]');
    });

    it('has onComplete callback', () => {
      expect(src).toContain('onComplete: () => void');
    });

    it('displays weight, reps, percentage, rest, and plates', () => {
      expect(src).toContain('warmup.weight');
      expect(src).toContain('warmup.reps');
      expect(src).toContain('warmup.percentage');
      expect(src).toContain('warmup.rest');
      expect(src).toContain('formatPlatesDisplay');
    });

    it('has done warming up button', () => {
      expect(src).toContain('Done Warming Up');
    });
  });
});
