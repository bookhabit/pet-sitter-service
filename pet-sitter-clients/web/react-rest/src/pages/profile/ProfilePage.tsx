import { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Flex, Spacing, Text } from '@/design-system';
import { QueryErrorBoundary } from '@/components/common/globalException/boundary';
import { UserJobsContainer } from '@/components/profile/UserJobsContainer';
import { UserApplicationsContainer } from '@/components/profile/UserApplicationsContainer';
import { UserJobsLoadingView } from '@/components/profile/exception/UserJobsLoadingView';
import { UserJobsErrorView } from '@/components/profile/exception/UserJobsErrorView';
import { UserApplicationsLoadingView } from '@/components/profile/exception/UserApplicationsLoadingView';
import { UserApplicationsErrorView } from '@/components/profile/exception/UserApplicationsErrorView';
import { ProfileContainer } from '@/components/profile/ProfileContainer';
import { useAuthStore } from '@/store/useAuthStore';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const isMe = userId === 'me' || userId === user?.id;

  // 본인 프로필이 아닌 경우 userId 파라미터를, 본인이면 store의 id를 사용
  const resolvedUserId = isMe ? user?.id : userId;

  const isPetOwner = user?.roles.includes('PetOwner') ?? false;
  const isPetSitter = user?.roles.includes('PetSitter') ?? false;

  return (
    <Flex direction="column" className="mx-auto max-w-[60rem] px-24 py-24">
      <Text size="t1" as="h1" className="mb-8">
        {isMe ? '내 프로필' : `사용자 프로필`}
      </Text>

      <Spacing size={16} />

      {/* 프로필 카드 — API 기반 조회 + 수정 */}
      {resolvedUserId && <ProfileContainer userId={resolvedUserId} isMe={isMe} />}

      <Spacing size={24} />

      {/* 역할별 목록 섹션 — 본인 프로필이고 userId가 확정된 경우에만 표시 */}
      {isMe && resolvedUserId && (
        <>
          {/* PetOwner: 등록한 구인공고 목록 */}
          {isPetOwner && (
            <>
              <QueryErrorBoundary fallback={UserJobsErrorView}>
                <Suspense fallback={<UserJobsLoadingView />}>
                  <UserJobsContainer userId={resolvedUserId} />
                </Suspense>
              </QueryErrorBoundary>

              <Spacing size={32} />
            </>
          )}

          {/* PetSitter: 지원한 공고 목록 */}
          {isPetSitter && (
            <QueryErrorBoundary fallback={UserApplicationsErrorView}>
              <Suspense fallback={<UserApplicationsLoadingView />}>
                <UserApplicationsContainer userId={resolvedUserId} />
              </Suspense>
            </QueryErrorBoundary>
          )}

          <Spacing size={32} />
        </>
      )}

      {/* 로그아웃 버튼 */}
      {isMe && (
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          onClick={() => {
            clearAuth();
            navigate('/login', { replace: true });
          }}
        >
          로그아웃
        </Button>
      )}
    </Flex>
  );
}
