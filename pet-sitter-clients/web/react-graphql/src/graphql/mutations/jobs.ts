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
 * 구인공고 등록 (PetOwner 전용)
 *
 * 서버 스키마: createJob(data: CreateJobInput!): JobModel!
 * CreateJobInput: { activity, start_time, end_time, pets: [CreatePetInput!]!, photo_ids?, address?, ... }
 */
export const CREATE_JOB = gql`
  mutation CreateJob($data: CreateJobInput!) {
    createJob(data: $data) {
      ${JOB_FIELDS}
    }
  }
`;

/**
 * 구인공고 수정 (작성자 또는 Admin)
 *
 * 서버 스키마: updateJob(data: UpdateJobInput!, id: String!): JobModel!
 * UpdateJobInput에는 photo_ids 없음
 */
export const UPDATE_JOB = gql`
  mutation UpdateJob($id: String!, $data: UpdateJobInput!) {
    updateJob(id: $id, data: $data) {
      ${JOB_FIELDS}
    }
  }
`;

/**
 * 구인공고 삭제 (작성자 또는 Admin)
 *
 * 서버 스키마: deleteJob(id: String!): Boolean!
 */
export const DELETE_JOB = gql`
  mutation DeleteJob($id: String!) {
    deleteJob(id: $id)
  }
`;
