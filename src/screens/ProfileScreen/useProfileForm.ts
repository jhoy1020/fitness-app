// useProfileForm — owns ALL profile-form state for ProfileScreen.
//
// Consolidates the 14 individual `useState` calls that previously lived on
// the ProfileFormSection component into one hook so that:
//   1) Sub-components can take only the slice they need (narrow API).
//   2) The seeding pattern (lazy-init from a snapshot captured once via
//      `useRef`) lives next to the state it seeds, not scattered.
//   3) The save handler (in the parent) can read the whole form by calling
//      `getValues()` — no prop-drilling 14 setters back up.
//
// Identity changes are handled by `key={profile?.id}` on the consumer; this
// hook does not watch `profile` for changes, by design.

import { useRef, useState } from 'react';
import type {
  ActivityLevel,
  GoalType,
  TrainingExperience,
  UserProfile,
} from '../../types';

// ─── Form-state shape (pure, used by deriveFormState + the hook) ────────

export interface ProfileFormInitialState {
  name: string;
  weight: string;
  height: string;
  age: string;
  bodyFat: string;
  leanMass: string;
  bmrOverride: string;
  goalBodyFat: string;
  goalWeight: string;
  gender: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  goalType: GoalType;
  trainingExperience: TrainingExperience;
  useMetric: boolean;
}

const DEFAULT_GENDER: ProfileFormInitialState['gender'] = 'male';
const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = 'moderate';
const DEFAULT_GOAL_TYPE: GoalType = 'maintain';
const DEFAULT_TRAINING_EXPERIENCE: TrainingExperience = 'intermediate';

export function deriveFormState(
  profile: UserProfile | null,
): ProfileFormInitialState {
  if (!profile) {
    return {
      name: '',
      weight: '',
      height: '',
      age: '',
      bodyFat: '',
      leanMass: '',
      bmrOverride: '',
      goalBodyFat: '',
      goalWeight: '',
      gender: DEFAULT_GENDER,
      activityLevel: DEFAULT_ACTIVITY_LEVEL,
      goalType: DEFAULT_GOAL_TYPE,
      trainingExperience: DEFAULT_TRAINING_EXPERIENCE,
      useMetric: false,
    };
  }
  return {
    name: profile.name ?? '',
    weight: profile.weight.toString(),
    height: profile.height.toString(),
    age: profile.age.toString(),
    bodyFat: profile.bodyFatPercent?.toString() ?? '',
    leanMass: profile.leanMass?.toString() ?? '',
    bmrOverride: profile.bmrOverride?.toString() ?? '',
    goalBodyFat: profile.goalBodyFatPercent?.toString() ?? '',
    goalWeight: profile.goalWeight?.toString() ?? '',
    gender: profile.gender,
    activityLevel: profile.activityLevel,
    goalType: profile.goalType,
    trainingExperience:
      profile.trainingExperience ?? DEFAULT_TRAINING_EXPERIENCE,
    useMetric: profile.weightUnit === 'kg',
  };
}

// ─── Returned slices ─────────────────────────────────────────────────────

export interface IdentitySlice {
  name: string;
  setName: (v: string) => void;
}

export interface BodyMetricsSlice {
  weight: string;
  setWeight: (v: string) => void;
  height: string;
  setHeight: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  bodyFat: string;
  setBodyFat: (v: string) => void;
  bmrOverride: string;
  setBmrOverride: (v: string) => void;
  gender: 'male' | 'female' | 'other';
  setGender: (v: 'male' | 'female' | 'other') => void;
  weightUnit: 'lbs' | 'kg';
  heightUnit: 'in' | 'cm';
}

export interface GoalsSlice {
  goalType: GoalType;
  setGoalType: (v: GoalType) => void;
  goalWeight: string;
  setGoalWeight: (v: string) => void;
  goalBodyFat: string;
  setGoalBodyFat: (v: string) => void;
  weightUnit: 'lbs' | 'kg';
}

export interface ActivitySlice {
  activityLevel: ActivityLevel;
  setActivityLevel: (v: ActivityLevel) => void;
}

export interface TrainingSlice {
  trainingExperience: TrainingExperience;
  setTrainingExperience: (v: TrainingExperience) => void;
}

export interface UnitsSlice {
  useMetric: boolean;
  setUseMetric: (v: boolean) => void;
  weightUnit: 'lbs' | 'kg';
  heightUnit: 'in' | 'cm';
}

