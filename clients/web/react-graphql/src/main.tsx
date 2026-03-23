import { ApolloProvider } from '@apollo/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { apolloClient } from './api/apollo-client.ts';
import { ErrorBoundary } from './components/common/globalException/boundary/ErrorBoundary.tsx';
import { GlobalErrorView } from './components/common/globalException/error/GlobalErrorView.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <ErrorBoundary fallback={(error) => <GlobalErrorView error={error} />}>
        <App />
      </ErrorBoundary>
    </ApolloProvider>
  </StrictMode>,
);
