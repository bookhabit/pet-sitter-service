import { z } from 'zod';

/* ─── 토글 결과 (서버 응답) ───────────────────────────────────── */

export const toggleFavoriteResultSchema = z.object({
  added: z.boolean(),
});

export type ToggleFavoriteResult = z.infer<typeof toggleFavoriteResultSchema>;

/* ─── 입력 DTO ───────────────────────────────────────────────── */

export const toggleFavoriteSchema = z.object({
  job_id: z.string().uuid(),
});

export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
