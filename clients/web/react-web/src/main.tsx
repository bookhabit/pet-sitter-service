import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/common/globalException/boundary/ErrorBoundary.tsx';
import { GlobalErrorView } from './components/common/globalException/error/GlobalErrorView.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      throwOnError: true,
    },
    mutations: {
      throwOnError: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary fallback={(error) => <GlobalErrorView error={error} />}>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
