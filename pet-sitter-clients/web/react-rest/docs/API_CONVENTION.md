import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';

// 1. 타입 정의
interface CustomConfig extends AxiosRequestConfig {
schema?: z.ZodSchema;
\_retry?: boolean; // 토큰 재시도 플래그
}

const BASE_URL = "http://localhost:8000"

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
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
failedQueue.forEach((prom) => {
if (error) prom.reject(error);
else prom.resolve(token);
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
        const refreshToken = useAuthStore.getState().refreshToken;
        // 토큰 갱신 API 호출
        const res = await publicApi.post('/auth/refresh', { refreshToken });
        const { accessToken, newRefreshToken } = res.data;

        useAuthStore.getState().setAuth(accessToken, newRefreshToken);
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

}
);

// 6. 핵심: Zod 검증 통합 추출 함수
const validateResponse = <T>(res: AxiosResponse<T>, schema?: z.ZodSchema): T => {
if (schema) {
return schema.parse(res.data); // 검증 실패 시 ZodError 발생 -> ErrorBoundary로 전파
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
export const customInstance = <T>(config: AxiosRequestConfig, options?: { schema?: z.ZodSchema }): Promise<T> => {
// Orval은 주로 private한 API를 호출하므로 privateApi 기반으로 동작
return privateApi(config).then((res) => validateResponse(res as AxiosResponse<T>, options?.schema));
};

- 1. 스키마 정의 (`src/schemas/userSchema.ts`)
     서버에서 오는 데이터가 우리가 기대한 형태인지 검증하고 타입을 추출합니다.

  ```tsx
  import { z } from 'zod';

  // 단일 사용자 스키마
  export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    website: z.string().url(),
  });

  // 사용자 리스트 스키마 (배열)
  export const userListSchema = z.array(userSchema);

  export type User = z.infer<typeof userSchema>;
  ```

- 2. 서비스 레이어 (`src/services/userService.ts`)
     순수하게 네트워크 요청과 데이터 검증만 수행합니다.

  ```tsx
  import { userListSchema, User } from '../schemas/userSchema';

  export const userService = {
    getUsers: async (): Promise<User[]> => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');

      if (!response.ok) throw new Error('데이터 로드 실패');

      const data = await response.json();

      // Zod를 사용하여 서버 응답 데이터가 스키마와 일치하는지 검증 (런타임 안정성)
      return userListSchema.parse(data);
    }
  };
  ```

- 3. 서버 상태 관리 훅 (`src/hooks/queries/useUserQuery.ts`)
     TanStack Query를 통해 캐싱, 로딩, 에러 상태를 래핑합니다.

  ```tsx
  import { useQuery } from '@tanstack/react-query';
  import { userService } from '../../services/userService';

  export function useUserQuery() {
    return useQuery({
      queryKey: ['users'], // 캐시 키
      queryFn: userService.getUsers,
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 '신선'하다고 판단 (캐싱 최적화)
    });
  }
  ```
