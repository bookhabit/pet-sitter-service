'use client';

import { useEffect, useRef } from 'react';

import { Flex, Spacing, Spinner } from '@/design-system';

import { JobCard } from './JobCard';

import type { Job } from '@/schemas/job.schema';

interface Props {
  jobs: Job[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  /** 현재 유저가 PetSitter 역할을 가지고 있는지 여부 */
  isPetSitter: boolean;
  /** PetSitter의 즐겨찾기 jobId Set — O(1) 포함 여부 확인 */
  favoriteJobIds: Set<string>;
  /** 즐겨찾기 토글 핸들러 */
  onToggleFavorite: (jobId: string) => void;
}

/**
 * [View] 구인공고 목록 — 순수 UI 표현만 담당
 * 데이터 로직 없음, props 렌더링만 수행
 * Intersection Observer 기반 무한스크롤 적용
 */
export function JobListView({
  jobs,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  isPetSitter,
  favoriteJobIds,
  onToggleFavorite,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <>
      {/* 구인공고 그리드 — Figma: 3열 카드 레이아웃, gap-16 */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isPetSitter={isPetSitter}
            isFavorited={favoriteJobIds.has(job.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* 무한스크롤 sentinel + 로딩 스피너 */}
      {hasNextPage && (
        <>
          <Spacing size={24} />
          <div ref={sentinelRef}>
            {isFetchingNextPage && (
              <Flex justify="center" align="center" className="py-16">
                <Spinner size={24} color="primary" />
              </Flex>
            )}
          </div>
        </>
      )}

      {/* 목록 끝 안내 */}
      {!hasNextPage && jobs.length > 0 && (
        <>
          <Spacing size={24} />
        </>
      )}
    </>
  );
}
