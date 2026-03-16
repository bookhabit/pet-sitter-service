'use client';

import { useUserJobApplicationsQuery } from '@/hooks/user';
import { EmptyBoundary } from '@/components/common/globalException/boundary';

import { UserApplicationsSection } from './UserApplicationsSection';
import { UserApplicationsEmptyView } from './exception/UserApplicationsEmptyView';

interface Props {
  userId: string;
}

/**
 * [Container] PetSitter 지원 공고 목록 데이터 연결
 *
 * 책임:
 *   - useUserJobApplicationsQuery 호출 → 지원 공고 목록 확보
 *   - UserApplicationsSection에 데이터 전달
 *
 * useSuspenseQuery를 사용하므로 반드시 Suspense + QueryErrorBoundary 안에서 렌더링됩니다.
 */
export function UserApplicationsContainer({ userId }: Props) {
  const { data: applications } = useUserJobApplicationsQuery(userId);

  return (
    <EmptyBoundary data={applications} fallback={<UserApplicationsEmptyView />}>
      <UserApplicationsSection applications={applications} />
    </EmptyBoundary>
  );
}
