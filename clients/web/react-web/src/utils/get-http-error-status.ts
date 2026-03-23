/**
 * Axios error response에서 HTTP status code를 추출합니다.
 *
 * 서버가 응답을 반환했지만 2xx가 아닌 경우 Axios는 error.response.status에
 * HTTP 상태 코드를 담습니다. 네트워크 오류처럼 응답 자체가 없으면 undefined를 반환합니다.
 */
interface HttpErrorShape {
  response?: {
    status?: number;
  };
}

export function getHttpErrorStatus(error: unknown): number | undefined {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const shaped = error as HttpErrorShape;
    return shaped.response?.status;
  }
  return undefined;
}
