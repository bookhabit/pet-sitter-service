# Orval API Code Generation

> OpenAPI(Swagger) 명세를 읽어 **TypeScript 타입 + Axios 서비스 함수 + React Query 훅**을 자동 생성한다.

---

## 사용 방법

```bash
# 백엔드 서버 실행 상태에서
npm run api:gen
```

| 스크립트 | 설명 |
|---|---|
| `api:gen` | `orval` 실행 후 `api:format` 자동 호출 |
| `api:format` | 생성된 코드에 Prettier 적용 |

```jsonc
// package.json
{
  "scripts": {
    "api:gen": "orval && npm run api:format",
    "api:format": "prettier --write \"src/api/generated/**/*.ts\" \"src/api/model/**/*.ts\""
  }
}
```

---

## Orval 설정

```js
// orval.config.cjs
module.exports = {
  'pet-sitter-server': {
    input: 'http://localhost:8000/api-json',  // Swagger JSON 엔드포인트
    output: {
      mode: 'tags-split',                     // API 태그별 파일 분할
      target: './src/api/generated',           // 훅 + 서비스 함수 생성 위치
      schemas: './src/api/model',              // TypeScript 타입 생성 위치
      client: 'react-query',                   // TanStack Query v5 훅 생성
      mock: false,
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',  // 커스텀 Axios 인스턴스
          name: 'customInstance',
        },
      },
    },
  },
};
```

---

## 생성되는 폴더 구조

```
src/api/
├── axios-instance.ts          # 직접 작성 (Orval이 건드리지 않음)
├── model/                     # 자동 생성: TypeScript 인터페이스
│   ├── index.ts               # 모든 타입 re-export
│   ├── jobModel.ts
│   ├── createJobDto.ts
│   ├── paginatedJobs.ts
│   ├── userModel.ts
│   ├── loginDto.ts
│   ├── authPayload.ts
│   ├── toggleFavoriteDto.ts
│   └── ...                    # (총 56개 타입 파일)
│
└── generated/                 # 자동 생성: 서비스 함수 + React Query 훅
    ├── jobs/jobs.ts
    ├── users/users.ts
    ├── sessions/sessions.ts
    ├── favorites/favorites.ts
    ├── job-applications/job-applications.ts
    ├── photos/photos.ts
    ├── reviews/reviews.ts
    ├── chat/chat.ts
    └── app/app.ts
```

---

## 생성 코드의 3층 구조

각 엔드포인트마다 동일한 패턴으로 **3개 레이어**가 생성된다.

### GET 요청 (Query)

```
[1층] 서비스 함수          jobsControllerFindAll()
         ↓
[2층] QueryKey 팩토리      getJobsControllerFindAllQueryKey()
      QueryOptions 팩토리  getJobsControllerFindAllQueryOptions()
         ↓
[3층] React Query 훅       useJobsControllerFindAll()
```

### POST/PUT/DELETE 요청 (Mutation)

```
[1층] 서비스 함수               jobsControllerCreate()
         ↓
[2층] MutationOptions 팩토리    getJobsControllerCreateMutationOptions()
         ↓
[3층] React Query 훅            useJobsControllerCreate()
```

---

## 레이어별 상세 설명

### 1층: 서비스 함수 (API Fetcher)

`customInstance`를 호출하는 순수 함수. Axios 요청의 실체.

```ts
// GET 예시 — 즐겨찾기 목록
export const favoritesControllerFindAll = (
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal,
) => {
  return customInstance<JobModel[]>(
    { url: `/favorites`, method: 'GET', signal },
    options,
  );
};

// POST 예시 — 즐겨찾기 토글
export const favoritesControllerToggle = (
  toggleFavoriteDto: ToggleFavoriteDto,
  options?: SecondParameter<typeof customInstance>,
  signal?: AbortSignal,
) => {
  return customInstance<ToggleFavoriteResult>(
    {
      url: `/favorites`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: toggleFavoriteDto,
      signal,
    },
    options,
  );
};
```

- 리턴 타입(`JobModel[]`, `ToggleFavoriteResult`)이 OpenAPI 스펙에서 자동 추론
- `options`를 통해 Zod 스키마 등 추가 설정 전달 가능
- `signal`로 컴포넌트 언마운트 시 요청 자동 취소

---

### 2층: Options 팩토리

React Query에 전달할 설정 객체를 생성한다.

**Query용:**

