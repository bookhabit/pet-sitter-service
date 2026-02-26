import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { QueryErrorBoundary } from './QueryErrorBoundary';
import { PageLoadingView } from '../loading';
import { PageErrorView } from '../error';

/**
 * [Layout Route] 페이지 단위 에러 + 로딩 래퍼
 *
 * App.tsx 라우트 트리에서 레이아웃 라우트로 삽입합니다.
 * - QueryErrorBoundary: 쿼리 에러 캐치 + 재시도 처리
 * - Suspense: useSuspenseQuery / useSuspenseInfiniteQuery 로딩 처리
 */
export function PageAsyncBoundary() {
  return (
    <QueryErrorBoundary fallback={PageErrorView}>
      <Suspense fallback={<PageLoadingView />}>
        <Outlet />
      </Suspense>
    </QueryErrorBoundary>
  );
}
