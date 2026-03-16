'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useJobApplicationsQuery, useUpdateJobApplicationMutation } from '@/hooks/job-applications';
import { useOpenModal } from '@/store/useModalStore';
import { EmptyBoundary } from '@/components/common/globalException/boundary';

import { JobApplicationsSection } from './JobApplicationsSection';
import { JobApplicationsEmptyView } from './exception/JobApplicationsEmptyView';

interface Props {
  jobId: string;
}

/**
 * [Container] 지원자 목록 데이터 + 상태 변경 로직 (PetOwner 전용)
 *
 * 책임:
 *   - useJobApplicationsQuery 호출 → 지원자 목록 확보
 *   - useUpdateJobApplicationMutation 호출 → 승인/거절 mutation
 *   - 승인/거절 클릭 시 확인 모달 오픈 → 확인 시 mutation 실행
 *   - JobApplicationsSection에 데이터 + 핸들러 전달
 *
 * useSuspenseQuery를 사용하므로 반드시 Suspense + QueryErrorBoundary 안에서 렌더링됩니다.
 */
export function JobApplicationsContainer({ jobId }: Props) {
  const router = useRouter();
  const openModal = useOpenModal();

  const { data } = useJobApplicationsQuery(jobId);
  const { mutate: updateApplication, isPending } = useUpdateJobApplicationMutation(jobId);

  // 현재 상태 변경 중인 지원 ID (버튼 개별 비활성화에 사용)
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleApproveClick = (jobApplicationId: string) => {
    openModal('confirm', {
      title: '지원 승인',
      message: '이 지원자를 승인하시겠습니까?',
      confirmLabel: '승인',
      cancelLabel: '취소',
      variant: 'primary',
      onConfirm: () => {
        setUpdatingId(jobApplicationId);
        updateApplication(
          { jobApplicationId, data: { status: 'approved' } },
          { onSettled: () => setUpdatingId(null) },
        );
      },
    });
  };

  const handleRejectClick = (jobApplicationId: string) => {
    openModal('confirm', {
      title: '지원 거절',
      message: '이 지원자를 거절하시겠습니까?',
      confirmLabel: '거절',
      cancelLabel: '취소',
      variant: 'danger',
      onConfirm: () => {
        setUpdatingId(jobApplicationId);
        updateApplication(
          { jobApplicationId, data: { status: 'rejected' } },
          { onSettled: () => setUpdatingId(null) },
        );
      },
    });
  };

  const handleMessageClick = (jobApplicationId: string) => {
    router.push(`/chat/application/${jobApplicationId}`);
  };

  const applications = data.items;

  return (
    <EmptyBoundary data={applications} fallback={<JobApplicationsEmptyView />}>
      <JobApplicationsSection
        applications={applications}
        updatingId={isPending ? updatingId : null}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
        onMessage={handleMessageClick}
      />
    </EmptyBoundary>
  );
}
