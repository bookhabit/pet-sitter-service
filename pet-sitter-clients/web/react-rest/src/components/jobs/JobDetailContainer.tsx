import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useJobQuery, useDeleteJobMutation } from '@/hooks/jobs';
import { useApplyJobMutation } from '@/hooks/job-applications';
import { useAuthStore } from '@/store/useAuthStore';
import { useOpenModal } from '@/store/useModalStore';

import { JobDetailView } from './JobDetailView';

import type { ApproveStatus } from '@/schemas/job-application.schema';

interface Props {
  jobId: string;
}

/**
 * [Container] 구인공고 상세 데이터 연결 + 권한 분기
 *
 * 책임:
 *   - useJobQuery 호출 → 공고 데이터 확보
 *   - 작성자 여부(isOwner), 역할(isPetSitter) 판단
 *   - PetSitter 지원 mutation 상태 관리
 *   - PetOwner 지원자 관리 페이지 이동 핸들러 제공
 *   - JobDetailView에 데이터 + 핸들러 전달
 *
 * 절대 금지: JSX 스타일링 로직, 화면 구성 결정
 */
export function JobDetailContainer({ jobId }: Props) {
  const navigate = useNavigate();
  const openModal = useOpenModal();
  const user = useAuthStore((s) => s.user);

  const { data: job } = useJobQuery(jobId);
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteJobMutation();
  const { mutate: applyJob, isPending: isApplying } = useApplyJobMutation(jobId);

  const isOwner = job.creator_user_id === user?.id;
  const isPetSitter = user?.roles.includes('PetSitter') ?? false;

  // PetSitter 지원 후 보여줄 상태. null = 미지원 / 지원 완료 시 서버 응답으로 갱신
  const [appliedStatus, setAppliedStatus] = useState<ApproveStatus | null>(null);
  const [applyErrorMessage, setApplyErrorMessage] = useState<string | null>(null);

  const handleApplyConfirmed = () => {
    setApplyErrorMessage(null);
    applyJob(undefined, {
      onSuccess: () => {
        // 지원 직후 'applying' 상태로 표시 (쿼리 갱신 전까지의 낙관적 표시)
        setAppliedStatus('applying');
      },
      onError: (error) => {
        setApplyErrorMessage(
          error instanceof Error ? error.message : '지원 중 오류가 발생했습니다.',
        );
      },
    });
  };

  const handleApplyClick = () => {
    openModal('confirm', {
      title: '지원하기',
      message: '이 공고에 지원하시겠습니까?',
      confirmLabel: '지원하기',
      cancelLabel: '취소',
      variant: 'primary',
      onConfirm: handleApplyConfirmed,
    });
  };

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

  const handleNavigateToApplications = () => {
    navigate(`/jobs/${jobId}/applications`);
  };

  return (
    <JobDetailView
      job={job}
      isOwner={isOwner}
      isPetSitter={isPetSitter}
      appliedStatus={appliedStatus}
      isApplying={isApplying}
      applyErrorMessage={applyErrorMessage}
      onApply={handleApplyClick}
      onDelete={handleDeleteClick}
      onEdit={handleEditClick}
      onNavigateBack={handleNavigateBack}
      onNavigateToApplications={handleNavigateToApplications}
      isDeleting={isDeleting}
    />
  );
}
