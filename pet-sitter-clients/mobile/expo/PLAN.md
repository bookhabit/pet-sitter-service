# Expo 펫시터 모바일 클라이언트 구축 플랜

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Expo SDK 52 + React Native** | 크로스플랫폼, OTA 업데이트, 네이티브 모듈 간편 |
| 라우팅 | **Expo Router v4** (파일 기반) | Next.js 스타일, Web과 동일한 URL 구조 |
| HTTP 클라이언트 | **axios** | web/react-rest와 동일한 레이어 구조 유지 |
| 서버 상태 | **TanStack Query v5** | 캐싱, 로딩/에러 상태, react-rest와 동일 |
| 폼 관리 | **React Hook Form + Zod** | react-rest와 동일한 Schema → Service → Hook → UI 구조 |
| 전역 상태 | **Zustand** | Auth 세션, 모달 등 최소 전역 상태 |
| 토큰 저장 | **expo-secure-store** | iOS Keychain / Android Keystore — AsyncStorage보다 안전 |
| 스타일링 | **NativeWind v4** (Tailwind RN) | react-rest 디자인 토큰과 일관성 유지 |
| 사진 | **expo-image-picker** | 갤러리/카메라 선택 |
| WebSocket | **socket.io-client** | NestJS Gateway와 직접 연결 |
| 알림 | **expo-notifications** | 신규 메시지 푸시 알림 (선택) |
| 타입 검증 | **Zod** | 런타임 API 응답 검증 |
| 언어 | **TypeScript 5** (strict mode) | `any` 금지, 컴파일 타임 에러 차단 |

---

## 2. 아키텍처 원칙 (react-rest SRP 동일 적용)

```
[Schema/Zod]
    ↓
[Service]        ← 순수 TS, React import 금지
    ↓
[Query Hook]     ← TanStack Query (GET: useSuspenseQuery, POST: useMutation)
    ↓
[Logic Hook]     ← 비즈니스 로직, 폼 상태
    ↓
[Screen/Container] ← 상태 분기 (Loading/Error/Empty/Success)
    ↓
[View Component] ← props 렌더링만, 로직 없음
```

### 레이어별 절대 규칙

| 레이어 | 역할 | 금지 |
|---|---|---|
| Schema | Zod 검증만 | 네트워크 호출 |
| Service | API 호출만 | React Hook, 상태 관리 |
| Query Hook | 서버 상태만 | UI 로직, JSX |
| Logic Hook | 비즈니스 로직 | JSX, StyleSheet |
| View | 렌더링만 | API 직접 호출, 상태 로직 |

---

## 3. 프로젝트 구조

