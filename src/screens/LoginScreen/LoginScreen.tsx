// Login / Register Screen
// Backed by AuthContext, which now goes through the mock API. Successful
// auth flips `isAuthenticated`, which causes the navigation gate in
// App.tsx to swap from the auth stack to the main app — no manual
// navigation needed from here.

import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  useTheme,
  HelperText,
  Snackbar,
  Chip,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { spacing, borderRadius, withAlpha } from '../../theme';

type Mode = 'login' | 'register';

interface Props {
  initialMode?: Mode;
}

const ICON_SIZE = 44;
const MIN_PASSWORD_LENGTH = 8;
// Pragmatic email regex — tight enough to catch typos, lenient enough not
// to false-reject legitimate addresses. Server is the source of truth.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

interface TopLevelError {
  message: string;
  /** When set, renders an inline action button next to the message. */
  action?: { label: string; onPress: () => void };
}

export function LoginScreen({ initialMode = 'login' }: Props) {
  const theme = useTheme();
  const {
    login,
    register,
    loginWithGoogle,
    loginWithApple,
    loginAsGuest,
    loginAsTestUser,
  } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [topError, setTopError] = useState<TopLevelError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotSnackbarVisible, setForgotSnackbarVisible] = useState(false);

  // Synchronous re-entry guard. `setSubmitting(true)` is async — between
  // a user's first tap and React flushing the disabled state, a second
  // tap can sneak through. The ref is set in the same tick as entry so
  // duplicates are rejected immediately.
  const inFlight = useRef<boolean>(false);

  const isRegister = mode === 'register';

  // Map raw backend / fetch errors to friendly, actionable copy. Returns
  // either a field-scoped error (rendered under the input) or a top-level
  // error (rendered above the submit button).
  const interpretError = (
    err: unknown,
  ): { field?: FieldErrors; top?: TopLevelError } => {
    const raw = err instanceof Error ? err.message : String(err);

    // Network / fetch failures — TypeError is what fetch throws when it
    // can't reach the server (DNS, offline, CORS preflight failure).
    if (
      err instanceof TypeError ||
      /network|failed to fetch|fetch failed/i.test(raw)
    ) {
      return {
        top: {
          message:
            "Couldn't reach the server. Check your connection and try again.",
        },
      };
    }

    if (/invalid credentials/i.test(raw)) {
      // Don't leak which of the two was wrong — surface under password,
      // since email-not-found and wrong-password are indistinguishable.
      return { field: { password: 'Email or password is incorrect' } };
    }

    if (/already registered|user exists|already exists/i.test(raw)) {
      return {
        top: {
          message: 'An account already exists for this email.',
          action: {
            label: 'Sign in instead',
            onPress: () => {
              setMode('login');
              setFieldErrors({});
              setTopError(null);
            },
          },
        },
      };
    }

    // Server-side email format complaint (the MSW backend reports it as
    // a 400 with the message). Surface it under the email field.
    if (/email.*invalid|invalid.*email/i.test(raw)) {
      return { field: { email: 'Please enter a valid email address' } };
    }

    // Fallback — show whatever the server said.
    return { top: { message: raw } };
  };

  // Wrap any auth call so submitting/error state are managed in one place.
  // On success we don't navigate — the AuthContext flip causes App.tsx's
  // NavigationGate to swap stacks for us.
  const runAuth = async (fn: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setTopError(null);
    setSubmitting(true);
    try {
      await fn();
    } catch (e) {
      const interpreted = interpretError(e);
      if (interpreted.field) {
        setFieldErrors((prev) => ({ ...prev, ...interpreted.field }));
      }
      if (interpreted.top) {
        setTopError(interpreted.top);
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (isRegister && !displayName.trim()) {
      errors.displayName = 'Display name is required';
    }
    return errors;
  };

  const handleSubmit = () => {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    runAuth(() =>
      isRegister ? register(email, password, displayName) : login(email, password)
    );
  };

  const handleProvider = (which: 'google' | 'apple') =>
    runAuth(() => (which === 'google' ? loginWithGoogle() : loginWithApple()));

  const handleTestUser = () => runAuth(loginAsTestUser);
  const handleGuest = () => runAuth(loginAsGuest);

  const handleModeToggle = () => {
    setMode(isRegister ? 'login' : 'register');
    setFieldErrors({});
    setTopError(null);
  };

  // TODO: wire up real password-reset flow once backend supports it.
  const handleForgotPassword = () => {
    setForgotSnackbarVisible(true);
  };

  // Clear the field-scoped error for a field as the user edits it — keeps
  // validation feedback responsive without re-running the full check.
  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const devChipBg = withAlpha(theme.colors.outline, 0.12);
  const devCardBg = withAlpha(theme.colors.outline, 0.06);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Surface style={styles.card} elevation={1}>
          {/* ── Header ─────────────────────────────── */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={isRegister ? 'account-plus' : 'dumbbell'}
              size={ICON_SIZE}
              color={theme.colors.primary}
            />
            <Text variant="headlineSmall" style={styles.title}>
              Welcome to Fitness Tracker
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.outline, textAlign: 'center' }}
            >
              {isRegister
                ? 'Your workouts stay on this device until you enable sync.'
                : 'Sign in or skip ahead — you can create an account anytime.'}
            </Text>
          </View>

          {/* ── Skip / guest (prominent secondary action) ─────── */}
          <Button
            mode="outlined"
            icon="arrow-right"
            onPress={handleGuest}
            disabled={submitting}
            style={styles.guestButton}
            accessibilityLabel="Skip — use as guest"
          >
            Skip — use as guest
          </Button>
          <Text variant="bodySmall" style={styles.guestCaption}>
            You can sign in later from Profile.
          </Text>

          {/* ── Email / password form ──────────────── */}
          {isRegister && (
            <>
              <TextInput
                mode="outlined"
                label="Display name"
                value={displayName}
                onChangeText={(v) => {
                  setDisplayName(v);
                  clearFieldError('displayName');
                }}
                autoCapitalize="words"
                error={!!fieldErrors.displayName}
                style={styles.input}
              />
              {fieldErrors.displayName && (
                <HelperText type="error" visible style={styles.fieldHelper}>
                  {fieldErrors.displayName}
                </HelperText>
              )}
            </>
          )}

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearFieldError('email');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            error={!!fieldErrors.email}
            style={styles.input}
          />
          {fieldErrors.email && (
            <HelperText type="error" visible style={styles.fieldHelper}>
              {fieldErrors.email}
            </HelperText>
          )}

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearFieldError('password');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            error={!!fieldErrors.password}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                forceTextInputFocus={false}
              />
            }
            style={styles.input}
          />
          {fieldErrors.password && (
            <HelperText type="error" visible style={styles.fieldHelper}>
              {fieldErrors.password}
            </HelperText>
          )}

          {!isRegister && (
            <View style={styles.forgotRow}>
              <Button
                mode="text"
                compact
                onPress={handleForgotPassword}
                disabled={submitting}
              >
                Forgot password?
              </Button>
            </View>
          )}

          {/* ── Top-level (server / network) error ─────────────── */}
          {topError && (
            <View style={styles.topErrorBlock}>
              <HelperText type="error" visible style={styles.fieldHelper}>
                {topError.message}
              </HelperText>
              {topError.action && (
                <Button
                  mode="text"
                  compact
                  onPress={topError.action.onPress}
                  style={styles.topErrorAction}
                >
                  {topError.action.label}
                </Button>
              )}
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submit}
          >
            {isRegister ? 'Create account' : 'Sign in'}
          </Button>

          {/* ── Compact OAuth row ──────────────────── */}
          <Text variant="bodySmall" style={styles.orRowLabel}>
            Or continue with
          </Text>
          <View style={styles.providerRow}>
            <Button
              mode="outlined"
              icon="google"
              onPress={() => handleProvider('google')}
              disabled={submitting}
              style={styles.providerButton}
              compact
            >
              Google
            </Button>
            <Button
              mode="outlined"
              icon="apple"
              onPress={() => handleProvider('apple')}
              disabled={submitting}
              style={styles.providerButton}
              compact
            >
              Apple
            </Button>
          </View>

          {/* ── Mode toggle (least prominent — at the bottom) ──── */}
          <Button
            mode="text"
            onPress={handleModeToggle}
            disabled={submitting}
            style={styles.modeToggle}
          >
            {isRegister ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </Button>
        </Surface>

        {/* ── Developer card ───────────────────────── */}
        {__DEV__ && (
          <Surface
            style={[
              styles.devCard,
              {
                borderColor: theme.colors.outline,
                backgroundColor: devCardBg,
              },
            ]}
            elevation={0}
          >
            <View style={styles.devHeader}>
              <Text variant="titleSmall">Developer</Text>
              <Chip
                compact
                style={[styles.devChip, { backgroundColor: devChipBg }]}
                textStyle={styles.devChipText}
              >
                DEV
              </Chip>
            </View>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.outline, marginBottom: spacing.sm }}
            >
              Instantly sign in as a canned test account for manual testing.
            </Text>
            <Button
              mode="contained-tonal"
              icon="flask"
              onPress={handleTestUser}
              disabled={submitting}
            >
              Sign in as test user
            </Button>
          </Surface>
        )}
      </ScrollView>

      <Snackbar
        visible={forgotSnackbarVisible}
        onDismiss={() => setForgotSnackbarVisible(false)}
        action={{
          label: 'Dismiss',
          onPress: () => setForgotSnackbarVisible(false),
        }}
      >
        Password reset is coming soon — contact support for now.
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  guestButton: {
    marginTop: spacing.xs,
  },
  guestCaption: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    opacity: 0.7,
  },
  input: {
    marginBottom: spacing.xs,
  },
  fieldHelper: {
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  topErrorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  topErrorAction: {
    marginLeft: -spacing.sm,
  },
  submit: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  orRowLabel: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    opacity: 0.7,
  },
  providerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  providerButton: {
    flex: 1,
  },
  modeToggle: {
    marginTop: spacing.sm,
  },
  devCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  devHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  devChip: {
    height: 24,
  },
  devChipText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    marginVertical: 0,
  },
});
