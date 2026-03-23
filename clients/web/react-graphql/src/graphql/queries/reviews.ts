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
 * GET /users/:userId/reviews — 펫시터 리뷰 목록 조회
 */
export const GET_USER_REVIEWS = gql`
  query GetUserReviews($userId: ID!, $sort: String) {
    userReviews(userId: $userId, sort: $sort) {
      ${REVIEW_FIELDS}
    }
  }
`;