```
src/
├── app/                           ← Expo Router 파일 기반 라우팅
│   ├── _layout.tsx                ← Root layout (QueryClient, AuthProvider)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                    ← 인증 후 탭 네비게이션
│   │   ├── _layout.tsx            ← 탭 바 정의
│   │   ├── index.tsx              ← 공고 목록 (홈)
│   │   ├── favorites.tsx          ← 즐겨찾기 (PetSitter)
│   │   ├── chat.tsx               ← 채팅방 목록
│   │   └── profile.tsx            ← 내 프로필
│   ├── jobs/
│   │   ├── [id].tsx               ← 공고 상세
│   │   ├── create.tsx             ← 공고 등록 (PetOwner)
│   │   └── [id]/
│   │       ├── edit.tsx           ← 공고 수정
│   │       └── applications.tsx   ← 지원자 목록 (PetOwner)
│   ├── chat/
│   │   └── [roomId].tsx           ← 채팅방
│   ├── users/
│   │   └── [id].tsx               ← 다른 사용자 프로필
│   └── +not-found.tsx
│
├── schemas/                       ← Zod 스키마 + 타입 추출
│   ├── userSchema.ts
│   ├── jobSchema.ts
│   ├── petSchema.ts
│   ├── jobApplicationSchema.ts
│   ├── photoSchema.ts
│   ├── reviewSchema.ts
│   ├── chatSchema.ts
│   └── favoriteSchema.ts
│
├── services/                      ← 순수 API 호출 (React 무관)
│   ├── http/
│   │   ├── publicApi.ts           ← 토큰 없는 요청 (login, register)
│   │   └── privateApi.ts          ← 토큰 자동 주입 + 401 refresh
│   ├── authService.ts
│   ├── jobService.ts
│   ├── jobApplicationService.ts
│   ├── photoService.ts
│   ├── reviewService.ts
│   ├── chatService.ts
│   └── favoriteService.ts
│
├── hooks/
│   ├── queries/                   ← TanStack Query (서버 상태)
│   │   ├── useJobsQuery.ts
│   │   ├── useJobDetailQuery.ts
│   │   ├── useJobApplicationsQuery.ts
│   │   ├── useProfileQuery.ts
│   │   ├── useUserReviewsQuery.ts
│   │   ├── useFavoritesQuery.ts
│   │   ├── useChatRoomsQuery.ts
│   │   ├── useChatMessagesQuery.ts
│   │   └── mutations/
│   │       ├── useLoginMutation.ts
│   │       ├── useRegisterMutation.ts
│   │       ├── useCreateJobMutation.ts
│   │       ├── useUpdateJobMutation.ts
│   │       ├── useDeleteJobMutation.ts
│   │       ├── useApplyJobMutation.ts
│   │       ├── useUpdateApplicationMutation.ts
│   │       ├── useUploadPhotoMutation.ts
│   │       ├── useCreateReviewMutation.ts
│   │       ├── useDeleteReviewMutation.ts
│   │       └── useToggleFavoriteMutation.ts
│   ├── useLoginForm.ts            ← Logic Hook (폼 + mutation 연결)
│   ├── useRegisterForm.ts
│   ├── useCreateJobForm.ts
│   ├── useEditJobForm.ts
│   └── useChatSocket.ts           ← Socket.io 연결 관리
│
├── components/
│   ├── common/
│   │   ├── error/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── QueryErrorBoundary.tsx
│   │   │   ├── GlobalErrorFallback.tsx
│   │   │   └── ScreenErrorView.tsx
│   │   ├── loading/
│   │   │   └── ScreenLoadingView.tsx
│   │   └── empty/
│   │       └── EmptyBoundary.tsx
│   ├── jobs/
│   │   ├── JobListContainer.tsx
│   │   ├── JobListView.tsx
│   │   ├── JobCard.tsx
│   │   ├── JobDetailContainer.tsx
│   │   ├── JobDetailView.tsx
│   │   ├── PetCard.tsx
│   │   └── exception/
│   │       ├── JobListLoadingView.tsx    ← Skeleton
│   │       ├── JobListErrorView.tsx
│   │       └── JobListEmptyView.tsx
│   ├── applications/
│   │   ├── ApplicationListContainer.tsx
│   │   ├── ApplicationListView.tsx
│   │   └── ApplicationCard.tsx
│   ├── reviews/
│   │   ├── ReviewListContainer.tsx
│   │   ├── ReviewListView.tsx
│   │   └── StarRating.tsx
│   ├── chat/
│   │   ├── ChatRoomListContainer.tsx
│   │   ├── ChatRoomListView.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   └── profile/
│       ├── ProfileContainer.tsx
│       └── ProfileView.tsx
│
├── design-system/                 ← RN 전용 디자인 시스템
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   ├── atoms/
│   │   ├── Button/
│   │   ├── Text/
│   │   ├── TextInput/
│   │   ├── Badge/
│   │   ├── Skeleton/
│   │   └── Avatar/
│   ├── layouts/
│   │   ├── Flex.tsx
│   │   └── Spacing.tsx
│   └── index.ts
│
├── store/
│   ├── useAuthStore.ts            ← 인증 상태 (Zustand)
│   └── useModalStore.ts           ← 전역 모달 (Zustand)
│
└── utils/
    ├── dateUtils.ts               ← ISO 8601 ↔ 한국 날짜 포맷
    ├── priceUtils.ts              ← ₩ 포맷
    └── roleUtils.ts               ← isPetOwner, isPetSitter
```

---

## 4. 라우트 구조 (Expo Router)

```
/                         → (tabs)/index     공고 목록 (홈 탭)
/favorites                → (tabs)/favorites 즐겨찾기 탭 (PetSitter)
/chat                     → (tabs)/chat      채팅 탭
/profile                  → (tabs)/profile   프로필 탭

/login                    → (auth)/login
/register                 → (auth)/register

/jobs/[id]                → 공고 상세
/jobs/create              → 공고 등록 (PetOwner)
/jobs/[id]/edit           → 공고 수정
/jobs/[id]/applications   → 지원자 목록 (PetOwner)

/chat/[roomId]            → 채팅방
/users/[id]               → 다른 사용자 공개 프로필
```

---

## 5. 인증 플로우 (JWT + SecureStore)

### 토큰 저장 전략

