'use client';

import { Suspense } from 'react';

import { QueryErrorBoundary } from './QueryErrorBoundary';
import { PageLoadingView } from '../loading';
import { PageErrorView } from '../error';

interface Props {
  children: React.ReactNode;
}

/**
 * [Wrapper Component] 페이지 단위 에러 + 로딩 래퍼
 *
 * Next.js App Router에서는 Outlet 대신 children prop을 사용합니다.
 * - QueryErrorBoundary: 쿼리 에러 캐치 + 재시도 처리
 * - Suspense: useSuspenseQuery / useSuspenseInfiniteQuery 로딩 처리
 */
export function PageAsyncBoundary({ children }: Props) {
  return (
    <QueryErrorBoundary fallback={PageErrorView}>
      <Suspense fallback={<PageLoadingView />}>
        {children}
      </Suspense>
    </QueryErrorBoundary>
  );
}
