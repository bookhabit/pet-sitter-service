import { gql } from '@apollo/client';

const JOB_APPLICATION_FIELDS = `
  id
  status
  user_id
  job_id
  createdAt
  updatedAt
`;

/**
 * 공고별 지원 목록 조회
 *
 * 서버 스키마: jobApplicationsByJob(jobId: String!): [JobApplicationModel!]!
 * 직접 배열 반환 (페이지네이션 없음)
 */
export const GET_JOB_APPLICATIONS = gql`
  query GetJobApplications($jobId: String!) {
    jobApplicationsByJob(jobId: $jobId) {
      ${JOB_APPLICATION_FIELDS}
    }
  }
`;
