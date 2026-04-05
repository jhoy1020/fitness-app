// DatabaseProvider
// Opens the SQLite database, runs migrations, seeds data, and provides
// repository instances to the entire component tree via React context.
//
// Usage:
//   <DatabaseProvider>
//     <App />
//   </DatabaseProvider>
//
// In any component/hook:
//   const { repos, isReady } = useDatabase();
//   const exercises = await repos.exercises.getAll();
//
// Phase 8: When auth is wired in, this provider will check auth state
// and swap LocalXxxRepository for RemoteXxxRepository (or HybridRepository).

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { runMigrations } from '../db/migrations';
import { seedDatabase } from '../db/seed';
import { migrateFromAsyncStorage } from '../db/migration-v1-to-v2';
import type { Repositories } from '../repositories/interfaces';
import {
  LocalExerciseRepository,
  LocalWorkoutRepository,
  LocalProgramRepository,
  LocalUserRepository,
  LocalMesoCycleRepository,
} from '../repositories/local';

const DB_NAME = 'fitness_app.db';

interface DatabaseContextValue {
  /** All repository instances — null until DB is ready. */
  repos: Repositories | null;
  /** Raw SQLite handle — prefer repos in most cases. */
  db: SQLiteDatabase | null;
  /** True once migrations + seed are complete. */
  isReady: boolean;
  /** Non-null if the DB failed to initialize. */
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  repos: null,
  db: null,
  isReady: false,
  error: null,
});

interface Props {
  children: ReactNode;
  /** Override DB name (useful for testing). */
  dbName?: string;
}

export function DatabaseProvider({ children, dbName }: Props) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const database = await openDatabaseAsync(dbName ?? DB_NAME);

        if (cancelled) return;

        // Run migrations (no-op if already up to date)
        await runMigrations(database);

        // Seed exercise library + premade programs on first launch
        await seedDatabase(database);

        // Migrate legacy AsyncStorage data to SQLite (one-time, idempotent)
        await migrateFromAsyncStorage(database);

        if (cancelled) return;

        setDb(database);
        setIsReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dbName]);

  // Memoize repository instances — recreated only when db handle changes
  const repos = useMemo<Repositories | null>(() => {
    if (!db) return null;
    return {
      exercises: new LocalExerciseRepository(db),
      workouts: new LocalWorkoutRepository(db),
      programs: new LocalProgramRepository(db),
      users: new LocalUserRepository(db),
      mesocycles: new LocalMesoCycleRepository(db),
    };
  }, [db]);

  const value = useMemo<DatabaseContextValue>(
    () => ({ repos, db, isReady, error }),
    [repos, db, isReady, error]
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Access the database context.
 * Returns { repos, db, isReady, error }.
 */
export function useDatabase(): DatabaseContextValue {
  return useContext(DatabaseContext);
}

/**
 * Convenience hook — returns repos and throws if DB isn't ready.
 * Use in components that should only render after loading.
 */
export function useRepos(): Repositories {
  const { repos, isReady, error } = useDatabase();
  if (error) {
    throw error;
  }
  if (!isReady || !repos) {
    throw new Error('useRepos() called before DatabaseProvider is ready');
  }
  return repos;
}
