import { useNavigate } from 'react-router-dom';

import { useJobQuery, useDeleteJobMutation } from '@/hooks/jobs';
import { useAuthStore } from '@/store/useAuthStore';
import { useOpenModal } from '@/store/useModalStore';

import { JobDetailView } from './JobDetailView';

interface Props {
  jobId: string;
}

/**
 * [Container] 구인공고 상세 데이터 연결 + 권한 분기
 *
 * 책임: useJobQuery 호출 → 작성자 여부 판단 → 모달 상태 관리 → JobDetailView에 데이터 전달
 * 절대 금지: JSX 스타일링 로직, 화면 구성 결정
 */
export function JobDetailContainer({ jobId }: Props) {
  const navigate = useNavigate();
  const openModal = useOpenModal();
  const user = useAuthStore((s) => s.user);

  const { data: job } = useJobQuery(jobId);
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJobMutation();

  const isOwner = job.creator_user_id === user?.id;

  const handleDeleteConfirmed = () => {
    deleteJob(jobId, {
      onSuccess: () => navigate('/jobs'),
    });
  };

  const handleDeleteClick = () => {
    openModal('confirm', {
      title: '구인공고 삭제',
      message: '구인공고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      cancelLabel: '취소',
      variant: 'danger',
      onConfirm: handleDeleteConfirmed,
    });
  };

  const handleEditClick = () => {
    openModal('confirm', {
      title: '구인공고 수정',
      message: '구인공고 수정 페이지로 이동하시겠습니까?',
      confirmLabel: '수정하기',
      cancelLabel: '취소',
      variant: 'primary',
      onConfirm: () => navigate(`/jobs/${jobId}/edit`),
    });
  };

  const handleNavigateBack = () => {
    navigate('/jobs');
  };

  return (
    <JobDetailView
      job={job}
      isOwner={isOwner}
      onDelete={handleDeleteClick}
      onEdit={handleEditClick}
      onNavigateBack={handleNavigateBack}
      isDeleting={isDeleting}
    />
  );
}
