'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/useAuthStore';
import { JobCreatePage } from '@/views/jobs/JobCreatePage';

/**
 * PetOwner 전용 라우트 — PetSitter가 접근 시 /jobs로 리다이렉트
 */
export default function JobWriteRoute() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isPetOwner = user?.roles.includes('PetOwner') ?? false;

  useEffect(() => {
    if (user && !isPetOwner) {
      router.replace('/jobs');
    }
  }, [user, isPetOwner, router]);

  if (!user || !isPetOwner) {
    return null;
  }

  return <JobCreatePage />;
}
