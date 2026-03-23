import { z } from 'zod';

/* ─── Review (서버 응답) ──────────────────────────────────────── */

export const reviewSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  reviewer_id: z.string().uuid(),
  reviewee_id: z.string().uuid(),
  job_id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Review = z.infer<typeof reviewSchema>;

/* ─── 입력 DTO ───────────────────────────────────────────────── */

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
