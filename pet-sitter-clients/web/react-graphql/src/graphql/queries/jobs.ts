import { gql } from '@apollo/client';

/** 공통 Photo 필드 */
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

/** 공통 Pet 필드 */
const PET_FIELDS = `
  id
  name
  age
  species
  breed
  size
  job_id
  photos { ${PHOTO_FIELDS} }
  createdAt
  updatedAt
`;

/** 공통 Job 필드 */
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
  pets { ${PET_FIELDS} }
  photos { ${PHOTO_FIELDS} }
  createdAt
  updatedAt
`;

/**
 * GET /jobs — 커서 기반 무한스크롤 구인공고 목록
 *
 * 서버 스키마: jobs(filter: JobFilterInput, pagination: PaginationInput)
 * - filter 필드명은 camelCase (endTimeAfter, startTimeBefore 등)
 * - pagination: { cursor, limit }
 */
export const GET_JOBS = gql`
  query GetJobs($filter: JobFilterInput, $pagination: PaginationInput) {
    jobs(filter: $filter, pagination: $pagination) {
      items {
        ${JOB_FIELDS}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * GET /jobs/:id — 구인공고 상세 조회
 */
export const GET_JOB = gql`
  query GetJob($id: String!) {
    job(id: $id) {
      ${JOB_FIELDS}
    }
  }
`;
