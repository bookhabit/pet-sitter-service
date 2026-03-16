'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  fallback: (props: { error: Error; reset: () => void }) => ReactNode;
  children: ReactNode;
}

export function QueryErrorBoundary({ fallback, children }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset: resetQueries }) => (
        <ErrorBoundary
          fallback={(error, resetBoundary) => {
            const reset = () => {
              resetQueries();
              resetBoundary();
            };
            return fallback({ error, reset });
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