```ts
// 캐시 키 생성
export const getFavoritesControllerFindAllQueryKey = () => {
  return [`/favorites`] as const;
};

// queryKey + queryFn 결합
export const getFavoritesControllerFindAllQueryOptions = (...) => {
  const queryKey = queryOptions?.queryKey ?? getFavoritesControllerFindAllQueryKey();
  const queryFn = ({ signal }) => favoritesControllerFindAll(requestOptions, signal);
  return { queryKey, queryFn, ...queryOptions };
};
```

**Mutation용:**

```ts
export const getFavoritesControllerToggleMutationOptions = (...) => {
  const mutationKey = ['favoritesControllerToggle'];
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return favoritesControllerToggle(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
```

이점: 컴포넌트 밖에서 `queryClient.fetchQuery`, `queryClient.prefetchQuery` 등에 재사용 가능.

---

### 3층: React Query 훅

컴포넌트에서 직접 사용하는 최종 API.

```ts
// Query 훅
export function useFavoritesControllerFindAll(...) {
  const queryOptions = getFavoritesControllerFindAllQueryOptions(options);
  return useQuery(queryOptions, queryClient);
}

// Mutation 훅
export const useFavoritesControllerToggle = (...) => {
  const mutationOptions = getFavoritesControllerToggleMutationOptions(options);
  return useMutation(mutationOptions, queryClient);
};
```

---

## 컴포넌트에서 사용하기

### Query (데이터 조회)

```tsx
import { useJobsControllerFindAll } from '@/api/generated/jobs/jobs';

function JobListContainer() {
  const { data, isLoading, error } = useJobsControllerFindAll({ limit: 10 });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;
  return <JobListView jobs={data?.items ?? []} />;
}
```

### Mutation (데이터 변경)

```tsx
import { useFavoritesControllerToggle } from '@/api/generated/favorites/favorites';

function useFavoriteToggle() {
  const { mutate, isPending } = useFavoritesControllerToggle();

  const toggle = (jobId: string) => {
    mutate({ data: { job_id: jobId } });  // { data: DTO } 형태로 전달
  };

  return { toggle, isPending };
}
```

### 캐시 무효화

```tsx
import { queryClient } from '@/lib/query-client';
import { getFavoritesControllerFindAllQueryKey } from '@/api/generated/favorites/favorites';

// Mutation 성공 후 즐겨찾기 목록 캐시 갱신
mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: getFavoritesControllerFindAllQueryKey(),
    });
  },
});
```

---

## 함수 오버로드가 여러 개인 이유

Query 훅에는 **3개의 오버로드 시그니처**가 있다:

| 시그니처 | 조건 | 리턴 타입 |
|---|---|---|
| `DefinedInitialDataOptions` | `initialData` 있음 | `DefinedUseQueryResult` (data가 항상 존재) |
| `UndefinedInitialDataOptions` | `initialData` 없음 | `UseQueryResult` (data가 undefined 가능) |
| 기본 | 옵션 없음 | `UseQueryResult` |

이는 TypeScript가 `initialData` 유무에 따라 `data`의 타입을 정확히 추론하기 위한 것이다.
**생성 코드를 직접 수정하면 안 되고**, 이 구조는 정상이다.

---

## customInstance (Axios Mutator)

모든 생성 코드가 호출하는 핵심 함수. `privateApi` 인스턴스를 사용하므로 토큰 주입 + 401 자동 갱신이 적용된다.

```ts
// src/api/axios-instance.ts
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: { schema?: z.ZodSchema },
): Promise<T> => {
  return privateApi({
    ...config,
    ...options,
  }).then((res) => validateResponse(res as AxiosResponse<T>, options?.schema));
};
```

---

## 생성 코드에서 Export되는 타입들

각 엔드포인트마다 보조 타입이 자동 생성된다:

```ts
// Mutation 관련 타입
export type FavoritesControllerToggleMutationResult = NonNullable<...>;
export type FavoritesControllerToggleMutationBody = ToggleFavoriteDto;
export type FavoritesControllerToggleMutationError = void;

// Query 관련 타입
export type FavoritesControllerFindAllQueryResult = NonNullable<...>;
export type FavoritesControllerFindAllQueryError = void;
```

외부에서 타입만 필요할 때 import하여 사용할 수 있다.

---

## 주의사항

- `src/api/generated/`, `src/api/model/` 하위 파일은 **절대 직접 수정 금지** (재생성 시 덮어씀)
- 커스텀 로직이 필요하면 `src/hooks/` 에 별도 훅을 만들어 생성된 훅을 래핑
- 백엔드 API 변경 시 `npm run api:gen` 재실행으로 동기화
- 백엔드 서버가 실행 중이어야 `http://localhost:8000/api-json`에서 스펙을 가져올 수 있음
