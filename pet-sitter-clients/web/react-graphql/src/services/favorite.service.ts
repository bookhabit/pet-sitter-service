import { z } from 'zod';

import { http } from '../api/axios-instance';
import { toggleFavoriteResultSchema } from '../schemas/favorite.schema';
import { jobSchema } from '../schemas/job.schema';

import type { ToggleFavoriteResult } from '../schemas/favorite.schema';
import type { Job } from '../schemas/job.schema';

/**
 * POST /favorites            — 즐겨찾기 토글 (PetSitter 전용) → { added: boolean }
 * GET  /favorites            — 내 즐겨찾기 목록 (PetSitter 전용) → Job[]
 * DELETE /favorites/:jobId   — 즐겨찾기 제거 (PetSitter 전용, 204)
 */
export const favoriteService = {
  toggle: (jobId: string): Promise<ToggleFavoriteResult> =>
    http.post<ToggleFavoriteResult>('/favorites', { job_id: jobId }, toggleFavoriteResultSchema),

  getMyFavorites: (): Promise<Job[]> =>
    http.get('/favorites', undefined, z.array(jobSchema)),

  remove: (jobId: string): Promise<void> =>
    http.delete(`/favorites/${jobId}`).then(() => undefined),
};
