import { Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Divider, Flex, Spacing, Text } from '@/design-system';
import { QueryErrorBoundary } from '@/components/common/globalException/boundary';
import { JobApplicationsContainer } from '@/components/jobs/JobApplicationsContainer';
import { JobApplicationsLoadingView } from '@/components/jobs/exception/JobApplicationsLoadingView';
import { JobApplicationsErrorView } from '@/components/jobs/exception/JobApplicationsErrorView';

/**
 * [Page] 지원자 관리 페이지
 *
 * - URL: /jobs/:jobId/applications
 * - PetOwner(작성자) 전용 접근 (RoleGuard는 App.tsx에서 처리)
 * - jobId를 URL params에서 추출해 JobApplicationsContainer에 전달
 */
export function JobApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  if (!jobId) {
    navigate('/jobs', { replace: true });
    return null;
  }

  const handleNavigateBack = () => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="mx-auto max-w-[60rem] px-16 py-24">
      {/* 뒤로가기 */}
      <Button variant="ghost" size="sm" onClick={handleNavigateBack}>
        ← 공고로 돌아가기
      </Button>

      <Spacing size={24} />

      <Flex direction="column" gap={8}>
        <Text as="h1" size="t1" className="font-bold">
          지원자 관리
        </Text>
      </Flex>

      <Spacing size={24} />
      <Divider />
      <Spacing size={24} />

      <QueryErrorBoundary fallback={JobApplicationsErrorView}>
        <Suspense fallback={<JobApplicationsLoadingView />}>
          <JobApplicationsContainer jobId={jobId} />
        </Suspense>
      </QueryErrorBoundary>
    </div>
  );
}
