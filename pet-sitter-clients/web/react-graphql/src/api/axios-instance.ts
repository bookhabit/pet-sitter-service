import axios from 'axios';
import { z } from 'zod';

import { useAuthStore } from '../store/useAuthStore';

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 1. 타입 정의
interface CustomConfig extends AxiosRequestConfig {
  schema?: z.ZodSchema;
  _retry?: boolean; // 토큰 재시도 플래그
}

export const BASE_URL = 'http://localhost:8000';

// 2. 공통 설정
const BASE_CONFIG = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
};

// 3. 인스턴스 생성
export const publicApi: AxiosInstance = axios.create(BASE_CONFIG);
export const privateApi: AxiosInstance = axios.create(BASE_CONFIG);

// --- 토큰 갱신 관련 변수 ---
interface QueueEntry {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((entry) => {
    if (error) entry.reject(error);
    else entry.resolve(token!);
  });
  failedQueue = [];
};

// 4. 요청 인터셉터: 토큰 주입
privateApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 5. 응답 인터셉터: 401 에러 처리 & 토큰 갱신
privateApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as CustomConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return privateApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Access token expired. Attempting to refresh...');
        const refreshToken = useAuthStore.getState().refreshToken;
        // 토큰 갱신 API 호출
        const res = await publicApi.post('/sessions/refresh', { refreshToken });
        const { accessToken, newRefreshToken } = res.data;

        // 토큰 갱신 시 사용자 정보는 유지 (변경 없음)
        const currentUser = useAuthStore.getState().user!;
        useAuthStore.getState().setAuth(accessToken, newRefreshToken, currentUser);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return privateApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// 6. 핵심: Zod 검증 통합 추출 함수
const validateResponse = <T>(res: AxiosResponse<T>, schema?: z.ZodSchema): T => {
  if (schema) {
    try {
      return schema.parse(res.data) as T;
    } catch (e) {
      console.error('🔥 ZOD VALIDATION FAILED');
      console.error('response data →', res.data);
      console.error(e);
    }
  }
  return res.data;
};

// 7. 서비스에서 사용할 최종 http 객체
export const http = {
  auth: {
    post: <T>(url: string, data?: object, schema?: z.ZodSchema): Promise<T> =>
      publicApi.post<T>(url, data).then((res) => validateResponse(res, schema)),
  },
  get: <T>(url: string, params?: object, schema?: z.ZodSchema): Promise<T> =>
    privateApi.get<T>(url, { params }).then((res) => validateResponse(res, schema)),

  post: <T>(url: string, data?: object, schema?: z.ZodSchema): Promise<T> =>
    privateApi.post<T>(url, data).then((res) => validateResponse(res, schema)),

  put: <T>(url: string, data?: object, schema?: z.ZodSchema): Promise<T> =>
    privateApi.put<T>(url, data).then((res) => validateResponse(res, schema)),

  delete: <T>(url: string, schema?: z.ZodSchema): Promise<T> =>
    privateApi.delete<T>(url).then((res) => validateResponse(res, schema)),
};

// 8. Orval용 커스텀 인스턴스 (선택 사항)
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: { schema?: z.ZodSchema },
): Promise<T> => {
  // Orval은 주로 private한 API를 호출하므로 privateApi 기반으로 동작
  return privateApi(config).then((res) =>
    validateResponse(res as AxiosResponse<T>, options?.schema),
  );
};