```
AsyncStorage    ❌ 암호화 없음, 탈취 위험
SecureStore     ✅ iOS Keychain / Android Keystore 기반 암호화 저장
```

```ts
// store/useAuthStore.ts (Zustand)
interface AuthState {
  accessToken:  string | null
  refreshToken: string | null
  user:         UserDto | null
  isHydrated:   boolean          // SecureStore 초기 로드 완료 여부

  login:  (tokens, user) => Promise<void>
  logout: () => Promise<void>
  setTokens: (access, refresh) => Promise<void>
}
```

### 앱 시작 시 토큰 복구

```
앱 실행
  └─ _layout.tsx: useAuthStore.hydrate()
       └─ SecureStore.getItemAsync('access_token')
       └─ SecureStore.getItemAsync('refresh_token')
       └─ isHydrated = true
       └─ token 있으면 → (tabs) 로 이동
       └─ token 없으면 → (auth)/login 으로 이동
```

### 401 자동 토큰 갱신 (privateApi axios interceptor)

```
요청 실패 (401)
  ├─ SecureStore에서 refresh_token 읽기
  ├─ POST /sessions/refresh → 새 access_token
  ├─ SecureStore + Zustand 업데이트
  ├─ 기존 요청 재시도
  └─ refresh 실패 → logout() → router.replace('/login')
```

---

## 6. HTTP 레이어 (`services/http/`)

### publicApi.ts — 비인증 요청

```ts
// 로그인, 회원가입 전용
// baseURL: http://localhost:8000
// 토큰 없음
```

### privateApi.ts — 인증 요청

```ts
// Request interceptor: Authorization: Bearer {access_token} 자동 주입
// Response interceptor:
//   401 → refresh → retry
//   refresh 실패 → 로그아웃
```

### 응답 Zod 검증 통합

```ts
const validateResponse = <T>(data: unknown, schema: z.ZodSchema<T>): T => {
  return schema.parse(data);
};
```

---

## 7. 에러 처리 구조

react-rest의 4-레벨 에러 처리 구조를 React Native에 맞게 적용:

```
ErrorBoundary (root _layout.tsx)
  └─ [Global] JS 크래시 전체 보호 → GlobalErrorFallback (전체화면)
       └─ Stack Navigator
            └─ ScreenAsyncBoundary (각 탭/스크린 레이아웃)
                 ├─ QueryErrorBoundary → ScreenErrorView
                 └─ Suspense → ScreenLoadingView
                      └─ Screen (e.g. JobsScreen)
                           └─ QueryErrorBoundary → JobListErrorView
                                └─ Suspense → JobListLoadingView (Skeleton)
                                     └─ JobListContainer
                                          └─ EmptyBoundary → JobListEmptyView
                                               └─ JobListView
```

### 4-state 흐름 (컴포넌트 단위)

```
useSuspenseQuery 호출
  ├─ suspended   → Suspense fallback (Skeleton LoadingView)
  ├─ throws      → QueryErrorBoundary fallback (ErrorView + 재시도)
  └─ resolved
       ├─ data.length === 0 → EmptyBoundary fallback (EmptyView)
       └─ data.length > 0  → View 렌더링
```

### 에러 타입별 처리

| 에러 종류 | 처리 위치 | 방법 |
|---|---|---|
| JS 런타임 에러 | Global `ErrorBoundary` | 전체화면 fallback |
| Query 에러 (API 실패) | Component `QueryErrorBoundary` | 인라인 fallback + 재시도 |
| Mutation 에러 | 호출부 `onError` | Toast 메시지 |
| 401 인증 에러 | axios interceptor | 토큰 갱신 or 로그인 이동 |
| 빈 데이터 | `EmptyBoundary` | 안내 UI |

---

## 8. 화면별 API 호출 목록

| 화면 | API 호출 | Hook |
|---|---|---|
| 공고 목록 | `GET /jobs?filters...` | `useJobsQuery` (무한 스크롤) |
| 공고 상세 | `GET /jobs/:id` | `useJobDetailQuery` |
| 공고 등록 | `POST /photos/upload`, `POST /jobs` | `useCreateJobForm` |
| 공고 수정 | `GET /jobs/:id`, `PUT /jobs/:id` | `useEditJobForm` |
| 지원자 목록 | `GET /jobs/:id/job-applications` | `useJobApplicationsQuery` |
| 지원 상태 변경 | `PUT /job-applications/:id` | `useUpdateApplicationMutation` |
| 프로필 | `GET /users/:id`, `GET /users/:id/reviews` | `useProfileQuery` |
| 프로필 수정 | `PUT /users/:id` | `useMutation` |
| 프로필 사진 | `POST /users/:id/photos` | `useUploadPhotoMutation` |
| 즐겨찾기 목록 | `GET /favorites` | `useFavoritesQuery` |
| 즐겨찾기 토글 | `POST /favorites` | `useToggleFavoriteMutation` |
| 채팅 목록 | `GET /chat-rooms` | `useChatRoomsQuery` |
| 채팅방 | `GET /chat-rooms/:id/messages` | `useChatMessagesQuery` + Socket.io |
| 리뷰 작성 | `POST /jobs/:jobId/reviews` | `useCreateReviewMutation` |
| 받은 리뷰 | `GET /users/:userId/reviews` | `useUserReviewsQuery` |

