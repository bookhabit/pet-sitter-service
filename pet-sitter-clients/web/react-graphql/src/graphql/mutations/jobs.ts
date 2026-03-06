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
 * POST /jobs — 구인공고 등록 (PetOwner 전용)
 */
export const CREATE_JOB = gql`
  mutation CreateJob(
    $start_time: String!
    $end_time: String!
    $activity: String!
    $pets: [PetInput!]!
    $photo_ids: [ID!]
    $address: String
    $latitude: Float
    $longitude: Float
    $price: Int
    $price_type: String
  ) {
    createJob(
      start_time: $start_time
      end_time: $end_time
      activity: $activity
      pets: $pets
      photo_ids: $photo_ids
      address: $address
      latitude: $latitude
      longitude: $longitude
      price: $price
      price_type: $price_type
    ) {
      ${JOB_FIELDS}
    }
  }
`;

/**
 * PUT /jobs/:id — 구인공고 수정 (작성자 또는 Admin)
 */
export const UPDATE_JOB = gql`
  mutation UpdateJob(
    $id: ID!
    $start_time: String
    $end_time: String
    $activity: String
    $pets: [PetInput!]
    $photo_ids: [ID!]
    $address: String
    $latitude: Float
    $longitude: Float
    $price: Int
    $price_type: String
  ) {
    updateJob(
      id: $id
      start_time: $start_time
      end_time: $end_time
      activity: $activity
      pets: $pets
      photo_ids: $photo_ids
      address: $address
      latitude: $latitude
      longitude: $longitude
      price: $price
      price_type: $price_type
    ) {
      ${JOB_FIELDS}
    }
  }
`;

/**
 * DELETE /jobs/:id — 구인공고 삭제 (작성자 또는 Admin)
 */
export const DELETE_JOB = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id) {
      id
    }
  }
`;
