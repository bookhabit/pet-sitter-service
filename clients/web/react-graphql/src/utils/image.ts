import { BASE_URL } from '@/api/apollo-client';

export const getFullImageUrl = (path: string) => {
  if (!path) return '';
  // 외부 링크(http)인 경우 그대로 반환, 아니면 서버 주소 결합
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
};
