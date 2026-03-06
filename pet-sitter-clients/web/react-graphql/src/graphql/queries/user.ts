import { gql } from '@apollo/client';

const PHOTO_FIELDS = `
  id
  url
  file_name
  original_name
  mime_type
  size
  uploader_id
  user_id
  job_id
  pet_id
  createdAt
`;

const USER_FIELDS = `
  id
  email
  full_name
  roles
  photos { ${PHOTO_FIELDS} }
  createdAt
  updatedAt
`;

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

const JOB_APPLICATION_FIELDS = `
  id
  status
  user_id
  job_id
  createdAt
  updatedAt
`;

/**
 * GET /users/:id — 사용자 정보 조회
 */
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ${USER_FIELDS}
    }
  }
`;

/**
 * GET /users/:id/jobs — 사용자가 등록한 공고 목록
 */
export const GET_USER_JOBS = gql`
  query GetUserJobs($userId: ID!) {
    userJobs(userId: $userId) {
      ${JOB_FIELDS}
    }
  }
`;

/**
 * GET /users/:id/job-applications — 사용자가 지원한 공고 목록
 */
export const GET_USER_JOB_APPLICATIONS = gql`
  query GetUserJobApplications($userId: ID!) {
    userJobApplications(userId: $userId) {
      ${JOB_APPLICATION_FIELDS}
    }
  }
`;
