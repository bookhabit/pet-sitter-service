'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/useAuthStore';
import { JobEditPage } from '@/views/jobs/JobEditPage';

interface Props {
  params: Promise<{ jobId: string }>;
}

/**
 * PetOwner 전용 라우트 — PetSitter가 접근 시 /jobs로 리다이렉트
 */
export default function JobEditRoute({ params }: Props) {
  const { jobId } = use(params);
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

  return <JobEditPage jobId={jobId} />;
}
