import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '@/config/apiBaseUrl';

// privateApi: 인증이 필요한 모든 요청에 사용
// Request Interceptor:  Authorization 헤더 자동 주입
// Response Interceptor: 401 발생 시 토큰 갱신 → 재시도 → 실패 시 로그아웃

export const privateApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Request Interceptor ───────────────────────────────────────────────────
// 매 요청 전에 SecureStore에서 access_token을 읽어 헤더에 주입
// SecureStore는 비동기이기 때문에 interceptor를 async로 처리
privateApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────
// 401 응답: refresh_token으로 새 access_token 발급 → 원래 요청 재시도
// refresh도 실패 시: 저장된 토큰 삭제 (로그아웃 처리는 useAuthStore에서 감지)
let isRefreshing = false;
// failedQueue: refresh 중에 들어온 다른 요청들을 쌓아두었다가 갱신 후 일괄 재시도
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
}

privateApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401이 아니거나 이미 재시도한 요청은 그냥 에러 전파
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // 이미 refresh 중이면 큐에 대기
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return privateApi(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (!refreshToken) throw new Error('refresh_token not found');

      // POST /sessions/refresh → { accessToken, newRefreshToken }
      const { data } = await axios.post(`${API_BASE_URL}/sessions/refresh`, {
        refresh_token: refreshToken,
      });

      const newAccessToken: string = data.accessToken;
      const newRefreshToken: string = data.newRefreshToken;

      // 새 토큰을 SecureStore에 저장
      await SecureStore.setItemAsync('access_token', newAccessToken);
      await SecureStore.setItemAsync('refresh_token', newRefreshToken);

      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return privateApi(originalRequest);
    } catch (refreshError) {
      // refresh 실패 → 저장된 토큰 삭제
      processQueue(refreshError, null);
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
