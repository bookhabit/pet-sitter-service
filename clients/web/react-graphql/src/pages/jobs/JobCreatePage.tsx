import JobWriteForm from '@/components/jobs/JobCreateForm';

/* [Page] 구인공고 등록 페이지
 *
 * - PetOwner만 접근 가능
 * - Naviagatore에서 Guard 설정(<RoleGuard allowedRoles={['PetOwner']} />)
 * - JobWriteForm 컴포넌트 렌더링
 */

export function JobCreatePage() {
  return <JobWriteForm />;
}
