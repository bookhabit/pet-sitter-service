'use client';

import { JobDetailContainer } from '@/components/jobs/JobDetailContainer';
import { PageAsyncBoundary } from '@/components/common/globalException/boundary';

interface Props {
  jobId: string;
}

export function JobDetailPage({ jobId }: Props) {
  return (
    <PageAsyncBoundary>
      <JobDetailContainer jobId={jobId} />
    </PageAsyncBoundary>
  );
}
