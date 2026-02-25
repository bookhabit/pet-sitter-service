import { useNavigate } from 'react-router-dom';

import { JobListContainer } from '@/components/jobs/JobListContainer';
import { Button, Flex, Spacing, Text } from '@/design-system';
import { useLogoutMutation } from '@/hooks/auth';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * [Page] 구인공고 목록 페이지
 *
 * 레이아웃 배치와 페이지 헤더(로그아웃, 공고 등록) 연결만 담당합니다.
 * 데이터 로직은 JobListContainer에 위임합니다.
 */
export function JobsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const isPetOwner = user?.roles.includes('PetOwner') ?? false;

  return (
    <div className="mx-auto max-w-[60rem] px-24 py-32">
      {/* 헤더 */}
      <Flex justify="between" align="center">
        <Text as="h1" size="t1">
          구인공고 목록
        </Text>
        <Button variant="ghost" size="sm" isLoading={isLoggingOut} onClick={() => logout()}>
          로그아웃
        </Button>
      </Flex>

      <Spacing size={16} />

      {/* PetOwner 전용 공고 등록 버튼 */}
      {isPetOwner && (
        <>
          <Button size="lg" className="w-full" onClick={() => navigate('/jobs/write')}>
            + 구인공고 등록
          </Button>
          <Spacing size={16} />
        </>
      )}

      {/* 구인공고 목록 */}
      <JobListContainer />
    </div>
  );
}
