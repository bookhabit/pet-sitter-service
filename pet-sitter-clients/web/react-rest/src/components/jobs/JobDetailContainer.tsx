import { useNavigate } from 'react-router-dom';

import { useJobQuery, useDeleteJobMutation } from '@/hooks/jobs';
import { useAuthStore } from '@/store/useAuthStore';

import { JobDetailView } from './JobDetailView';

interface Props {
  jobId: string;
}

/**
 * [Container] 구인공고 상세 데이터 연결 + 권한 분기
 *
 * 책임: useJobQuery 호출 → 작성자 여부 판단 → JobDetailView에 데이터 전달
 * 절대 금지: JSX 스타일링 로직, 화면 구성 결정
 */
export function JobDetailContainer({ jobId }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: job } = useJobQuery(jobId);
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJobMutation();

  const isOwner = job.creator_user_id === user?.id;

  const handleDelete = () => {
    deleteJob(jobId, {
      onSuccess: () => navigate('/jobs'),
    });
  };

  return (
    <JobDetailView job={job} isOwner={isOwner} onDelete={handleDelete} isDeleting={isDeleting} />
  );
}
