// Build-time release gates. Flip a value here to enable/disable a feature
// across the entire app. Not a runtime toggle — intentional, so the active
// configuration is visible in source review and PR diffs.
//
// `authAndAccount`: when false, `NavigationGate` skips the auth stack and
// the Profile screen omits its account section. The auth implementation
// (LoginScreen, AuthContext, AuthNavigator, mock /auth/* handlers) stays
// in the codebase so flipping this back to true restores the flow with
// no other code changes.

export const FEATURE_FLAGS = {
  authAndAccount: false,
} as const;
