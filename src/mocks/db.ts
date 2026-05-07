// Mock API In-Memory Database
//
// Backs the MSW handlers with a mutable in-memory store seeded from the
// shared fixture. Reset between test runs via `resetMockDb()`.

import type {
  BodyMeasurement,
  MesoCycle,
  OneRepMaxRecord,
  UserProfile,
  Workout,
  WorkoutSet,
  TrainingProgram,
} from '../types';
import type { AuthUser } from '../context/AuthContext';
import { buildTestFixture } from './fixtures';

interface MockUser extends AuthUser {
  password: string;
}

interface MockSession {
  token: string;
  userId: string;
  expiresAt: string;
}

interface MockDb {
  users: MockUser[];
  sessions: MockSession[];
  profiles: Record<string, UserProfile>; // userId → profile
  workouts: Workout[];
  workoutSets: WorkoutSet[];
  measurements: BodyMeasurement[];
  oneRepMaxRecords: OneRepMaxRecord[];
  mesocycles: MesoCycle[];
  programs: TrainingProgram[];
}

let db: MockDb = createEmptyDb();

function createEmptyDb(): MockDb {
  return {
    users: [],
    sessions: [],
    profiles: {},
    workouts: [],
    workoutSets: [],
    measurements: [],
    oneRepMaxRecords: [],
    mesocycles: [],
    programs: [],
  };
}

/** Reset the mock DB and reseed from the shared fixture. */
export function resetMockDb(opts: { now?: Date } = {}): void {
  const fixture = buildTestFixture(opts);
  db = createEmptyDb();
  db.users = fixture.users.map((u) => ({ ...u }));
  // First user owns the seeded data.
  const primaryUserId = fixture.users[0].id;
  db.profiles[primaryUserId] = { ...fixture.profile, id: primaryUserId };
  db.workouts = [...fixture.workouts];
  db.workoutSets = [...fixture.workoutSets];
  db.measurements = [...fixture.measurements];
  db.oneRepMaxRecords = [...fixture.oneRepMaxRecords];
  db.mesocycles = [fixture.mesocycle];
  db.programs = [];
}

resetMockDb();

// ─── Accessors ─────────────────────────────────────────────

export function getDb(): MockDb {
  return db;
}

export function findUserByEmail(email: string): MockUser | undefined {
  const normalized = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): MockUser | undefined {
  return db.users.find((u) => u.id === id);
}

export function createSession(userId: string): MockSession {
  const token = `mock-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  const session: MockSession = {
    token,
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  db.sessions.push(session);
  return session;
}

export function findSessionByToken(token: string): MockSession | undefined {
  return db.sessions.find((s) => s.token === token);
}

export function deleteSession(token: string): void {
  db.sessions = db.sessions.filter((s) => s.token !== token);
}

/**
 * Extract bearer token from an Authorization header and resolve the session's user.
 * Returns null if the token is missing, unknown, or expired.
 */
export function resolveAuth(authorization: string | null): MockUser | null {
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return null;
  const session = findSessionByToken(match[1]);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) return null;
  return findUserById(session.userId) ?? null;
}

// ─── Strip helpers ─────────────────────────────────────────

/** Strip server-internal fields before returning a user to a client. */
export function publicUser(u: MockUser): AuthUser {
  const { password: _omit, ...pub } = u;
  return pub;
}
