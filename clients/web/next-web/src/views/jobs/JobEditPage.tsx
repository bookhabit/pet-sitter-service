'use client';

import JobEditForm from '@/components/jobs/JobEditForm';
import { PageAsyncBoundary } from '@/components/common/globalException/boundary';

interface Props {
  jobId: string;
}

/* [Page] 구인공고 수정 페이지
 *
 * - PetOwner(작성자) 전용
 * - Next.js App Router에서 jobId를 props로 전달받음
 */
export function JobEditPage({ jobId }: Props) {
  return (
    <PageAsyncBoundary>
      <JobEditForm jobId={jobId} />
    </PageAsyncBoundary>
  );
}
