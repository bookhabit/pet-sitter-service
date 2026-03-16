'use client';

import { useUserJobsQuery } from '@/hooks/user';
import { EmptyBoundary } from '@/components/common/globalException/boundary';

import { UserJobsSection } from './UserJobsSection';
import { UserJobsEmptyView } from './exception/UserJobsEmptyView';

interface Props {
  userId: string;
}

/**
 * [Container] PetOwner 등록 공고 목록 데이터 연결
 *
 * 책임:
 *   - useUserJobsQuery 호출 → 등록 공고 목록 확보
 *   - UserJobsSection에 데이터 전달
 *
 * useSuspenseQuery를 사용하므로 반드시 Suspense + QueryErrorBoundary 안에서 렌더링됩니다.
 */
export function UserJobsContainer({ userId }: Props) {
  const { data: jobs } = useUserJobsQuery(userId);

  return (
    <EmptyBoundary data={jobs} fallback={<UserJobsEmptyView />}>
      <UserJobsSection jobs={jobs} />
    </EmptyBoundary>
  );
}
