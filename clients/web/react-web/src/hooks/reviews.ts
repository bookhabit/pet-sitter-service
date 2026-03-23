import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { reviewService } from '@/services/review.service';

import type { CreateReviewInput } from '@/schemas/review.schema';

export const reviewQueryKeys = {
  byUser: (userId: string, sort?: string) => ['reviews', 'byUser', userId, sort] as const,
};

/**
 * [Data Hook] GET /users/:userId/reviews — 펫시터 리뷰 목록 조회
 */
export function useUserReviewsQuery(userId: string, sort?: string) {
  return useSuspenseQuery({
    queryKey: reviewQueryKeys.byUser(userId, sort),
    queryFn: () => reviewService.getUserReviews(userId, sort),
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * [Mutation Hook] POST /jobs/:jobId/reviews — 리뷰 작성 (공고 등록자만)
 * 성공 시 해당 공고 승인 펫시터의 리뷰 목록 캐시 무효화
 */
export function useCreateReviewMutation(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewInput) => reviewService.createReview(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'byUser'] });
    },
  });
}

/**
 * [Mutation Hook] DELETE /reviews/:id — 리뷰 삭제 (작성자만)
 * 성공 시 리뷰 목록 캐시 무효화
 */
export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'byUser'] });
    },
  });
}
