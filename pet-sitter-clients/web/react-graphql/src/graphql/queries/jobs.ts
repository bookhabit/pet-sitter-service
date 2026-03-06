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
 */
export const GET_JOBS = gql`
  query GetJobs(
    $cursor: String
    $limit: Int
    $activity: String
    $sort: String
    $start_time_before: String
    $start_time_after: String
    $end_time_before: String
    $end_time_after: String
    $pets_age_below: Int
    $pets_age_above: Int
    $pets_species: String
    $min_price: Int
    $max_price: Int
  ) {
    jobs(
      cursor: $cursor
      limit: $limit
      activity: $activity
      sort: $sort
      start_time_before: $start_time_before
      start_time_after: $start_time_after
      end_time_before: $end_time_before
      end_time_after: $end_time_after
      pets_age_below: $pets_age_below
      pets_age_above: $pets_age_above
      pets_species: $pets_species
      min_price: $min_price
      max_price: $max_price
    ) {
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
  query GetJob($id: ID!) {
    job(id: $id) {
      ${JOB_FIELDS}
    }
  }
`;
