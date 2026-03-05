import { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Spacing } from '@/design-system';
import { QueryErrorBoundary } from '@/components/common/globalException/boundary';
import { UserJobsContainer } from '@/components/profile/UserJobsContainer';
import { UserApplicationsContainer } from '@/components/profile/UserApplicationsContainer';
import { UserJobsLoadingView } from '@/components/profile/exception/UserJobsLoadingView';
import { UserJobsErrorView } from '@/components/profile/exception/UserJobsErrorView';
import { UserApplicationsLoadingView } from '@/components/profile/exception/UserApplicationsLoadingView';
import { UserApplicationsErrorView } from '@/components/profile/exception/UserApplicationsErrorView';
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
    <div style={{ padding: '2.4rem', maxWidth: '60rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.8rem' }}>
        {isMe ? '내 프로필' : `사용자 프로필 #${userId}`}
      </h1>

      {/* 프로필 정보 카드 */}
      <div
        style={{
          padding: '2.0rem',
          backgroundColor: 'white',
          borderRadius: '1.2rem',
          border: '1px solid var(--grey200)',
          marginBottom: '2.4rem',
        }}
      >
        {isMe && user ? (
          <>
            <p style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {user.full_name}
            </p>
            <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>
              역할: {user.roles.join(', ')}
            </p>
          </>
        ) : (
          <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>
            [Prototype] 사용자 프로필 미구현
          </p>
        )}
      </div>

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
        <button
          onClick={() => {
            clearAuth();
            navigate('/login', { replace: true });
          }}
          style={{
            width: '100%',
            padding: '1.6rem',
            backgroundColor: 'white',
            color: 'var(--red500, #ef4444)',
            border: '1px solid var(--red500, #ef4444)',
            borderRadius: '1.2rem',
            fontSize: '1.6rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      )}
    </div>
  );
}
