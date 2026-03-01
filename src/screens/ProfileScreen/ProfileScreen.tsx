// Profile Screen
// User metrics and fitness profile

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Surface, useTheme, Divider, Switch, Portal, Dialog, Searchbar } from 'react-native-paper';
import { useUser, useWorkout, useThemeMode } from '../../context';
import { ProgressBar, InfoTooltip, ABBREVIATIONS } from '../../components';
import { soundService } from '../../services/SoundService/SoundService';
import { EXERCISE_LIBRARY } from '../../services/db/exerciseLibrary';
import { calculate1RM_Epley } from '../../utils/formulas/formulas';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { withAlpha } from '../../theme';
import { AppIcons } from '../../theme/icons';
import type { ActivityLevel, GoalType, OneRepMaxRecord } from '../../types';

interface ProfileScreenProps {
  navigation: any;
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const theme = useTheme();
  const { state: userState, updateProfile, addOneRepMax, deleteOneRepMax, getOneRepMax } = useUser();
  const { state: workoutState } = useWorkout();
  const { isDark, toggleTheme } = useThemeMode();
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());

  // 1RM dialog state
  const [show1RMDialog, setShow1RMDialog] = useState(false);
  const [orm1RMSearch, setOrm1RMSearch] = useState('');
  const [orm1RMExercise, setOrm1RMExercise] = useState('');
  const [orm1RMWeight, setOrm1RMWeight] = useState('');
  const [orm1RMReps, setOrm1RMReps] = useState('1');
  const [orm1RMMethod, setOrm1RMMethod] = useState<'tested' | 'calculated'>('tested');
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [leanMass, setLeanMass] = useState('');
  const [bmrOverride, setBmrOverride] = useState('');
  const [goalBodyFat, setGoalBodyFat] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [useMetric, setUseMetric] = useState(false);
  const [trainingExperience, setTrainingExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // Derived units from useMetric toggle
  const weightUnit = useMetric ? 'kg' : 'lbs';
  const heightUnit = useMetric ? 'cm' : 'in';

  // Calculate workout stats
  const workoutStats = useMemo(() => {
    const history = workoutState.workoutHistory || [];
    const totalWorkouts = history.length;
    const totalSets = history.reduce((sum, w) => sum + ((w as any).sets?.length || 0), 0);
    const totalVolume = history.reduce((sum, w) => {
      return sum + ((w as any).sets?.reduce((setSum: number, s: any) => setSum + (s.weight || 0) * (s.reps || 0), 0) || 0);
    }, 0);
    
    // Calculate streak
    let streak = 0;
    const now = new Date();
    const sortedDates = history
      .map(w => new Date(w.completedAt || w.createdAt || w.date).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      if (sortedDates.includes(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // This week's workouts
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekWorkouts = history.filter(w => 
      new Date(w.completedAt || w.createdAt || w.date) >= weekStart
    ).length;

    return { totalWorkouts, totalSets, totalVolume, streak, thisWeekWorkouts };
  }, [workoutState.workoutHistory]);

  useEffect(() => {
    if (userState.profile) {
      setName((userState.profile as any).name || '');
      setWeight(userState.profile.weight.toString());
      setHeight(userState.profile.height.toString());
      setAge(userState.profile.age.toString());
      setBodyFat(userState.profile.bodyFatPercent?.toString() || '');
      setLeanMass(userState.profile.leanMass?.toString() || '');
      setBmrOverride(userState.profile.bmrOverride?.toString() || '');
      setGoalBodyFat(userState.profile.goalBodyFatPercent?.toString() || '');
      setGoalWeight((userState.profile as any).goalWeight?.toString() || '');
      setGender(userState.profile.gender);
      setActivityLevel(userState.profile.activityLevel);
      setGoalType(userState.profile.goalType);
      setTrainingExperience((userState.profile as any).trainingExperience || 'intermediate');
      setUseMetric(userState.profile.weightUnit === 'kg');
    }
  }, [userState.profile]);

  const handleSave = async () => {
    await updateProfile({
      name,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      age: parseInt(age, 10) || 0,
      bodyFatPercent: bodyFat ? parseFloat(bodyFat) : undefined,
      leanMass: leanMass ? parseFloat(leanMass) : undefined,
      bmrOverride: bmrOverride ? parseFloat(bmrOverride) : undefined,
      goalBodyFatPercent: goalBodyFat ? parseFloat(goalBodyFat) : undefined,
      goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
      gender,
      activityLevel,
      goalType,
      trainingExperience,
      weightUnit,
      heightUnit,
    } as any);
  };

  // Calculate lean mass from weight and body fat if not manually entered
  const calculatedLeanMass = weight && bodyFat 
    ? (parseFloat(weight) * (1 - parseFloat(bodyFat) / 100)).toFixed(1)
    : null;

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'active', label: 'Active' },
    { value: 'very_active', label: 'Very Active' },
  ];

  return (
    <ScrollView 
      style={{ backgroundColor: theme.colors.background }} 
      contentContainerStyle={styles.container}
    >
      {/* Profile Header with Stats */}
      <Surface style={styles.card} elevation={1}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>{name ? name.charAt(0).toUpperCase() : <MaterialCommunityIcons name={AppIcons.profile} size={28} color={theme.colors.onPrimary} />}</Text>
          </View>
          <View style={styles.profileInfo}>
            <TextInput
              mode="flat"
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={styles.nameInput}
            />
          </View>
        </View>
        
        {/* Quick Stats Row */}
        <View style={[styles.quickStats, { borderTopColor: withAlpha(theme.colors.outline, 0.2) }]}>
          <View style={styles.quickStatItem}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>{workoutStats.totalWorkouts}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Workouts</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>{workoutStats.streak}<MaterialCommunityIcons name={AppIcons.warmup} size={20} color={theme.colors.primary} /></Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Day Streak</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>{workoutStats.thisWeekWorkouts}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>This Week</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {workoutStats.totalVolume > 1000000 
                ? `${(workoutStats.totalVolume / 1000000).toFixed(1)}M` 
                : workoutStats.totalVolume > 1000 
                  ? `${(workoutStats.totalVolume / 1000).toFixed(0)}K`
                  : workoutStats.totalVolume}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Total {weightUnit}</Text>
          </View>
        </View>
      </Surface>

      {/* Units Toggle */}
      <Surface style={styles.card} elevation={1}>
        <View style={styles.unitToggleRow}>
          <Text variant="titleMedium">Units</Text>
          <SegmentedButtons
            value={useMetric ? 'metric' : 'imperial'}
            onValueChange={(v) => setUseMetric(v === 'metric')}
            buttons={[
              { value: 'imperial', label: 'Imperial' },
              { value: 'metric', label: 'Metric' },
            ]}
            style={{ flex: 1, marginLeft: 16 }}
          />
        </View>
      </Surface>

      {/* App Settings */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyLarge"><MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={20} color={theme.colors.onSurface} /> Theme</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {isDark ? 'Dark mode' : 'Light mode'}
            </Text>
          </View>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
        
        <Divider style={{ marginVertical: 12 }} />
        
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyLarge">Sound Effects</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Timer alerts & feedback sounds
            </Text>
          </View>
          <Switch 
            value={soundEnabled} 
            onValueChange={(value) => {
              setSoundEnabled(value);
              soundService.setEnabled(value);
              if (value) soundService.playTap();
            }} 
          />
        </View>
      </Surface>

      {/* 1RM Records */}
      <Surface style={styles.card} elevation={1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="titleMedium">1RM Records</Text>
            <InfoTooltip {...ABBREVIATIONS['1RM']} />
          </View>
          <Button mode="contained-tonal" compact onPress={() => {
            setShow1RMDialog(true);
            setShowExerciseDropdown(false);
          }}>
            + Add 1RM
          </Button>
        </View>
        
        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12 }}>
          Track your one-rep max for key exercises. These values will be used to suggest weights during workouts.
        </Text>
        
        {userState.oneRepMaxRecords.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 16 }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: 'center' }}>
              No 1RM records yet. Add your tested or estimated one-rep max values.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {userState.oneRepMaxRecords.map((record) => (
              <View 
                key={record.id} 
                style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall">{record.exerciseName}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {record.method === 'tested' ? '✓ Tested' : 'Calculated'} • {new Date(record.testedDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                    {record.weight} {record.unit}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setDeleteConfirmRecord(record.id)}
                  style={{ marginLeft: 12, padding: 4 }}
                >
                  <MaterialCommunityIcons name={AppIcons.close} size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Surface>

      {/* Body Metrics */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Body Metrics</Text>

        <View style={styles.inputRow}>
          <TextInput
            mode="outlined"
            label={`Weight (${weightUnit})`}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            mode="outlined"
            label={`Height (${heightUnit})`}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            style={[styles.input, styles.halfInput]}
          />
        </View>

        <View style={styles.inputRow}>
          <TextInput
            mode="outlined"
            label="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            mode="outlined"
            label="Body Fat %"
            value={bodyFat}
            onChangeText={setBodyFat}
            keyboardType="decimal-pad"
            style={[styles.input, styles.halfInput]}
          />
        </View>

        <Text variant="labelLarge" style={styles.label}>Gender</Text>
        <SegmentedButtons
          value={gender}
          onValueChange={(v) => setGender(v as 'male' | 'female' | 'other')}
          buttons={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
          style={styles.segmented}
        />

        <Divider style={{ marginVertical: 16 }} />

        <Text variant="labelLarge" style={styles.label}>Measured BMR (Optional)</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 8 }}>
          If you know your BMR from a DEXA scan or metabolic test, enter it here to override the calculated value.
        </Text>
        <TextInput
          mode="outlined"
          label="BMR (calories/day)"
          value={bmrOverride}
          onChangeText={setBmrOverride}
          keyboardType="number-pad"
          placeholder="e.g., 1850"
          style={styles.input}
          right={bmrOverride ? <TextInput.Icon icon="close" onPress={() => setBmrOverride('')} /> : undefined}
        />
      </Surface>

      {/* Training Experience */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Training Experience</Text>
        <SegmentedButtons
          value={trainingExperience}
          onValueChange={(v) => setTrainingExperience(v as 'beginner' | 'intermediate' | 'advanced')}
          buttons={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' },
          ]}
          style={styles.segmented}
        />
        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 8 }}>
          {trainingExperience === 'beginner' && '< 1 year of consistent training'}
          {trainingExperience === 'intermediate' && '1-3 years of consistent training'}
          {trainingExperience === 'advanced' && '3+ years of consistent training'}
        </Text>
      </Surface>

      {/* Activity & Goals */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Activity & Goals</Text>

        <Text variant="labelLarge" style={styles.label}>Daily Activity Level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SegmentedButtons
            value={activityLevel}
            onValueChange={(v) => setActivityLevel(v as ActivityLevel)}
            buttons={activityOptions}
            style={styles.activityButtons}
          />
        </ScrollView>

        <Text variant="labelLarge" style={styles.label}>Current Goal</Text>
        <SegmentedButtons
          value={goalType}
          onValueChange={(v) => setGoalType(v as GoalType)}
          buttons={[
            { value: 'cut', label: 'Cut' },
            { value: 'maintain', label: 'Maintain' },
            { value: 'bulk', label: 'Bulk' },
          ]}
          style={styles.segmented}
        />

        <View style={styles.inputRow}>
          <TextInput
            mode="outlined"
            label={`Goal Weight (${weightUnit})`}
            value={goalWeight}
            onChangeText={setGoalWeight}
            keyboardType="decimal-pad"
            style={[styles.input, styles.halfInput]}
          />
          <TextInput
            mode="outlined"
            label="Goal Body Fat %"
            value={goalBodyFat}
            onChangeText={setGoalBodyFat}
            keyboardType="decimal-pad"
            style={[styles.input, styles.halfInput]}
          />
        </View>
      </Surface>

      {/* Calculated Results */}
      {userState.nutrition && (
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Your Daily Targets</Text>

          <View style={styles.resultsGrid}>
            <View style={styles.resultItem}>
              <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
                {userState.nutrition.bmr}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant="labelMedium">BMR {bmrOverride ? '✓' : ''}</Text>
                <InfoTooltip {...ABBREVIATIONS.BMR} />
              </View>
              {bmrOverride && (
                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>measured</Text>
              )}
            </View>
            <View style={styles.resultItem}>
              <Text variant="displaySmall" style={{ color: theme.colors.secondary }}>
                {userState.nutrition.tdee}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant="labelMedium">TDEE</Text>
                <InfoTooltip {...ABBREVIATIONS.TDEE} />
              </View>
            </View>
            <View style={styles.resultItem}>
              <Text variant="displaySmall" style={{ color: theme.colors.tertiary }}>
                {userState.nutrition.targetCalories}
              </Text>
              <Text variant="labelMedium">Target Calories</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.macroTitle}>Macro Breakdown</Text>
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <Text variant="headlineMedium">{userState.nutrition.protein}g</Text>
              <Text variant="labelSmall">Protein</Text>
              <ProgressBar
                progress={userState.nutrition.protein * 4 / userState.nutrition.targetCalories}
                color={theme.colors.primary}
                showPercentage={false}
              />
            </View>
            <View style={styles.macroItem}>
              <Text variant="headlineMedium">{userState.nutrition.carbs}g</Text>
              <Text variant="labelSmall">Carbs</Text>
              <ProgressBar
                progress={userState.nutrition.carbs * 4 / userState.nutrition.targetCalories}
                color={theme.colors.secondary}
                showPercentage={false}
              />
            </View>
            <View style={styles.macroItem}>
              <Text variant="headlineMedium">{userState.nutrition.fat}g</Text>
              <Text variant="labelSmall">Fat</Text>
              <ProgressBar
                progress={userState.nutrition.fat * 9 / userState.nutrition.targetCalories}
                color={theme.colors.tertiary}
                showPercentage={false}
              />
            </View>
          </View>

          {(userState.nutrition.deficit || userState.nutrition.surplus) && (
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 12, textAlign: 'center' }}>
              {userState.nutrition.deficit
                ? `Daily deficit: ${userState.nutrition.deficit} calories`
                : `Daily surplus: ${userState.nutrition.surplus} calories`}
            </Text>
          )}
        </Surface>
      )}

      <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
        Save Profile
      </Button>

      {/* Add 1RM Dialog */}
      <Portal>
        <Dialog visible={show1RMDialog} onDismiss={() => setShow1RMDialog(false)}>
          <Dialog.Title>Add 1RM Record</Dialog.Title>
          <Dialog.Content>
            <Searchbar
              placeholder="Search exercise..."
              value={orm1RMSearch}
              onChangeText={(text) => {
                setOrm1RMSearch(text);
                setOrm1RMExercise(text);
                setShowExerciseDropdown(true);
              }}
              onFocus={() => setShowExerciseDropdown(true)}
              style={{ marginBottom: 8 }}
            />
            
            {showExerciseDropdown && orm1RMSearch.length > 0 && (
              <View style={{ maxHeight: 120, marginBottom: 12 }}>
                <ScrollView nestedScrollEnabled>
                  {EXERCISE_LIBRARY
                    .filter(ex => ex.name.toLowerCase().includes(orm1RMSearch.toLowerCase()))
                    .slice(0, 5)
                    .map((ex, index) => (
                      <TouchableOpacity
                        key={`${ex.name}-${index}`}
                        onPress={() => {
                          setOrm1RMExercise(ex.name);
                          setOrm1RMSearch(ex.name);
                          setShowExerciseDropdown(false);
                        }}
                        style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}
                      >
                        <Text>{ex.name}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{ex.muscleGroup}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}
            
            <SegmentedButtons
              value={orm1RMMethod}
              onValueChange={(v) => setOrm1RMMethod(v as 'tested' | 'calculated')}
              buttons={[
                { value: 'tested', label: '✓ Tested 1RM' },
                { value: 'calculated', label: 'Calculate' },
              ]}
              style={{ marginBottom: 12 }}
            />
            
            {orm1RMMethod === 'tested' ? (
              <TextInput
                mode="outlined"
                label="1RM Weight (lbs)"
                value={orm1RMWeight}
                onChangeText={setOrm1RMWeight}
                keyboardType="numeric"
              />
            ) : (
              <View style={{ gap: 8 }}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Enter a recent set and we'll calculate your estimated 1RM
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    mode="outlined"
                    label="Weight (lbs)"
                    value={orm1RMWeight}
                    onChangeText={setOrm1RMWeight}
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    mode="outlined"
                    label="Reps"
                    value={orm1RMReps}
                    onChangeText={setOrm1RMReps}
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                  />
                </View>
                {orm1RMWeight && orm1RMReps && parseInt(orm1RMReps) > 1 && (
                  <Surface style={{ padding: 12, borderRadius: 8 }} elevation={1}>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Estimated 1RM:</Text>
                    <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                      {Math.round(calculate1RM_Epley(parseFloat(orm1RMWeight), parseInt(orm1RMReps)))} lbs
                    </Text>
                  </Surface>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShow1RMDialog(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={() => {
                if (orm1RMExercise && orm1RMWeight) {
                  let finalWeight = parseFloat(orm1RMWeight);
                  if (orm1RMMethod === 'calculated' && parseInt(orm1RMReps) > 1) {
                    finalWeight = Math.round(calculate1RM_Epley(parseFloat(orm1RMWeight), parseInt(orm1RMReps)));
                  }
                  addOneRepMax(orm1RMExercise, finalWeight, orm1RMMethod);
                  setShow1RMDialog(false);
                  setOrm1RMSearch('');
                  setOrm1RMExercise('');
                  setOrm1RMWeight('');
                  setOrm1RMReps('1');
                }
              }}
              disabled={!orm1RMExercise || !orm1RMWeight}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog visible={!!deleteConfirmRecord} onDismiss={() => setDeleteConfirmRecord(null)}>
          <Dialog.Title>Delete 1RM Record?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this 1RM record? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmRecord(null)}>Cancel</Button>
            <Button 
              textColor={theme.colors.error}
              onPress={() => {
                if (deleteConfirmRecord) {
                  deleteOneRepMax(deleteConfirmRecord);
                  setDeleteConfirmRecord(null);
                }
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    color: 'transparent',
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  nameInput: {
    backgroundColor: 'transparent',
    fontSize: 18,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  unitToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  segmented: {
    marginBottom: 12,
  },
  activityButtons: {
    marginBottom: 12,
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultItem: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  macroTitle: {
    marginBottom: 12,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
