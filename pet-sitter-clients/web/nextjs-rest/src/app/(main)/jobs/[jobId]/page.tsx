import { JobDetailPage } from '@/views/jobs/JobDetailPage';

interface Props {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailRoute({ params }: Props) {
  const { jobId } = await params;
  return <JobDetailPage jobId={jobId} />;
}
