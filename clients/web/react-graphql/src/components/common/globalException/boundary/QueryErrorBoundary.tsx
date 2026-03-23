import type { ReactNode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  fallback: (props: { error: Error; reset: () => void }) => ReactNode;
  children: ReactNode;
}

/**
 * Apollo Client에서는 QueryErrorResetBoundary가 없으므로
 * 에러 발생 시 ErrorBoundary만 리셋합니다.
 * (Apollo의 캐시는 에러 발생 시 자동으로 정리됩니다.)
 */
export function QueryErrorBoundary({ fallback, children }: Props) {
  return (
    <ErrorBoundary
      fallback={(error, resetBoundary) => fallback({ error, reset: resetBoundary })}
    >
      {children}
    </ErrorBoundary>
  );
}
