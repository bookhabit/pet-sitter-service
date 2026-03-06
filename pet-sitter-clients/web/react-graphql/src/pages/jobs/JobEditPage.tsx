import { useNavigate, useParams } from 'react-router-dom';

import JobEditForm from '@/components/jobs/JobEditForm';

/* [Page] 구인공고 수정 페이지
 *
 * - PetOwner(작성자) 또는 Admin 만 접근 가능
 * - RoleGuard 는 App.tsx 라우트 선언부에서 처리
 * - URL params 에서 jobId 를 추출해 JobEditForm 에 전달
 */
export function JobEditPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  if (!jobId) {
    navigate('/jobs', { replace: true });
    return null;
  }

  return <JobEditForm jobId={jobId} />;
}
