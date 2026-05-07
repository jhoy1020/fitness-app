// MSW Handlers
//
// Mock API surface covering the endpoints the Phase 8 backend is expected
// to expose. Works against the shared in-memory db (./db), seeded from
// ./fixtures. Written once — reused by both the web service worker
// (./browser) and the React Native interceptor (./native).
//
// Base URL: `${API_BASE_URL}`. Override API_BASE_URL in a future client
// module; for testing, `http://localhost:3001/api` is the default.

import { http, HttpResponse, delay } from 'msw';
import type {
  BodyMeasurement,
  OneRepMaxRecord,
  UserProfile,
  Workout,
  WorkoutSet,
  MesoCycle,
} from '../types';
import {
  createSession,
  deleteSession,
  findUserByEmail,
  findUserById,
  getDb,
  publicUser,
  resolveAuth,
} from './db';

export const API_BASE_URL = 'http://localhost:3001/api';

const url = (path: string) => `${API_BASE_URL}${path}`;

function unauthorized(): HttpResponse {
  return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function notFound(entity: string): HttpResponse {
  return HttpResponse.json({ error: `${entity} not found` }, { status: 404 });
}

function badRequest(message: string): HttpResponse {
  return HttpResponse.json({ error: message }, { status: 400 });
}

// All handlers introduce a small delay to mimic real network latency.
const NETWORK_DELAY_MS = 120;

export const handlers = [
  // ═══════════════════════════════════════════════════════
  //  Auth
  // ═══════════════════════════════════════════════════════

  http.post(url('/auth/register'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const body = (await request.json()) as { email?: string; password?: string; displayName?: string };
    if (!body.email || !body.password || !body.displayName) {
      return badRequest('email, password, and displayName are required');
    }
    if (body.password.length < 6) return badRequest('Password must be at least 6 characters');
    if (findUserByEmail(body.email)) return HttpResponse.json({ error: 'Email already registered' }, { status: 409 });

    const db = getDb();
    const user = {
      id: `user-${db.users.length + 1}`,
      email: body.email.trim().toLowerCase(),
      displayName: body.displayName.trim(),
      authProvider: 'email' as const,
      createdAt: new Date().toISOString(),
      password: body.password,
    };
    db.users.push(user);
    const session = createSession(user.id);
    return HttpResponse.json({ user: publicUser(user), token: session.token });
  }),

  http.post(url('/auth/login'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) return badRequest('email and password are required');
    const user = findUserByEmail(body.email);
    if (!user || user.password !== body.password) {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const session = createSession(user.id);
    return HttpResponse.json({ user: publicUser(user), token: session.token });
  }),

  http.post(url('/auth/logout'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const auth = request.headers.get('authorization');
    const match = auth ? /^Bearer\s+(.+)$/i.exec(auth) : null;
    if (match) deleteSession(match[1]);
    return HttpResponse.json({ ok: true });
  }),

  http.get(url('/auth/me'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    return HttpResponse.json({ user: publicUser(user) });
  }),

  http.post(url('/auth/google'), async () => {
    await delay(NETWORK_DELAY_MS);
    return oauthLogin('google');
  }),

  http.post(url('/auth/apple'), async () => {
    await delay(NETWORK_DELAY_MS);
    return oauthLogin('apple');
  }),

  // ═══════════════════════════════════════════════════════
  //  Profile
  // ═══════════════════════════════════════════════════════

  http.get(url('/profile'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const profile = getDb().profiles[user.id];
    if (!profile) return notFound('Profile');
    return HttpResponse.json({ profile });
  }),

  http.put(url('/profile'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const updates = (await request.json()) as Partial<UserProfile>;
    const db = getDb();
    const existing = db.profiles[user.id];
    const now = new Date().toISOString();
    const merged: UserProfile = existing
      ? { ...existing, ...updates, id: existing.id, createdAt: existing.createdAt, updatedAt: now }
      : {
          ...(updates as UserProfile),
          id: user.id,
          createdAt: now,
          updatedAt: now,
        };
    db.profiles[user.id] = merged;
    return HttpResponse.json({ profile: merged });
  }),

  // ═══════════════════════════════════════════════════════
  //  Workouts
  // ═══════════════════════════════════════════════════════

  http.get(url('/workouts'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const limitParam = new URL(request.url).searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const sorted = [...getDb().workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return HttpResponse.json({ workouts: limit ? sorted.slice(0, limit) : sorted });
  }),

  http.get(url('/workouts/:id'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const workout = getDb().workouts.find((w) => w.id === params.id);
    if (!workout) return notFound('Workout');
    const sets = getDb().workoutSets.filter((s) => s.workoutId === workout.id);
    return HttpResponse.json({ workout, sets });
  }),

  http.post(url('/workouts'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const body = (await request.json()) as Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>;
    const now = new Date().toISOString();
    const workout: Workout = {
      ...body,
      id: `workout-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    getDb().workouts.push(workout);
    return HttpResponse.json({ workout }, { status: 201 });
  }),

  http.put(url('/workouts/:id'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const db = getDb();
    const idx = db.workouts.findIndex((w) => w.id === params.id);
    if (idx < 0) return notFound('Workout');
    const updates = (await request.json()) as Partial<Workout>;
    db.workouts[idx] = {
      ...db.workouts[idx],
      ...updates,
      id: db.workouts[idx].id,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ workout: db.workouts[idx] });
  }),

  http.delete(url('/workouts/:id'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const db = getDb();
    const before = db.workouts.length;
    db.workouts = db.workouts.filter((w) => w.id !== params.id);
    db.workoutSets = db.workoutSets.filter((s) => s.workoutId !== params.id);
    if (db.workouts.length === before) return notFound('Workout');
    return HttpResponse.json({ ok: true });
  }),

  // ── Sets ──

  http.get(url('/workouts/:id/sets'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const sets = getDb().workoutSets.filter((s) => s.workoutId === params.id);
    return HttpResponse.json({ sets });
  }),

  http.post(url('/workouts/:id/sets'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const body = (await request.json()) as Omit<WorkoutSet, 'id' | 'createdAt' | 'workoutId'>;
    const workoutId = String(params.id);
    const newSet: WorkoutSet = {
      ...body,
      id: `set-${Date.now()}`,
      workoutId,
      createdAt: new Date().toISOString(),
    };
    getDb().workoutSets.push(newSet);
    return HttpResponse.json({ set: newSet }, { status: 201 });
  }),

  http.put(url('/sets/:id'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const db = getDb();
    const idx = db.workoutSets.findIndex((s) => s.id === params.id);
    if (idx < 0) return notFound('Set');
    const updates = (await request.json()) as Partial<WorkoutSet>;
    db.workoutSets[idx] = { ...db.workoutSets[idx], ...updates, id: db.workoutSets[idx].id };
    return HttpResponse.json({ set: db.workoutSets[idx] });
  }),

  http.delete(url('/sets/:id'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const db = getDb();
    const before = db.workoutSets.length;
    db.workoutSets = db.workoutSets.filter((s) => s.id !== params.id);
    if (db.workoutSets.length === before) return notFound('Set');
    return HttpResponse.json({ ok: true });
  }),

  // ═══════════════════════════════════════════════════════
  //  Body Measurements
  // ═══════════════════════════════════════════════════════

  http.get(url('/measurements'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const measurements = [...getDb().measurements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return HttpResponse.json({ measurements });
  }),

  http.post(url('/measurements'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const body = (await request.json()) as Omit<BodyMeasurement, 'id' | 'createdAt'>;
    const m: BodyMeasurement = {
      ...body,
      id: `measurement-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    getDb().measurements.push(m);
    return HttpResponse.json({ measurement: m }, { status: 201 });
  }),

  // ═══════════════════════════════════════════════════════
  //  1RM Records
  // ═══════════════════════════════════════════════════════

  http.get(url('/one-rep-max'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    return HttpResponse.json({ records: getDb().oneRepMaxRecords });
  }),

  http.put(url('/one-rep-max'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const body = (await request.json()) as Omit<OneRepMaxRecord, 'id'> & { id?: string };
    const db = getDb();
    db.oneRepMaxRecords = db.oneRepMaxRecords.filter(
      (r) => r.exerciseName.toLowerCase() !== body.exerciseName.toLowerCase()
    );
    const record: OneRepMaxRecord = { ...body, id: body.id ?? `orm-${Date.now()}` };
    db.oneRepMaxRecords.push(record);
    return HttpResponse.json({ record });
  }),

  http.delete(url('/one-rep-max/:id'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const db = getDb();
    const before = db.oneRepMaxRecords.length;
    db.oneRepMaxRecords = db.oneRepMaxRecords.filter((r) => r.id !== params.id);
    if (db.oneRepMaxRecords.length === before) return notFound('Record');
    return HttpResponse.json({ ok: true });
  }),

  // ═══════════════════════════════════════════════════════
  //  Mesocycles
  // ═══════════════════════════════════════════════════════

  http.get(url('/mesocycles'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    return HttpResponse.json({ mesocycles: getDb().mesocycles });
  }),

  http.get(url('/mesocycles/active'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const active = getDb().mesocycles.find((m) => m.status === 'active') ?? null;
    return HttpResponse.json({ mesocycle: active });
  }),

  http.get(url('/mesocycles/:id'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const m = getDb().mesocycles.find((x) => x.id === params.id);
    if (!m) return notFound('Mesocycle');
    return HttpResponse.json({ mesocycle: m });
  }),

  http.post(url('/mesocycles'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const body = (await request.json()) as MesoCycle;
    const now = new Date().toISOString();
    const meso: MesoCycle = {
      ...body,
      id: body.id ?? `mesocycle-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    getDb().mesocycles.push(meso);
    return HttpResponse.json({ mesocycle: meso }, { status: 201 });
  }),

  http.put(url('/mesocycles/:id'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const db = getDb();
    const idx = db.mesocycles.findIndex((m) => m.id === params.id);
    if (idx < 0) return notFound('Mesocycle');
    const updates = (await request.json()) as Partial<MesoCycle>;
    db.mesocycles[idx] = {
      ...db.mesocycles[idx],
      ...updates,
      id: db.mesocycles[idx].id,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ mesocycle: db.mesocycles[idx] });
  }),

  // ═══════════════════════════════════════════════════════
  //  Public Program Library
  // ═══════════════════════════════════════════════════════

  http.get(url('/programs/public'), async ({ request }) => {
    await delay(NETWORK_DELAY_MS);
    const params = new URL(request.url).searchParams;
    const page = parseInt(params.get('page') ?? '1', 10);
    const pageSize = parseInt(params.get('pageSize') ?? '20', 10);
    const all = getDb().programs;
    const start = (page - 1) * pageSize;
    const slice = all.slice(start, start + pageSize);
    return HttpResponse.json({
      data: slice,
      total: all.length,
      page,
      pageSize,
      hasMore: start + slice.length < all.length,
    });
  }),

  http.post(url('/programs/:id/clone'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const original = getDb().programs.find((p) => p.id === params.id);
    if (!original) return notFound('Program');
    const cloned = { ...original, id: `program-${Date.now()}`, clonedFromId: original.id };
    return HttpResponse.json({ program: cloned }, { status: 201 });
  }),

  http.post(url('/programs/:id/rate'), async ({ request, params }) => {
    await delay(NETWORK_DELAY_MS);
    const user = resolveAuth(request.headers.get('authorization'));
    if (!user) return unauthorized();
    const body = (await request.json()) as { rating: number; review?: string };
    if (body.rating < 1 || body.rating > 5) return badRequest('Rating must be 1-5');
    return HttpResponse.json({ ok: true, programId: params.id, rating: body.rating });
  }),
];

// ─── Helpers ───────────────────────────────────────────────

function oauthLogin(provider: 'google' | 'apple'): HttpResponse {
  const email = `${provider}-demo@example.com`;
  const db = getDb();
  let user = findUserByEmail(email);
  if (!user) {
    user = {
      id: `${provider}-user`,
      email,
      displayName: provider === 'google' ? 'Google Demo User' : 'Apple Demo User',
      authProvider: provider,
      createdAt: new Date().toISOString(),
      password: '',
    };
    db.users.push(user);
  }
  const session = createSession(user.id);
  return HttpResponse.json({ user: publicUser(user), token: session.token });
}
