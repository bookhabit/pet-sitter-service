import { gql } from '@apollo/client';

/**
 * POST /favorites — 즐겨찾기 토글 (PetSitter 전용)
 * 반환값: { added: boolean }
 */
export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($job_id: ID!) {
    toggleFavorite(job_id: $job_id) {
      added
    }
  }
`;

/**
 * DELETE /favorites/:jobId — 즐겨찾기 제거 (PetSitter 전용, 204)
 */
export const REMOVE_FAVORITE = gql`
  mutation RemoveFavorite($job_id: ID!) {
    removeFavorite(job_id: $job_id)
  }
`;
