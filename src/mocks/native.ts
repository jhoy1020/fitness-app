// MSW React Native Integration (iOS / Android builds)
//
// Patches React Native's `fetch` in-JS — no service worker needed.
// Registered once on app startup from src/mocks/start.ts.

import { setupServer } from 'msw/native';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
