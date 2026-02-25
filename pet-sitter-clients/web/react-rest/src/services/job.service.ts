import { http } from '../api/axios-instance';

import { paginatedJobsSchema } from '../schemas/job.schema';

import type { JobsQueryParams, PaginatedJobs } from '../schemas/job.schema';

/**
 * GET /jobs — 구인공고 목록 조회 (필터/커서 페이지네이션)
 */
export const jobService = {
  getJobs: (params?: JobsQueryParams): Promise<PaginatedJobs> =>
    http.get<PaginatedJobs>('/jobs', params, paginatedJobsSchema),
};
