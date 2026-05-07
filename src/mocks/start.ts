// MSW Bootstrap — platform-agnostic entry point
//
// Picks the right MSW integration for the current runtime:
//   - web (react-native-web)  → service worker
//   - native (iOS / Android)  → fetch patching via msw/native
//
// Imported once from App.tsx, gated behind __DEV__ so the mock layer
// never ships in release builds. Safe to call repeatedly — the underlying
// workers/servers are idempotent.

import { Platform } from 'react-native';

let started = false;

export async function startMockApi(): Promise<void> {
  if (started) return;
  started = true;

  try {
    if (Platform.OS === 'web') {
      const { worker } = await import('./browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('[mocks] MSW worker started (web)');
    } else {
      const { server } = await import('./native');
      server.listen({ onUnhandledRequest: 'bypass' });
      console.log('[mocks] MSW server started (native)');
    }
  } catch (err) {
    started = false;
    console.warn('[mocks] Failed to start MSW:', err);
  }
}
