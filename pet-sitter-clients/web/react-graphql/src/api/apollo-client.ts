import { ApolloClient, InMemoryCache, HttpLink, from, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { useAuthStore } from '../store/useAuthStore';

export const GRAPHQL_URL = 'http://localhost:8000/graphql';

// 1. HTTP Link
const httpLink = new HttpLink({ uri: GRAPHQL_URL });

// 2. 토큰 갱신 관련 변수
let isRefreshing = false;
let pendingCallbacks: (() => void)[] = [];

const resolvePending = () => {
  pendingCallbacks.forEach((cb) => cb());
  pendingCallbacks = [];
};

// 3. 인증 Link: 모든 요청에 Bearer 토큰 주입
const authLink = setContext((_, { headers }: { headers?: Record<string, string> }) => {
  const token = useAuthStore.getState().token;
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// 4. 에러 Link: UNAUTHENTICATED 감지 → 토큰 갱신 → 재시도
const errorLink = onError(({ operation, forward, response }) => {
  const errors = response?.errors ?? [];
  const isUnauthenticated = errors.some(
    (e) => e.extensions?.code === 'UNAUTHENTICATED',
  );

  if (!isUnauthenticated) return;

  if (isRefreshing) {
    // 갱신 중인 경우 갱신 완료 후 재시도
    return new Observable((observer) => {
      pendingCallbacks.push(() => {
        forward(operation).subscribe(observer);
      });
    });
  }

  isRefreshing = true;

  return new Observable((observer) => {
    (async () => {
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const res = await fetch(GRAPHQL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              mutation RefreshToken($refreshToken: String!) {
                refreshToken(refreshToken: $refreshToken) {
                  accessToken
                  refreshToken
                }
              }
            `,
            variables: { refreshToken },
          }),
        });

        const json = await res.json();
        const { accessToken, refreshToken: newRefreshToken } = json.data.refreshToken;

        const currentUser = useAuthStore.getState().user!;
        useAuthStore.getState().setAuth(accessToken, newRefreshToken, currentUser);

        operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: { ...headers, Authorization: `Bearer ${accessToken}` },
        }));

        resolvePending();
        forward(operation).subscribe(observer);
      } catch {
        pendingCallbacks = [];
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        observer.error(new Error('Token refresh failed'));
      } finally {
        isRefreshing = false;
      }
    })();
  });
});

// 5. InMemoryCache: jobs 무한스크롤 merge 정책
export const apolloClient = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          jobs: {
            // cursor를 제외한 필터 파라미터로 캐시 키 분리
            keyArgs: [
              'activity',
              'sort',
              'start_time_before',
              'start_time_after',
              'end_time_before',
              'end_time_after',
              'pets_age_below',
              'pets_age_above',
              'pets_species',
              'min_price',
              'max_price',
            ],
            // fetchMore 호출 시 items 배열 자동 병합
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

// 6. 파일 업로드용 직접 fetch 헬퍼 (apollo-upload-client 미사용)
interface HttpErrorWithStatus extends Error {
  response: { status: number };
}

export async function uploadWithFetch<T>(url: string, formData: FormData): Promise<T> {
  const token = useAuthStore.getState().token;
  const response = await fetch(`http://localhost:8000${url}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Content-Type 미설정 → 브라우저가 multipart/form-data; boundary=... 자동 생성
    },
    body: formData,
  });

  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}`) as HttpErrorWithStatus;
    err.response = { status: response.status };
    throw err;
  }

  return response.json() as Promise<T>;
}
