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
 * 구인공고 지원 (PetSitter 전용)
 *
 * 서버 스키마: applyToJob(jobId: String!): JobApplicationModel!
 */
export const APPLY_JOB = gql`
  mutation ApplyToJob($jobId: String!) {
    applyToJob(jobId: $jobId) {
      ${JOB_APPLICATION_FIELDS}
    }
  }
`;

/**
 * 지원 상태 수정 (공고 작성자만)
 *
 * 서버 스키마: updateJobApplicationStatus(data: UpdateJobApplicationInput!, id: String!): JobApplicationModel!
 * UpdateJobApplicationInput: { status: ApproveStatus! }
 */
export const UPDATE_JOB_APPLICATION = gql`
  mutation UpdateJobApplicationStatus($id: String!, $data: UpdateJobApplicationInput!) {
    updateJobApplicationStatus(id: $id, data: $data) {
      ${JOB_APPLICATION_FIELDS}
    }
  }
`;
