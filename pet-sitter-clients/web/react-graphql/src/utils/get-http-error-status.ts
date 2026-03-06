import { ApolloError } from '@apollo/client';

/**
 * Apollo / fetch 에러에서 HTTP status code를 추출합니다.
 *
 * - ApolloError: graphQLErrors[0].extensions.status 또는 networkError.statusCode
 * - fetch 직접 호출 에러(uploadWithFetch): error.response.status
 * - 응답 자체가 없으면 undefined를 반환합니다.
 */
interface HttpErrorShape {
  response?: {
    status?: number;
  };
}

interface NetworkErrorWithStatus {
  statusCode?: number;
}

export function getHttpErrorStatus(error: unknown): number | undefined {
  // Apollo 에러: GraphQL 에러의 extensions.status
  if (error instanceof ApolloError) {
    const gqlStatus = error.graphQLErrors[0]?.extensions?.status;
    if (typeof gqlStatus === 'number') return gqlStatus;

    // Apollo 에러: 네트워크 에러의 statusCode
    const networkError = error.networkError as NetworkErrorWithStatus | null;
    if (typeof networkError?.statusCode === 'number') return networkError.statusCode;

    return undefined;
  }

  // fetch 직접 호출 에러 (uploadWithFetch): error.response.status
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const shaped = error as HttpErrorShape;
    return shaped.response?.status;
  }

  return undefined;
}
