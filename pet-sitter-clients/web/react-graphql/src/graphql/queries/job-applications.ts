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
 * GET /jobs/:jobId/job-applications — 공고별 지원 목록 조회
 */
export const GET_JOB_APPLICATIONS = gql`
  query GetJobApplications($jobId: ID!) {
    jobApplications(jobId: $jobId) {
      items { ${JOB_APPLICATION_FIELDS} }
    }
  }
`;