// Shape consumed by `updateProfile()` — the union of every form field,
// already parsed and ready to send.
export interface ProfileFormValues {
  name: string;
  weight: number;
  height: number;
  age: number;
  bodyFatPercent: number | undefined;
  leanMass: number | undefined;
  bmrOverride: number | undefined;
  goalBodyFatPercent: number | undefined;
  goalWeight: number | undefined;
  gender: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  goalType: GoalType;
  trainingExperience: TrainingExperience;
  weightUnit: 'lbs' | 'kg';
  heightUnit: 'in' | 'cm';
}

export interface UseProfileFormResult {
  identity: IdentitySlice;
  bodyMetrics: BodyMetricsSlice;
  goals: GoalsSlice;
  activity: ActivitySlice;
  training: TrainingSlice;
  units: UnitsSlice;
  /** Snapshot of all form fields, parsed and typed for `updateProfile()`. */
  getValues: () => ProfileFormValues;
}

// ─── The hook ────────────────────────────────────────────────────────────

const RADIX_DECIMAL = 10;

const toNumber = (v: string): number => parseFloat(v) || 0;
const toInt = (v: string): number => parseInt(v, RADIX_DECIMAL) || 0;
const toOptionalNumber = (v: string): number | undefined =>
  v ? parseFloat(v) : undefined;

export function useProfileForm(
  profile: UserProfile | null,
): UseProfileFormResult {
  // Lazy-init from a snapshot captured once. The `useRef` holds the seed
  // object so all 14 useState lazy initialisers below pull from the same
  // snapshot — even if `profile` mutates during this render, every field
  // sees a consistent starting point. The parent re-keys this hook's
  // consumer on `profile.id` change for real identity switches.
  const initialFormState = useRef<ProfileFormInitialState | null>(null);
  if (initialFormState.current === null) {
    initialFormState.current = deriveFormState(profile);
  }
  const seed = initialFormState.current;

  const [name, setName] = useState(seed.name);
  const [weight, setWeight] = useState(seed.weight);
  const [height, setHeight] = useState(seed.height);
  const [age, setAge] = useState(seed.age);
  const [bodyFat, setBodyFat] = useState(seed.bodyFat);
  // leanMass is stored but not currently surfaced as a form field — kept
  // here so future re-introduction doesn't change the hook's shape.
  const [leanMass] = useState(seed.leanMass);
  const [bmrOverride, setBmrOverride] = useState(seed.bmrOverride);
  const [goalBodyFat, setGoalBodyFat] = useState(seed.goalBodyFat);
  const [goalWeight, setGoalWeight] = useState(seed.goalWeight);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    seed.gender,
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    seed.activityLevel,
  );
  const [goalType, setGoalType] = useState<GoalType>(seed.goalType);
  const [useMetric, setUseMetric] = useState(seed.useMetric);
  const [trainingExperience, setTrainingExperience] =
    useState<TrainingExperience>(seed.trainingExperience);

  const weightUnit: 'lbs' | 'kg' = useMetric ? 'kg' : 'lbs';
  const heightUnit: 'in' | 'cm' = useMetric ? 'cm' : 'in';

  const getValues = (): ProfileFormValues => ({
    name,
    weight: toNumber(weight),
    height: toNumber(height),
    age: toInt(age),
    bodyFatPercent: toOptionalNumber(bodyFat),
    leanMass: toOptionalNumber(leanMass),
    bmrOverride: toOptionalNumber(bmrOverride),
    goalBodyFatPercent: toOptionalNumber(goalBodyFat),
    goalWeight: toOptionalNumber(goalWeight),
    gender,
    activityLevel,
    goalType,
    trainingExperience,
    weightUnit,
    heightUnit,
  });

  return {
    identity: { name, setName },
    bodyMetrics: {
      weight,
      setWeight,
      height,
      setHeight,
      age,
      setAge,
      bodyFat,
      setBodyFat,
      bmrOverride,
      setBmrOverride,
      gender,
      setGender,
      weightUnit,
      heightUnit,
    },
    goals: {
      goalType,
      setGoalType,
      goalWeight,
      setGoalWeight,
      goalBodyFat,
      setGoalBodyFat,
      weightUnit,
    },
    activity: { activityLevel, setActivityLevel },
    training: { trainingExperience, setTrainingExperience },
    units: { useMetric, setUseMetric, weightUnit, heightUnit },
    getValues,
  };
}
