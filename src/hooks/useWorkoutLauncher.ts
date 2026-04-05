// useWorkoutLauncher — "next workout" computation for the home screen
// Extracted from the massive HomeScreen getNextProgramWorkout logic.

import { useMemo } from 'react';
import type { MesoCycle, ProgramDayTemplate, ProgramWeekTemplate } from '../types';

interface NextWorkout {
  day: ProgramDayTemplate;
  dayIndex: number;       // 0-based index within the week template
  weekNumber: number;     // 1-based week
  isDeload: boolean;
  totalDays: number;
}

/**
 * Given the active mesocycle, compute which workout day is next.
 * Returns null if no program is active or all days are completed.
 */
export function useWorkoutLauncher(
  activeMesoCycle: MesoCycle | null
): NextWorkout | null {
  return useMemo(() => {
    if (!activeMesoCycle) return null;

    const { weekTemplate, weekTemplates, currentWeek, weeks, completedWorkouts } = activeMesoCycle;

    // Determine which week template to use
    let template: ProgramWeekTemplate | undefined;
    if (weekTemplates && weekTemplates.length > 0) {
      // Per-week variation — pick template for current week (cycle if beyond)
      const idx = (currentWeek - 1) % weekTemplates.length;
      template = weekTemplates[idx];
    } else {
      template = weekTemplate;
    }

    if (!template || !template.days || template.days.length === 0) return null;

    // Total days per week
    const totalDays = template.days.length;

    // Which day within the current week? (completedWorkouts mod daysPerWeek)
    const weekObj = weeks?.[currentWeek - 1];
    const completedThisWeek = weekObj?.workoutIds?.length ?? 0;
    const dayIndex = completedThisWeek % totalDays;

    if (dayIndex >= totalDays) return null; // All days done this week

    const day = template.days[dayIndex];
    const isDeload = weekObj?.isDeload ?? false;

    return {
      day,
      dayIndex,
      weekNumber: currentWeek,
      isDeload,
      totalDays,
    };
  }, [activeMesoCycle]);
}