---

## 9. 공고 목록 — 무한 스크롤

```ts
// hooks/queries/useJobsQuery.ts
export function useJobsQuery(filters: JobFilters) {
  return useSuspenseInfiniteQuery({
    queryKey: ['jobs', filters],
    queryFn: ({ pageParam }) => jobService.getJobs({ ...filters, cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
    initialPageParam: undefined,
  });
}

// JobListContainer.tsx
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useJobsQuery(filters);
const jobs = data.pages.flatMap((p) => p.items);
// FlatList onEndReached → fetchNextPage()
```

---

## 10. 사진 업로드 (`expo-image-picker`)

```ts
// 갤러리 또는 카메라에서 이미지 선택 후 서버로 업로드
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsMultipleSelection: true,
  quality: 0.8,
});

if (!result.canceled) {
  const formData = new FormData();
  result.assets.forEach((asset) => {
    formData.append('file', {
      uri: asset.uri,
      name: asset.fileName ?? 'photo.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    } as any);
  });

  const photos = await photoService.upload(formData);
  // photo_ids → 공고 등록 body에 포함
}
```

**공고 등록 사진 플로우**: 이미지 선택 → 즉시 업로드 → `photo_ids` 배열 상태 저장 → 최종 폼 제출 시 포함

---

## 11. 채팅 — Socket.io (`useChatSocket.ts`)

```ts
// hooks/useChatSocket.ts
export function useChatSocket(jobApplicationId: string) {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  useEffect(() => {
    const s = io(`${API_BASE_URL}/chat`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    s.on('connect', () => {
      s.emit('joinRoom', { jobApplicationId });
    });

    s.on('joinedRoom', ({ chatRoomId: id }) => {
      setChatRoomId(id);
    });

    s.on('receiveMessage', (msg: MessageDto) => {
      // TanStack Query 캐시에 메시지 추가
      queryClient.setQueryData(
        ['chat-messages', chatRoomId],
        (old: MessageDto[]) => [...(old ?? []), msg],
      );
    });

    s.on('error', (err) => {
      console.error('Socket error:', err);
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [jobApplicationId, accessToken]);

  const sendMessage = useCallback((content: string) => {
    if (socket && chatRoomId) {
      socket.emit('sendMessage', { chatRoomId, content });
    }
  }, [socket, chatRoomId]);

  return { sendMessage, chatRoomId };
}
```

채팅방 화면 흐름:
1. REST `GET /chat-rooms/:id/messages?limit=30`으로 히스토리 로드
2. `useChatSocket`으로 Socket.io 연결
3. `joinRoom` emit → `joinedRoom` 수신
4. 신규 메시지는 Socket.io `receiveMessage`로 수신 → TanStack Query 캐시 업데이트
5. 위로 스크롤 시 cursor 기반 추가 로드 (REST)

---

## 12. 디자인 시스템 (React Native)

web의 디자인 토큰을 React Native StyleSheet로 이식:

### 색상 토큰 (`tokens/colors.ts`)

```ts
export const colors = {
  primary:        '#3182f6',
  textPrimary:    '#191f28',
  textSecondary:  '#4e5968',
  grey200:        '#e5e8eb',
  background:     '#f2f4f6',
  success:        '#12b76a',
  warning:        '#f79009',
  danger:         '#f04438',
  white:          '#ffffff',
} as const;
```

### 타이포그래피 (`tokens/typography.ts`)

| 스케일 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| `t1` | 24 | 700 | 화면 제목 |
| `t2` | 20 | 700 | 섹션 제목 |
| `b1` | 16 | 400 | 본문 |
| `b2` | 14 | 400 | 보조 본문 |
| `caption` | 12 | 400 | 캡션, 에러 |

### 간격 (8px Grid)

