import { gql } from '@apollo/client';

/**
 * 즐겨찾기 토글 (PetSitter 전용)
 * added: true → 추가, added: false → 제거
 *
 * 서버 스키마: toggleFavorite(jobId: ID!): ToggleFavoriteResult!
 * 참고: removeFavorite는 스키마에 없음. 제거도 toggleFavorite으로 처리.
 */
export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($jobId: ID!) {
    toggleFavorite(jobId: $jobId) {
      added
    }
  }
`;
