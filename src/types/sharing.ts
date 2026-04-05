// Sharing & Public Program Library Types (Phase 8: backend-ready)
//
// These types are defined up front so the local data model can
// include future-facing optional fields (e.g. TrainingProgram.creatorId).
// They are NOT used in the app until the backend is wired in.

import type { TrainingProgram } from './program';

/** Metadata attached to a program published to the public library. */
export interface SharedProgramMeta {
  programId: string;          // Server-side program ID
  creatorId: string;          // Author's user ID
  creatorName: string;        // Author display name
  creatorAvatarUrl?: string;
  publishedAt: string;        // ISO date
  updatedAt: string;
  downloads: number;
  rating: number;             // Average 1-5
  ratingCount: number;
  isFeatured: boolean;
}

/** A single user's rating + optional review. */
export interface ProgramRating {
  id: string;
  programId: string;
  userId: string;
  rating: number;             // 1-5
  review?: string;
  createdAt: string;
}

/** Filters for browsing the public program store. */
export interface ProgramSearchFilters {
  search?: string;
  difficulty?: TrainingProgram['difficulty'];
  split?: string;
  goals?: TrainingProgram['goals'];
  minRating?: number;
  sortBy?: 'rating' | 'downloads' | 'newest';
  page?: number;
  pageSize?: number;
}

/** Generic paginated response from the API. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
