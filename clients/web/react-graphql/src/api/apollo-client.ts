import { ApolloClient, InMemoryCache, HttpLink, from, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { useAuthStore } from '../store/useAuthStore';

export const BASE_URL = 'http://localhost:8000';
export const GRAPHQL_URL = `${BASE_URL}/graphql`;

// 1. HTTP Link
const httpLink = new HttpLink({ uri: GRAPHQL_URL });

// 2. 인증 Link: 모든 요청에 Bearer 토큰 주입
const authLink = setContext((_, { headers }: { headers?: Record<string, string> }) => {
  const token = useAuthStore.getState().token;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// --- 토큰 갱신 관련 변수 (동시 요청 큐) ---
let isRefreshing = false;
let pendingObservers: Array<(token: string | null) => void> = [];

const notifyPending = (token: string | null) => {
  pendingObservers.forEach((cb) => cb(token));
  pendingObservers = [];
};

const refreshTokens = (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingObservers.push(resolve);
    });
  }

  isRefreshing = true;
  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    isRefreshing = false;
    return Promise.resolve(null);
  }

  return fetch(`${BASE_URL}/sessions/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Refresh failed');
      return res.json() as Promise<{ accessToken: string; newRefreshToken: string }>;
    })
    .then(({ accessToken, newRefreshToken }) => {
      const currentUser = useAuthStore.getState().user!;
      useAuthStore.getState().setAuth(accessToken, newRefreshToken, currentUser);
      notifyPending(accessToken);
      return accessToken;
    })
    .catch(() => {
      notifyPending(null);
      return null;
    })
    .finally(() => {
      isRefreshing = false;
    });
};

// 3. 에러 Link: UNAUTHENTICATED 감지 → 토큰 갱신 후 재시도
// Login / Register 같은 공개 operation은 에러를 hook catch로 전파 (폼 에러 처리)
const PUBLIC_OPERATIONS = new Set(['Login', 'Register']);

const errorLink = onError(({ response, operation, forward }) => {
  const errors = response?.errors ?? [];
  const isUnauthenticated = errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED');

  if (!isUnauthenticated) return;

  // 공개 operation이면 에러를 그대로 hook으로 전파
  if (PUBLIC_OPERATIONS.has(operation.operationName)) return;

  return new Observable((observer) => {
    refreshTokens()
      .then((newToken) => {
        if (!newToken) {
          useAuthStore.getState().clearAuth();
          window.location.href = '/login';
          observer.error(new Error('Session expired'));
          return;
        }

        // 새 토큰으로 헤더 갱신 후 원래 요청 재시도
        operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        }));

        forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch((err) => observer.error(err));
  });
});

// 4. InMemoryCache: jobs 무한스크롤 merge 정책
export const apolloClient = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          jobs: {
            // filter 인수로 캐시 키 분리, pagination(cursor)은 제외 → 같은 캐시에 누적
            keyArgs: ['filter'],
            merge(
              existing: { items: unknown[]; pageInfo: unknown } | undefined,
              incoming: { items: unknown[]; pageInfo: unknown },
            ) {
              if (!existing) return incoming;
              return {
                ...incoming,
                items: [...existing.items, ...incoming.items],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
