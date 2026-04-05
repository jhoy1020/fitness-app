// Types barrel — re-exports everything so existing imports work unchanged.
//
// Domain files:
//   exercise.ts  — MuscleGroup, Equipment, Exercise, …
//   activity.ts  — CardioType, CardioActivity, AbFinisher, …
//   template.ts  — WorkoutTemplate, TemplateExercise
//   program.ts   — TrainingProgram, ProgramDayTemplate, …
//   workout.ts   — Workout, WorkoutSet, WorkoutState, WorkoutAction, …
//   user.ts      — UserProfile, ExerciseGoal, UserState, UserAction, …
//   mesocycle.ts  — MesoCycle, MesoCycleState, MesoCycleAction, …
//   timer.ts     — TimerState, TimerAction
//   sharing.ts   — SharedProgramMeta, ProgramSearchFilters, … (Phase 8)

export * from './exercise';
export * from './activity';
export * from './template';
export * from './program';
export * from './workout';
export * from './user';
export * from './mesocycle';
export * from './timer';
export * from './sharing';
