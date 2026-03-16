'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { JobListContainer } from '@/components/jobs/JobListContainer';
import { JobListErrorView } from '@/components/jobs/exception/JobListErrorView';
import { JobListLoadingView } from '@/components/jobs/exception/JobListLoadingView';
import { Button, Flex, Spacing, Text } from '@/design-system';
import { useAuthStore } from '@/store/useAuthStore';
import { QueryErrorBoundary } from '@/components/common/globalException/boundary';

/**
 * [Page] 구인공고 목록 페이지
 *
 * Figma 디자인 반영:
 * - 상단 그라디언트 웰컴 배너 (파란색 → 보라색)
 * - PetOwner 전용 공고 등록 버튼
 * - 구인공고 목록 (JobListContainer 위임)
 *
 * 레이아웃 배치와 배너 렌더링만 담당합니다.
 * 데이터 로직은 JobListContainer에 위임합니다.
 */
export function JobsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const isPetOwner = user?.roles.includes('PetOwner') ?? false;
  const userName = user?.full_name ?? '';

  return (
    <div className="mx-auto max-w-[120rem] px-16 py-24">
      {/* 웰컴 배너 — Figma: 그라디언트 파랑→보라, rounded-2xl */}
      <div className="rounded-2xl bg-gradient-to-r from-[#155dfc] to-[#9810fa] px-24 py-24">
        <Text
          as="h1"
          size="t1"
          color="white"
          className="font-bold leading-[3.2rem] tracking-[0.007rem]"
        >
          안녕하세요, {userName}님! 👋
        </Text>
        <Spacing size={8} />
        <Text as="p" size="b1" className="text-[#eff6ff]">
          새로운 구인 공고를 확인하고 지원해보세요!
        </Text>
      </div>

      <Spacing size={24} />

      {/* PetOwner 전용 공고 등록 버튼 */}
      {isPetOwner && (
        <>
          <Flex justify="end">
            <Button size="md" onClick={() => router.push('/jobs/write')}>
              + 구인공고 등록
            </Button>
          </Flex>
          <Spacing size={16} />
        </>
      )}

      {/* 구인공고 목록 */}
      <QueryErrorBoundary fallback={JobListErrorView}>
        <Suspense fallback={<JobListLoadingView />}>
          <JobListContainer />
        </Suspense>
      </QueryErrorBoundary>
    </div>
  );
}
