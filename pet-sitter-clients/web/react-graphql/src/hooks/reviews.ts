import { useMutation, useSuspenseQuery, useApolloClient } from '@apollo/client';

import { GET_USER_REVIEWS } from '@/graphql/queries/reviews';
import { CREATE_REVIEW, DELETE_REVIEW } from '@/graphql/mutations/reviews';

import type { CreateReviewInput, Review } from '@/schemas/review.schema';

/**
 * [Data Hook] GET /users/:userId/reviews — 펫시터 리뷰 목록 조회
 */
export function useUserReviewsQuery(userId: string, sort?: string) {
  const { data } = useSuspenseQuery<{ userReviews: Review[] }>(GET_USER_REVIEWS, {
    variables: { userId, sort },
  });

  return { data: data?.userReviews ?? [] };
}

/**
 * [Mutation Hook] POST /jobs/:jobId/reviews — 리뷰 작성 (공고 등록자만)
 * 성공 시 해당 공고 승인 펫시터의 리뷰 목록 캐시 갱신
 */
export function useCreateReviewMutation(jobId: string) {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ createReview: Review }>(
    CREATE_REVIEW,
    {
      onCompleted: () => {
        client.refetchQueries({ include: ['GetUserReviews'] });
      },
    },
  );

  const mutate = (input: CreateReviewInput) => {
    execute({ variables: { jobId, rating: input.rating, comment: input.comment } }).catch(() => {});
  };

  const mutateAsync = async (input: CreateReviewInput) => {
    const result = await execute({
      variables: { jobId, rating: input.rating, comment: input.comment },
    });
    return result.data!.createReview;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.createReview ?? null,
  };
}

/**
 * [Mutation Hook] DELETE /reviews/:id — 리뷰 삭제 (작성자만)
 * 성공 시 리뷰 목록 캐시 갱신
 */
export function useDeleteReviewMutation() {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation(DELETE_REVIEW, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetUserReviews'] });
    },
  });

  const mutate = (id: string) => {
    execute({ variables: { id } }).catch(() => {});
  };

  return {
    mutate,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
  };
}
