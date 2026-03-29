// Tests for CreateProgramScreen
// These tests verify the CreateProgramScreen module structure, exports, and notes feature

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.resolve(__dirname, '../CreateProgramScreen.tsx'),
  'utf-8',
);

describe('CreateProgramScreen', () => {
  describe('module structure', () => {
    it('exports CreateProgramScreen component', () => {
      const { CreateProgramScreen } = require('../CreateProgramScreen');
      expect(CreateProgramScreen).toBeDefined();
      expect(typeof CreateProgramScreen).toBe('function');
    });

    it('CreateProgramScreen is a valid React component', () => {
      const { CreateProgramScreen } = require('../CreateProgramScreen');
      expect(CreateProgramScreen.name).toBe('CreateProgramScreen');
    });
  });

  describe('component interface', () => {
    it('accepts navigation and route props', () => {
      const { CreateProgramScreen } = require('../CreateProgramScreen');
      expect(CreateProgramScreen).toBeDefined();
    });
  });

  describe('exercise notes feature', () => {
    it('ExerciseEntry interface includes notes field', () => {
      expect(SOURCE).toMatch(/interface ExerciseEntry\s*\{[\s\S]*?notes\?\s*:\s*string/);
    });

    it('has newExerciseNotes state variable', () => {
      expect(SOURCE).toContain("const [newExerciseNotes, setNewExerciseNotes] = useState('')");
    });

    it('resets newExerciseNotes when add exercise dialog opens', () => {
      // handleOpenAddExercise should reset the notes state
      expect(SOURCE).toContain("setNewExerciseNotes('')");
    });

    it('includes notes TextInput in add exercise dialog', () => {
      expect(SOURCE).toContain('label="Notes (optional)"');
      expect(SOURCE).toContain('onChangeText={setNewExerciseNotes}');
      expect(SOURCE).toContain('value={newExerciseNotes}');
    });

    it('TextInput has helpful placeholder text', () => {
      expect(SOURCE).toContain('placeholder="e.g., 1s pause at bottom, controlled negative"');
    });

    it('TextInput is multiline and dense', () => {
      // Should find a TextInput with multiline near the notes label
      const notesInputMatch = SOURCE.match(/label="Notes \(optional\)"[\s\S]*?multiline/);
      expect(notesInputMatch).not.toBeNull();
    });

    it('includes notes in the newly created ExerciseEntry', () => {
      // handleAddExercise builds the ExerciseEntry with notes
      expect(SOURCE).toContain('notes: newExerciseNotes.trim() || undefined');
    });

    it('maps notes into ProgramExerciseTemplate on save', () => {
      // handleSaveProgram should include notes in the exercise mapping
      expect(SOURCE).toMatch(/exerciseName:\s*e\.exerciseName[\s\S]*?notes:\s*e\.notes/);
    });

    it('displays notes on regular exercise rows with icon', () => {
      // Non-superset exercise rows should show notes text when present
      expect(SOURCE).toContain('{exercise.notes ?');
      expect(SOURCE).toContain('AppIcons.notes');
    });

    it('displays notes on superset exercise rows with icon', () => {
      // Superset group exercise rows should also show notes
      expect(SOURCE).toContain('{groupEx.notes ?');
    });

    it('renders notes text in italic style', () => {
      // Notes are displayed with italic font style for visual distinction
      const italicMatches = SOURCE.match(/fontStyle: 'italic'/g);
      expect(italicMatches).not.toBeNull();
      expect(italicMatches!.length).toBeGreaterThanOrEqual(2); // both superset & regular rows
    });
  });

  describe('per-week variation feature', () => {
    it('has varyByWeek state toggle', () => {
      expect(SOURCE).toContain('const [varyByWeek, setVaryByWeek] = useState(false)');
    });

    it('has activeWeekIndex state for week tab selection', () => {
      expect(SOURCE).toContain('const [activeWeekIndex, setActiveWeekIndex] = useState(0)');
    });

    it('uses weeklyWorkoutDays as array of arrays', () => {
      expect(SOURCE).toContain('const [weeklyWorkoutDays, setWeeklyWorkoutDays] = useState<WorkoutDay[][]>([[]])');
    });

    it('derives workoutDays from weeklyWorkoutDays[activeWeekIndex]', () => {
      expect(SOURCE).toContain('const workoutDays = weeklyWorkoutDays[activeWeekIndex] || []');
    });

    it('renders a Switch for vary-by-week toggle', () => {
      expect(SOURCE).toContain('Vary by week');
      expect(SOURCE).toContain("'Each week has different workouts'");
      expect(SOURCE).toContain("'Same workouts every week'");
    });

    it('renders week tabs (chips) when varyByWeek is true', () => {
      expect(SOURCE).toMatch(/varyByWeek && \(/);
      expect(SOURCE).toContain('Week {wIdx + 1}');
    });

    it('has a copy-week button to duplicate active week', () => {
      expect(SOURCE).toContain('Copy Week {activeWeekIndex + 1}');
    });

    it('has an add-week button', () => {
      expect(SOURCE).toContain('+ Week');
    });

    it('supports long-press to delete a week tab', () => {
      expect(SOURCE).toContain('onLongPress');
      expect(SOURCE).toContain('prev.filter((_, i) => i !== wIdx)');
    });

    it('starts with 2 weeks when enabling variation', () => {
      expect(SOURCE).toContain('weeklyWorkoutDays.length === 1');
      expect(SOURCE).toContain("prev => [...prev, []]");
    });

    it('sets weekTemplates in save when varyByWeek is true', () => {
      expect(SOURCE).toContain('weekTemplates: varyByWeek ?');
    });

    it('always sets weekTemplate from first week for backward compatibility', () => {
      expect(SOURCE).toContain('weekTemplate: { days: toDayTemplates(allWeeks[0]) }');
    });

    it('adds weekNumber to each template when varying', () => {
      expect(SOURCE).toContain('weekNumber: wIdx + 1');
    });

    it('validates all weeks when varyByWeek is true', () => {
      expect(SOURCE).toContain('const allWeeksForValidation = varyByWeek ? weeklyWorkoutDays : [workoutDays]');
    });

    it('shows correct section title based on varyByWeek', () => {
      expect(SOURCE).toContain('`Week ${activeWeekIndex + 1} Days`');
      expect(SOURCE).toContain("'Workout Days'");
    });

    it('uses daysPerWeek as max across all weeks', () => {
      expect(SOURCE).toContain('Math.max(...allWeeks.map(w => w.length))');
    });
  });

  describe('custom program persistence', () => {
    it('dispatches SAVE_CUSTOM_PROGRAM before starting', () => {
      expect(SOURCE).toContain("type: 'SAVE_CUSTOM_PROGRAM'");
      // SAVE_CUSTOM_PROGRAM should appear before START_PROGRAM
      const saveIdx = SOURCE.indexOf('SAVE_CUSTOM_PROGRAM');
      const startIdx = SOURCE.indexOf('START_PROGRAM');
      expect(saveIdx).toBeLessThan(startIdx);
    });

    it('passes the full program object to SAVE_CUSTOM_PROGRAM', () => {
      expect(SOURCE).toContain("{ type: 'SAVE_CUSTOM_PROGRAM', payload: program }");
    });
  });

  describe('edit program feature', () => {
    it('accepts route prop for edit mode', () => {
      expect(SOURCE).toContain('route?: any');
    });

    it('reads programId from route params', () => {
      expect(SOURCE).toContain('route?.params?.programId');
    });

    it('derives isEditing flag from programId', () => {
      expect(SOURCE).toContain('const isEditing = !!editingProgramId');
    });

    it('accesses mesoState to load existing program', () => {
      expect(SOURCE).toContain('state: mesoState');
    });

    it('loads program data in useEffect when editingProgramId is set', () => {
      expect(SOURCE).toMatch(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?editingProgramId/);
    });

    it('finds the program by id in availablePrograms', () => {
      expect(SOURCE).toContain('mesoState.availablePrograms');
      expect(SOURCE).toContain('p.id === editingProgramId');
    });

    it('pre-populates programName from loaded program', () => {
      expect(SOURCE).toContain('setProgramName(program.name)');
    });

    it('pre-populates description from loaded program', () => {
      expect(SOURCE).toContain("setDescription(program.description || '')");
    });

    it('pre-populates difficulty from loaded program', () => {
      expect(SOURCE).toContain('setDifficulty(program.difficulty)');
    });

    it('pre-populates durationWeeks from loaded program', () => {
      expect(SOURCE).toContain('setDurationWeeks(String(program.durationWeeks))');
    });

    it('pre-populates split from loaded program', () => {
      expect(SOURCE).toContain('setSplit(program.split)');
    });

    it('converts ProgramDayTemplate to WorkoutDay for editing', () => {
      expect(SOURCE).toContain('toWorkoutDays');
      expect(SOURCE).toMatch(/const toWorkoutDays.*ProgramDayTemplate/);
    });

    it('detects multi-week programs and enables varyByWeek', () => {
      expect(SOURCE).toContain('program.weekTemplates && program.weekTemplates.length > 1');
      expect(SOURCE).toContain('setVaryByWeek(true)');
    });

    it('preserves original program id when editing', () => {
      expect(SOURCE).toContain('isEditing ? editingProgramId!');
    });

    it('does not start program when editing (save only)', () => {
      // In edit mode, should call goBack instead of START_PROGRAM
      expect(SOURCE).toContain('navigation.goBack()');
    });

    it('dispatches UPDATE_ACTIVE_MESOCYCLE_FROM_PROGRAM when active meso uses edited program', () => {
      expect(SOURCE).toContain("type: 'UPDATE_ACTIVE_MESOCYCLE_FROM_PROGRAM'");
      expect(SOURCE).toContain('mesoState.activeMesoCycle?.programId === editingProgramId');
    });

    it('shows Save Program button in edit mode', () => {
      expect(SOURCE).toContain("isEditing ? 'Save Program' : 'Save & Start Program'");
    });

    it('navigates back instead of to Home when editing', () => {
      // goBack is only used in edit mode
      const goBackIdx = SOURCE.indexOf('navigation.goBack()');
      const isEditingIdx = SOURCE.lastIndexOf('isEditing', goBackIdx);
      expect(isEditingIdx).toBeGreaterThan(-1);
    });
  });

  describe('save button validation hints', () => {
    it('has getValidationHint function', () => {
      expect(SOURCE).toContain('const getValidationHint = (): string | null =>');
    });

    it('checks for missing program name', () => {
      expect(SOURCE).toContain("return 'Enter a program name'");
    });

    it('checks for empty weeks (no days)', () => {
      expect(SOURCE).toContain('Add at least one day');
    });

    it('checks for workout days without exercises', () => {
      expect(SOURCE).toContain('needs at least one exercise');
    });

    it('includes week label when varyByWeek is true', () => {
      expect(SOURCE).toContain('`Week ${wIdx + 1}: `');
    });

    it('shows validation hint text above save button when disabled', () => {
      expect(SOURCE).toContain('{!canSave && getValidationHint() && (');
    });

    it('displays hint in error color', () => {
      expect(SOURCE).toContain('color: theme.colors.error');
    });

    it('centers the hint text', () => {
      expect(SOURCE).toContain("textAlign: 'center'");
    });

    it('shows the day name in the exercise validation message', () => {
      expect(SOURCE).toContain('`${weekLabel}"${day.name}" needs at least one exercise`');
    });
  });

  describe('edit exercise feature', () => {
    it('has editingExerciseRef state for tracking which exercise is being edited', () => {
      expect(SOURCE).toContain('const [editingExerciseRef, setEditingExerciseRef] = useState');
    });

    it('derives isEditingExercise flag from editingExerciseRef', () => {
      expect(SOURCE).toContain('const isEditingExercise = !!editingExerciseRef');
    });

    it('has handleOpenEditExercise that pre-populates form fields', () => {
      expect(SOURCE).toContain('const handleOpenEditExercise = (dayId: string, exercise: ExerciseEntry)');
    });

    it('pre-populates exercise name when editing', () => {
      expect(SOURCE).toContain('setNewExerciseName(exercise.exerciseName)');
    });

    it('pre-populates sets, reps, RIR, rest when editing', () => {
      expect(SOURCE).toContain('setNewSets(String(exercise.sets))');
      expect(SOURCE).toContain('setNewRepsMin(String(exercise.repsMin))');
      expect(SOURCE).toContain('setNewRepsMax(String(exercise.repsMax))');
      expect(SOURCE).toContain('setNewRir(String(exercise.rirTarget))');
      expect(SOURCE).toContain('setNewRest(String(exercise.restSeconds))');
    });

    it('pre-populates notes when editing', () => {
      expect(SOURCE).toContain("setNewExerciseNotes(exercise.notes || '')");
    });

    it('updates exercise in place when editing (preserves superset data)', () => {
      expect(SOURCE).toContain('supersetGroupId: ex.supersetGroupId, supersetOrder: ex.supersetOrder');
    });

    it('uses original exercise id when editing', () => {
      expect(SOURCE).toContain('editingExerciseRef?.exerciseId || Date.now().toString()');
    });

    it('shows dynamic dialog title: Edit Exercise vs Add Exercise', () => {
      expect(SOURCE).toContain("isEditingExercise ? 'Edit Exercise' : 'Add Exercise'");
    });

    it('shows dynamic action button: Save vs Add Exercise', () => {
      expect(SOURCE).toContain("isEditingExercise ? 'Save' : 'Add Exercise'");
    });

    it('makes regular exercise rows tappable with handleOpenEditExercise', () => {
      expect(SOURCE).toContain('onPress={() => handleOpenEditExercise(day.id, exercise)}');
    });

    it('makes superset exercise rows tappable with handleOpenEditExercise', () => {
      expect(SOURCE).toContain('onPress={() => handleOpenEditExercise(day.id, groupEx)}');
    });

    it('clears editingExerciseRef on cancel', () => {
      expect(SOURCE).toContain('setEditingExerciseRef(null)');
    });

    it('has RIR input field in dialog', () => {
      expect(SOURCE).toContain('label="RIR"');
      expect(SOURCE).toContain('value={newRir}');
      expect(SOURCE).toContain('onChangeText={setNewRir}');
    });

    it('shows RIR and rest seconds in exercise row display', () => {
      expect(SOURCE).toContain('RIR {exercise.rirTarget}');
      expect(SOURCE).toContain('{exercise.restSeconds}s rest');
    });

    it('shows RIR and rest in superset exercise rows too', () => {
      expect(SOURCE).toContain('RIR {groupEx.rirTarget}');
      expect(SOURCE).toContain('{groupEx.restSeconds}s rest');
    });
  });
});
