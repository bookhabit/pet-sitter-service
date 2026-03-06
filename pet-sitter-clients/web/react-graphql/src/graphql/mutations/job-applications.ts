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
 * POST /jobs/:jobId/job-applications — 구인공고 지원 (PetSitter 전용)
 */
export const APPLY_JOB = gql`
  mutation ApplyJob($jobId: ID!) {
    applyJob(jobId: $jobId) {
      ${JOB_APPLICATION_FIELDS}
    }
  }
`;

/**
 * PUT /job-applications/:jobApplicationId — 지원 상태 수정 (공고 작성자만)
 */
export const UPDATE_JOB_APPLICATION = gql`
  mutation UpdateJobApplication($id: ID!, $status: String!) {
    updateJobApplication(id: $id, status: $status) {
      ${JOB_APPLICATION_FIELDS}
    }
  }
`;
