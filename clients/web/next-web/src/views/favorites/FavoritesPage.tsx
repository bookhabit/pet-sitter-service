'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { FavoritesContainer } from '@/components/favorites/FavoritesContainer';
import { FavoritesErrorView } from '@/components/favorites/exception/FavoritesErrorView';
import { FavoritesLoadingView } from '@/components/favorites/exception/FavoritesLoadingView';
import { Button, Flex, Spacing, Text } from '@/design-system';
import { QueryErrorBoundary } from '@/components/common/globalException/boundary';

/**
 * [Page] 즐겨찾기 목록 페이지 (PetSitter 전용)
 *
 * 레이아웃 배치와 페이지 헤더 연결만 담당합니다.
 * 데이터 로직은 FavoritesContainer에 위임합니다.
 */
export function FavoritesPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-[60rem] px-24 py-32">
      {/* 헤더 */}
      <Flex justify="between" align="center">
        <Text as="h1" size="t1">
          즐겨찾기
        </Text>
        <Button variant="ghost" size="sm" onClick={() => router.push('/jobs')}>
          구인공고 목록
        </Button>
      </Flex>

      <Spacing size={24} />

      {/* 즐겨찾기 목록 */}
      <QueryErrorBoundary fallback={FavoritesErrorView}>
        <Suspense fallback={<FavoritesLoadingView />}>
          <FavoritesContainer />
        </Suspense>
      </QueryErrorBoundary>
    </div>
  );
}
