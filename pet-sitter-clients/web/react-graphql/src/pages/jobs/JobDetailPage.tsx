import { useNavigate, useParams } from 'react-router-dom';

import { JobDetailContainer } from '@/components/jobs/JobDetailContainer';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  if (!jobId) {
    navigate('/jobs', { replace: true });
    return null;
  }

  return <JobDetailContainer jobId={jobId} />;
}
