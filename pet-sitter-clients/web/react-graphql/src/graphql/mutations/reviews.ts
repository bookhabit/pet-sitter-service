import { gql } from '@apollo/client';

const REVIEW_FIELDS = `
  id
  rating
  comment
  reviewer_id
  reviewee_id
  job_id
  createdAt
  updatedAt
`;

/**
 * POST /jobs/:jobId/reviews — 리뷰 작성 (공고 등록자만)
 */
export const CREATE_REVIEW = gql`
  mutation CreateReview($jobId: ID!, $rating: Int!, $comment: String) {
    createReview(jobId: $jobId, rating: $rating, comment: $comment) {
      ${REVIEW_FIELDS}
    }
  }
`;

/**
 * DELETE /reviews/:id — 리뷰 삭제 (작성자만, 204)
 */
export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;
