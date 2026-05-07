// MSW Browser Integration (web builds)
//
// Uses a service worker to intercept `fetch`/XHR calls made by the
// react-native-web build. Registered once on app startup from
// src/mocks/start.ts.

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
