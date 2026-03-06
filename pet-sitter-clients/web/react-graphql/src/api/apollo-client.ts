import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
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

// 3. 에러 Link: UNAUTHENTICATED 감지 → clearAuth + 로그인 리다이렉트
// 서버 스키마에 refreshToken mutation이 없으므로 토큰 갱신 없이 로그아웃 처리
// Login / Register 같은 공개 operation은 에러를 hook catch로 전파 (폼 에러 처리)
const PUBLIC_OPERATIONS = new Set(['Login', 'Register']);

const errorLink = onError(({ response, operation }) => {
  const errors = response?.errors ?? [];
  const isUnauthenticated = errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED');

  if (!isUnauthenticated) return;

  // 공개 operation이면 에러를 그대로 hook으로 전파
  if (PUBLIC_OPERATIONS.has(operation.operationName)) return;

  useAuthStore.getState().clearAuth();
  window.location.href = '/login';
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
