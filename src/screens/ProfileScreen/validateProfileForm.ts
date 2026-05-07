// validateProfileForm — pure validation for the body-metrics fields.
//
// Why a separate module:
//   • The validation logic should be unit-testable without rendering the
//     form, and it should not be duplicated between the section that
//     renders the inline error and the parent that triggers it on save.
//   • Bounds are unit-aware (lbs vs kg, in vs cm). The conversion lives
//     here so callers don't have to think about it.
//
// Pattern (mirrors LoginScreen polish):
//   • The Save button is NEVER disabled — the user can always TRY to
//     save. If validation fails, errors surface in the form.
//   • Errors are returned as a `{ field: message }` map, which is empty
//     when the form is valid. Callers can check `Object.keys(errors).length === 0`.
//   • Empty optional fields (bodyFat, bmrOverride) are NOT errors —
//     only validate when the user has typed something.

export interface ProfileFormValidatableValues {
  weight: string;
  height: string;
  age: string;
  bodyFat: string;
  bmrOverride: string;
}

export type ProfileFormErrors = Partial<{
  weight: string;
  height: string;
  age: string;
  bodyFat: string;
  bmrOverride: string;
}>;

// ─── Bounds (display values, in the user's chosen unit) ────────────────
// Imperial defaults; metric thresholds are derived per-field below.

const WEIGHT_MIN_LBS = 60;
const WEIGHT_MAX_LBS = 700;
const WEIGHT_MIN_KG = 27;
const WEIGHT_MAX_KG = 320;

const HEIGHT_MIN_IN = 36;
const HEIGHT_MAX_IN = 96;
const HEIGHT_MIN_CM = 90;
const HEIGHT_MAX_CM = 245;

const AGE_MIN = 12;
const AGE_MAX = 110;

const BODY_FAT_MIN = 3;
const BODY_FAT_MAX = 60;

const BMR_MIN = 800;
const BMR_MAX = 5000;

// ─── Helpers ───────────────────────────────────────────────────────────

/** Parse a numeric string. Returns NaN for empty / non-numeric input. */
function parseNum(v: string): number {
  const trimmed = v.trim();
  if (trimmed === '') return NaN;
  return Number(trimmed);
}

/** Human-readable range string used in error messages. */
function rangeText(min: number, max: number, unit: string): string {
  return `${min}–${max} ${unit}`.trim();
}

// ─── Public validator ──────────────────────────────────────────────────

export function validateBodyMetrics(
  values: ProfileFormValidatableValues,
  useMetric: boolean,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  // Weight (required)
  const weight = parseNum(values.weight);
  const weightMin = useMetric ? WEIGHT_MIN_KG : WEIGHT_MIN_LBS;
  const weightMax = useMetric ? WEIGHT_MAX_KG : WEIGHT_MAX_LBS;
  const weightUnit = useMetric ? 'kg' : 'lbs';
  if (values.weight.trim() === '') {
    errors.weight = 'Weight is required.';
  } else if (Number.isNaN(weight)) {
    errors.weight = 'Enter a number.';
  } else if (weight < weightMin || weight > weightMax) {
    errors.weight = `Enter a weight between ${rangeText(
      weightMin,
      weightMax,
      weightUnit,
    )}.`;
  }

  // Height (required)
  const height = parseNum(values.height);
  const heightMin = useMetric ? HEIGHT_MIN_CM : HEIGHT_MIN_IN;
  const heightMax = useMetric ? HEIGHT_MAX_CM : HEIGHT_MAX_IN;
  const heightUnit = useMetric ? 'cm' : 'in';
  if (values.height.trim() === '') {
    errors.height = 'Height is required.';
  } else if (Number.isNaN(height)) {
    errors.height = 'Enter a number.';
  } else if (height < heightMin || height > heightMax) {
    errors.height = `Enter a height between ${rangeText(
      heightMin,
      heightMax,
      heightUnit,
    )}.`;
  }

  // Age (required)
  const age = parseNum(values.age);
  if (values.age.trim() === '') {
    errors.age = 'Age is required.';
  } else if (Number.isNaN(age)) {
    errors.age = 'Enter a whole number.';
  } else if (age < AGE_MIN || age > AGE_MAX) {
    errors.age = `Enter an age between ${AGE_MIN} and ${AGE_MAX}.`;
  }

  // Body fat (optional — only validate non-empty)
  if (values.bodyFat.trim() !== '') {
    const bf = parseNum(values.bodyFat);
    if (Number.isNaN(bf)) {
      errors.bodyFat = 'Enter a number.';
    } else if (bf < BODY_FAT_MIN || bf > BODY_FAT_MAX) {
      errors.bodyFat = `Enter a body fat % between ${BODY_FAT_MIN} and ${BODY_FAT_MAX}.`;
    }
  }

  // BMR override (optional — only validate non-empty)
  if (values.bmrOverride.trim() !== '') {
    const bmr = parseNum(values.bmrOverride);
    if (Number.isNaN(bmr)) {
      errors.bmrOverride = 'Enter a number.';
    } else if (bmr < BMR_MIN || bmr > BMR_MAX) {
      errors.bmrOverride = `Enter a BMR between ${BMR_MIN} and ${BMR_MAX} kcal/day.`;
    }
  }

  return errors;
}

/** Convenience for callers — true when no field has an error. */
export function isProfileFormValid(errors: ProfileFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