허용값: `2, 4, 8, 12, 16, 24, 32, 48, 64`

```ts
// ✅ 올바른 사용
<Spacing size={16} />
// ❌ 임의 값 금지
style={{ marginTop: 15 }}
```

### Atom 컴포넌트

web 디자인 시스템과 Props API를 동일하게 맞춤 (플랫폼만 다름):

```tsx
// ✅ 동일한 사용 패턴
<Button variant="primary" size="md" isLoading={isPending}>등록하기</Button>
<Badge variant="success">승인됨</Badge>
<Text size="t1" color="primary">공고 목록</Text>
<Skeleton width="100%" height={160} rounded="2xl" />
```

---

## 13. 탭 네비게이션 구조

```
(tabs)/_layout.tsx

탭 구성:
  홈(공고 목록)  →  전체 사용자 노출
  즐겨찾기       →  PetSitter만 노출
  채팅           →  전체 사용자 노출
  프로필         →  전체 사용자 노출

역할별 탭 노출:
  PetOwner:  홈 | 채팅 | 프로필
  PetSitter: 홈 | 즐겨찾기 | 채팅 | 프로필
```

---

## 14. TypeScript 설정 (react-rest 동일)

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

---

## 15. web/react-rest vs mobile/expo 비교

| 항목 | react-rest (web) | expo (mobile) |
|---|---|---|
| 라우팅 | React Router v6 | Expo Router v4 (파일 기반) |
| 스타일 | Tailwind CSS | NativeWind v4 (Tailwind RN) |
| 토큰 저장 | 메모리 + httpOnly 쿠키 | SecureStore (암호화) |
| 사진 업로드 | `<input type="file">` | `expo-image-picker` (갤러리/카메라) |
| 무한 스크롤 | IntersectionObserver | `FlatList` onEndReached |
| 모달 | `createPortal` + Overlay | `Modal` (RN 내장) |
| 애니메이션 | CSS transition | `react-native-reanimated` |
| 아키텍처 | Schema→Service→Query→Hook→Container→View | 동일 |
| TanStack Query | 동일 | 동일 |
| Zod | 동일 | 동일 |
| React Hook Form | 동일 | 동일 |
| Socket.io | browser 기본 | `socket.io-client` (RN 지원) |

---

## 16. 구현 순서

1. **프로젝트 셋업** — Expo 초기화, NativeWind, TanStack Query, Zustand, Zod
2. **HTTP 레이어** — `publicApi`, `privateApi` (axios interceptor + token refresh)
3. **인증** — SecureStore, useAuthStore, 로그인/회원가입 화면
4. **공고 목록/상세** — 가장 핵심 (무한 스크롤, 필터)
5. **공고 CRUD** — 사진 업로드 (expo-image-picker) 포함
6. **지원 관리** — 지원/승인/거절
7. **프로필** — 사진 업로드
8. **리뷰** 작성/삭제
9. **즐겨찾기** 토글/목록
10. **채팅** — useChatSocket (Socket.io) + 히스토리 REST
11. **에러 처리 완성** — ErrorBoundary 전 레이어 적용
12. **디자인 시스템 정리** — Skeleton, Toast, 공통 컴포넌트

---

## 17. 참고 서버 파일

| 파일 | 용도 |
|---|---|
| `src/chat/chat.gateway.ts` | Socket.io 이벤트명 및 auth 핸드셰이크 (`auth.token`) |
| `src/jobs/dto/create-job-dto.ts` | 공고 생성 바디 구조 (중첩 `pets[]`, `photo_ids[]`) |
| `src/jobs/dto/search-job-query.dto.ts` | 공고 필터 쿼리 파라미터 전체 목록 |
| `src/sessions/sessions.controller.ts` | 로그인/갱신/로그아웃 요청/응답 형식 |
| `src/photos/photos.controller.ts` | 파일 업로드 엔드포인트 및 필드명 |

## 18. 참고 클라이언트 파일

| 파일 | 용도 |
|---|---|
| `web/react-rest/docs/SRP_ARCHITECTURE.md` | 레이어별 책임 분리 규칙 |
| `web/react-rest/docs/API_CONVENTION.md` | axios 인스턴스 구조, Zod 검증 통합 |
| `web/react-rest/docs/Exception_Handling.md` | 4-레벨 에러 처리 구조 |
| `web/react-rest/docs/DESIGN_SYSTEM.md` | 디자인 토큰, 컴포넌트 Props API |

---

**문서 버전**: 1.0
**최종 수정일**: 2026-03-23
