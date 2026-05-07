// Profile Screen
// User metrics and fitness profile.
//
// Architecture:
//   • `ProfileScreen` (default export) — thin wrapper that re-keys the
//     form on `profile.id` so user-identity switches produce a clean
//     remount with fresh seed values (avoids overwriting unsaved input).
//   • `ProfileFormSection` — owns the form state via `useProfileForm()`,
//     wires the Save handler, and distributes slices to sub-components.
//   • Section components in `./sections/` — each is a pure function of
//     its props (with one or two narrow context calls noted in their
//     headers when prop-drilling adds nothing).

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Snackbar, Surface, Portal, useTheme } from 'react-native-paper';
import { useUser, useWorkout } from '../../context';
import { FEATURE_FLAGS } from '../../config/featureFlags';
import { EXERCISE_LIBRARY } from '../../services/db/exerciseLibrary';
import { spacing, borderRadius, withAlpha } from '../../theme';
import type { TabScreenProps } from '../../navigation';
import { useProfileForm } from './useProfileForm';
import { useWorkoutStats } from './useWorkoutStats';
import {
  validateBodyMetrics,
  isProfileFormValid,
  type ProfileFormErrors,
} from './validateProfileForm';
import {
  AccountSection,
  ActivityAndGoalsSection,
  AddOneRepMaxDialog,
  AppSettingsSection,
  BodyMetricsForm,
  DevToolsCard,
  NutritionTargetsCard,
  OneRepMaxSection,
  ProfileHeader,
  TrainingExperienceSection,
} from './sections';
import type { OneRepMaxDraft } from './sections';

const SAVE_BAR_BORDER_ALPHA = 0.15;
const SNACKBAR_DURATION_MS = 5_000;

type ProfileNavigation = TabScreenProps<'Profile'>['navigation'];

interface ProfileScreenProps {
  // Reserved for future navigation actions (e.g. drilling into a record).
  // Currently unused but kept in the prop shape so wiring lives in one place.
  navigation: ProfileNavigation;
}

/**
 * Outer screen — keyed wrapper that remounts the form on user-identity
 * change so unsaved local form input is never silently overwritten by a
 * background profile sync. Lazy-init inside `useProfileForm` handles
 * initial seeding without a useEffect.
 */
export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { state: userState } = useUser();
  return (
    <ProfileFormSection
      key={userState.profile?.id ?? 'no-profile'}
      navigation={navigation}
    />
  );
}

function ProfileFormSection(_props: ProfileScreenProps) {
  const theme = useTheme();
  const { state: userState, updateProfile, addOneRepMax, deleteOneRepMax } =
    useUser();
  const { state: workoutState } = useWorkout();
  const stats = useWorkoutStats(workoutState.workoutHistory);

  const form = useProfileForm(userState.profile);
  const [show1RMDialog, setShow1RMDialog] = useState(false);
  // Validation errors are populated on Save attempt — never as the user
  // types — so we don't bark at them mid-input. They clear on next Save.
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    const validationErrors = validateBodyMetrics(
      {
        weight: form.bodyMetrics.weight,
        height: form.bodyMetrics.height,
        age: form.bodyMetrics.age,
        bodyFat: form.bodyMetrics.bodyFat,
        bmrOverride: form.bodyMetrics.bmrOverride,
      },
      form.units.useMetric,
    );
    if (!isProfileFormValid(validationErrors)) {
      setErrors(validationErrors);
      setSaveError(
        'Please fix the highlighted fields before saving.',
      );
      return;
    }
    setErrors({});
    const values = form.getValues();
    await updateProfile(values);
  };

  const handleSave1RM = (draft: OneRepMaxDraft) => {
    addOneRepMax(
      draft.exerciseName,
      draft.weight,
      draft.method,
      undefined,
      draft.unit,
    );
    setShow1RMDialog(false);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ProfileHeader
        identity={form.identity}
        stats={stats}
        weightUnit={form.units.weightUnit}
      />

      <BodyMetricsForm bodyMetrics={form.bodyMetrics} errors={errors} />

      <OneRepMaxSection
        records={userState.oneRepMaxRecords}
        onAdd={() => setShow1RMDialog(true)}
        onDelete={deleteOneRepMax}
      />

      <ActivityAndGoalsSection
        activity={form.activity}
        goals={form.goals}
      />

      {userState.nutrition && (
        <NutritionTargetsCard
          nutrition={userState.nutrition}
          hasBmrOverride={!!form.bodyMetrics.bmrOverride}
        />
      )}

      <TrainingExperienceSection training={form.training} />

      {FEATURE_FLAGS.authAndAccount && <AccountSection />}

      <AppSettingsSection units={form.units} />

      {/* TODO(profile-save-ux): consider promoting Save to a sticky footer
          that appears only when the form is dirty. Skipped for this pass
          (>30 min lift; needs dirty-tracking inside useProfileForm). */}
      <Surface
        style={[
          styles.saveBar,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: withAlpha(
              theme.colors.outline,
              SAVE_BAR_BORDER_ALPHA,
            ),
          },
        ]}
        elevation={0}
      >
        <Button mode="contained" onPress={handleSave}>
          Save Profile
        </Button>
      </Surface>

      {__DEV__ && (
        <View style={styles.devSpacing}>
          <DevToolsCard />
        </View>
      )}

      <AddOneRepMaxDialog
        visible={show1RMDialog}
        onDismiss={() => setShow1RMDialog(false)}
        onSave={handleSave1RM}
        exercises={EXERCISE_LIBRARY}
        weightUnit={form.units.weightUnit}
      />

      {/* Save-error toast lives in a Portal so it pins to the screen's
          safe-area bottom instead of sitting inside the ScrollView,
          where it could land off-screen. */}
      <Portal>
        <Snackbar
          visible={!!saveError}
          onDismiss={() => setSaveError(null)}
          duration={SNACKBAR_DURATION_MS}
          action={{ label: 'OK', onPress: () => setSaveError(null) }}
        >
          {saveError ?? ''}
        </Snackbar>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  saveBar: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderTopWidth: 1,
    borderRadius: borderRadius.md,
  },
  devSpacing: {
    marginTop: spacing.md,
  },
});

export default ProfileScreen;
