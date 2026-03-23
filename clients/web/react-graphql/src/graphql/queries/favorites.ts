import { gql } from '@apollo/client';

const JOB_FIELDS = `
  id
  creator_user_id
  start_time
  end_time
  activity
  address
  latitude
  longitude
  price
  price_type
  pets {
    id name age species breed size job_id
    photos { id url createdAt }
    createdAt updatedAt
  }
  photos { id url file_name original_name mime_type size uploader_id user_id job_id pet_id createdAt }
  createdAt
  updatedAt
`;

/**
 * GET /favorites — 내 즐겨찾기 목록 (PetSitter 전용)
 */
export const GET_MY_FAVORITES = gql`
  query GetMyFavorites {
    myFavorites {
      ${JOB_FIELDS}
    }
  }
`;
