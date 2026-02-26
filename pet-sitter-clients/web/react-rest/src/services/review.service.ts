import { z } from 'zod';

import { http } from '../api/axios-instance';
import { reviewSchema } from '../schemas/review.schema';

import type { CreateReviewInput, Review } from '../schemas/review.schema';

/**
 * POST /jobs/:jobId/reviews        — 리뷰 작성 (공고 등록자만)
 * GET  /users/:userId/reviews      — 펫시터 리뷰 목록 조회
 * DELETE /reviews/:id              — 리뷰 삭제 (작성자만, 204)
 */
export const reviewService = {
  createReview: (jobId: string, data: CreateReviewInput): Promise<Review> =>
    http.post<Review>(`/jobs/${jobId}/reviews`, data, reviewSchema),

  getUserReviews: (userId: string, sort?: string): Promise<Review[]> =>
    http.get(`/users/${userId}/reviews`, sort ? { sort } : undefined, z.array(reviewSchema)),

  deleteReview: (id: string): Promise<void> =>
    http.delete(`/reviews/${id}`).then(() => undefined),
};
