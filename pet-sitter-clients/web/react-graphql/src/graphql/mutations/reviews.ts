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
 * 리뷰 작성 (PetOwner 또는 PetSitter)
 *
 * 서버 스키마: createReview(data: CreateReviewInput!, jobId: ID!): ReviewModel!
 * CreateReviewInput: { rating: Int!, comment?: String }
 */
export const CREATE_REVIEW = gql`
  mutation CreateReview($jobId: ID!, $data: CreateReviewInput!) {
    createReview(jobId: $jobId, data: $data) {
      ${REVIEW_FIELDS}
    }
  }
`;

/**
 * 리뷰 삭제 (작성자만)
 *
 * 서버 스키마: deleteReview(id: ID!): Boolean!
 */
export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;
