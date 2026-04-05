// useVolumeTracker — volume landmarks, MEV/MRV/MAV tracking
// Extracted computation logic for mesocycle volume management.

import { useMemo } from 'react';
import type { MuscleGroup, MuscleVolumeTracker, VolumeLandmarks } from '../types';
import { VOLUME_LANDMARKS } from '../utils/constants/constants';

interface UseVolumeTrackerResult {
  /** Per-muscle volume status for the current week. */
  volumeTrackers: MuscleVolumeTracker[];
  /** Muscles that are below MEV. */
  undertrainedMuscles: MuscleGroup[];
  /** Muscles near or at MRV. */
  overtaxedMuscles: MuscleGroup[];
  /** Overall volume adherence percentage. */
  adherencePercent: number;
}

/**
 * Given current week's completed volume and target volume per muscle,
 * produces volume status trackers for dashboard display.
 */
export function useVolumeTracker(
  completedVolume: Record<MuscleGroup, number>,
  targetVolume: Record<MuscleGroup, number>
): UseVolumeTrackerResult {
  return useMemo(() => {
    const muscles = Object.keys(VOLUME_LANDMARKS) as MuscleGroup[];
    const trackers: MuscleVolumeTracker[] = [];
    const undertrained: MuscleGroup[] = [];
    const overtaxed: MuscleGroup[] = [];
    let totalTarget = 0;
    let totalCompleted = 0;

    for (const muscle of muscles) {
      const landmarks = VOLUME_LANDMARKS[muscle] as VolumeLandmarks | undefined;
      if (!landmarks) continue;

      const completed = completedVolume[muscle] || 0;
      const target = targetVolume[muscle] || 0;
      const percentOfMRV = landmarks.MRV > 0
        ? Math.round((completed / landmarks.MRV) * 100)
        : 0;

      let status: MuscleVolumeTracker['status'];
      if (completed < landmarks.MEV) {
        status = 'below_mev';
        undertrained.push(muscle);
      } else if (completed <= landmarks.MEV + 1) {
        status = 'at_mev';
      } else if (completed < landmarks.MAV[1]) {
        status = 'in_mav';
      } else if (completed < landmarks.MRV) {
        status = 'near_mrv';
        overtaxed.push(muscle);
      } else {
        status = 'at_mrv';
        overtaxed.push(muscle);
      }

      trackers.push({
        muscleGroup: muscle,
        setsCompleted: completed,
        targetSets: target,
        percentOfMRV,
        status,
      });

      totalTarget += target;
      totalCompleted += completed;
    }

    const adherencePercent = totalTarget > 0
      ? Math.round((totalCompleted / totalTarget) * 100)
      : 0;

    return {
      volumeTrackers: trackers,
      undertrainedMuscles: undertrained,
      overtaxedMuscles: overtaxed,
      adherencePercent,
    };
  }, [completedVolume, targetVolume]);
}
