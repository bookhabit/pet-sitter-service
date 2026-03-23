# Flutter 펫시터 모바일 클라이언트 구축 플랜

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 언어 | **Dart 3.x** | null safety, records, patterns |
| 프레임워크 | **Flutter 3.x** | 크로스플랫폼 (iOS/Android), 단일 코드베이스 |
| 라우팅 | **GoRouter** | 선언형, Deep link, Guard(redirect) 지원 |
| 상태 관리 | **Riverpod v2** (AsyncNotifier) | SRP에 맞는 레이어 분리, Provider 기반 DI |
| HTTP 클라이언트 | **Dio** | Interceptor (토큰 자동 갱신), axios와 동일 개념 |
| JSON 직렬화 | **Freezed + json_serializable** | 불변 모델, copyWith, Zod 타입 추출과 동일 역할 |
| 폼 유효성 | **reactive_forms** | 타입 안전 폼 상태 관리 (RHF 대응) |
| 토큰 저장 | **flutter_secure_storage** | iOS Keychain / Android Keystore |
| 사진 업로드 | **image_picker** | 갤러리/카메라 선택 |
| WebSocket | **socket_io_client** | NestJS Gateway 직접 연결 |
| 코드 생성 | **build_runner** | Freezed, json_serializable, Riverpod 자동 생성 |

---

## 2. 아키텍처 원칙 (react-rest SRP 동일 적용)

Flutter 레이어 구조는 react-rest의 Schema → Service → Query → Hook → Container → View와 1:1 대응한다.

```
[Model / Freezed]          ← Schema (Zod) 대응 — 타입 정의 + 직렬화
        ↓
[Repository]               ← Service 대응 — 순수 네트워크 호출, Flutter 무관
        ↓
[AsyncNotifier / Provider] ← Query Hook 대응 — 서버 상태 관리, 캐싱
        ↓
[ViewModel Notifier]       ← Logic Hook 대응 — 비즈니스 로직, 폼 상태
        ↓
[Screen (ConsumerWidget)]  ← Container 대응 — 상태 분기 (Loading/Error/Empty)
        ↓
[Widget]                   ← View 대응 — 순수 UI, 로직 없음
```

### 레이어별 절대 규칙

| 레이어 | 역할 | 금지 |
|---|---|---|
| Model | 데이터 구조 정의 + JSON 직렬화 | 네트워크 호출, Flutter Widget |
| Repository | API 호출만 | Flutter Widget, Provider |
| AsyncNotifier | 서버 상태 관리 | UI 코드, BuildContext 직접 사용 |
| ViewModel | 비즈니스 로직, 폼 | Widget 트리 조작 |
| Screen | 상태 분기, Widget 조합 | 직접 API 호출 |
| Widget | 렌더링만 | 상태 로직, API 호출 |

---

## 3. 프로젝트 구조

```
lib/
├── main.dart                          ← 앱 진입점 (ProviderScope 래핑)
├── app.dart                           ← MaterialApp.router + GoRouter
│
├── core/
│   ├── http/
│   │   ├── dio_client.dart            ← Dio 인스턴스 + Interceptor
│   │   ├── public_dio.dart            ← 비인증 요청 (login, register)
│   │   └── private_dio.dart           ← 토큰 자동 주입 + 401 refresh
│   ├── storage/
│   │   └── secure_storage.dart        ← flutter_secure_storage 래퍼
│   ├── router/
│   │   ├── app_router.dart            ← GoRouter 정의 + redirect guard
│   │   └── app_routes.dart            ← 경로 상수
│   └── error/
│       ├── api_exception.dart         ← 상태코드별 예외 클래스
│       └── app_exception.dart         ← 앱 레벨 예외
│
├── models/                            ← Freezed 불변 모델 (Zod 대응)
│   ├── user/
│   │   ├── user_model.dart
│   │   └── user_model.freezed.dart    ← 자동 생성
│   ├── job/
│   │   ├── job_model.dart
│   │   ├── pet_model.dart
│   │   └── job_filter_model.dart
│   ├── job_application/
│   │   └── job_application_model.dart
│   ├── photo/
│   │   └── photo_model.dart
│   ├── review/
│   │   └── review_model.dart
│   ├── chat/
│   │   ├── chat_room_model.dart
│   │   └── message_model.dart
│   └── favorite/
│       └── favorite_model.dart
│
├── repositories/                      ← 순수 API 호출 (Service 대응)
│   ├── auth_repository.dart
│   ├── job_repository.dart
│   ├── job_application_repository.dart
│   ├── photo_repository.dart
│   ├── review_repository.dart
│   ├── chat_repository.dart
│   └── favorite_repository.dart
│
├── providers/                         ← Riverpod Provider (Query Hook 대응)
│   ├── auth/
│   │   ├── auth_provider.dart         ← 인증 상태 (AuthNotifier)
│   │   └── auth_state.dart
│   ├── jobs/
│   │   ├── jobs_provider.dart         ← 공고 목록 (무한 스크롤)
│   │   ├── job_detail_provider.dart
│   │   └── job_filter_provider.dart
│   ├── applications/
│   │   └── applications_provider.dart
│   ├── reviews/
│   │   └── reviews_provider.dart
│   ├── chat/
│   │   ├── chat_rooms_provider.dart
│   │   ├── chat_messages_provider.dart
│   │   └── chat_socket_provider.dart  ← Socket.io 연결 관리
│   └── favorites/
│       └── favorites_provider.dart
│
├── screens/                           ← Screen (Container 대응)
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   ├── jobs/
│   │   ├── job_list_screen.dart
│   │   ├── job_detail_screen.dart
│   │   ├── job_create_screen.dart
│   │   └── job_edit_screen.dart
│   ├── applications/
│   │   └── application_list_screen.dart
│   ├── profile/
│   │   ├── profile_screen.dart
│   │   └── profile_edit_screen.dart
│   ├── reviews/
│   │   └── user_reviews_screen.dart
│   ├── favorites/
│   │   └── favorites_screen.dart
│   ├── chat/
│   │   ├── chat_list_screen.dart
│   │   └── chat_room_screen.dart
│   └── admin/
│       └── admin_dashboard_screen.dart
│
├── widgets/                           ← 순수 UI Widget (View 대응)
│   ├── common/
│   │   ├── error/
│   │   │   ├── error_view.dart        ← 에러 + 재시도 버튼
│   │   │   └── global_error_widget.dart
│   │   ├── loading/
│   │   │   └── loading_view.dart
│   │   └── empty/
│   │       └── empty_view.dart
│   ├── jobs/
│   │   ├── job_card.dart
│   │   ├── job_list_view.dart
│   │   ├── job_detail_view.dart
│   │   ├── pet_card.dart
│   │   └── skeleton/
│   │       └── job_list_skeleton.dart
│   ├── applications/
│   │   ├── application_card.dart
│   │   └── application_list_view.dart
│   ├── reviews/
│   │   ├── review_card.dart
│   │   └── star_rating_widget.dart
│   ├── chat/
│   │   ├── chat_room_card.dart
│   │   ├── message_bubble.dart
│   │   └── chat_input.dart
│   └── profile/
│       └── profile_view.dart
│
├── design_system/                     ← Flutter 디자인 시스템
│   ├── tokens/
│   │   ├── app_colors.dart
│   │   ├── app_typography.dart
│   │   └── app_spacing.dart
│   ├── atoms/
│   │   ├── app_button.dart
│   │   ├── app_text.dart
│   │   ├── app_text_field.dart
│   │   ├── app_badge.dart
│   │   ├── app_skeleton.dart
│   │   └── app_avatar.dart
│   └── layouts/
│       ├── app_flex.dart
│       └── app_spacing.dart
│
└── utils/
    ├── date_utils.dart                ← ISO 8601 ↔ 한국 날짜 포맷
    ├── price_utils.dart               ← ₩ 포맷
    └── role_utils.dart                ← isPetOwner, isPetSitter
```

---

## 4. pubspec.yaml 주요 의존성

```yaml
dependencies:
  flutter:
    sdk: flutter

  # 라우팅
  go_router: ^14.0.0

  # 상태 관리
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

  # HTTP
  dio: ^5.4.0

  # 모델 직렬화
  freezed_annotation: ^2.4.0
  json_annotation: ^4.9.0

  # 폼
  reactive_forms: ^17.0.0

  # 보안 저장소
  flutter_secure_storage: ^9.0.0

  # 사진
  image_picker: ^1.1.0

  # WebSocket
  socket_io_client: ^2.0.3+1

dev_dependencies:
  # 코드 생성
  build_runner: ^2.4.0
  freezed: ^2.5.0
  json_serializable: ^6.8.0
  riverpod_generator: ^2.4.0
  custom_lint: ^0.6.0
  riverpod_lint: ^2.3.0
```

---

## 5. 라우트 구조 (GoRouter)

```dart
// core/router/app_router.dart

GoRouter(
  redirect: (context, state) {
    final isLoggedIn = ref.read(authProvider).isLoggedIn;
    final isAuthRoute = state.matchedLocation.startsWith('/login') ||
                        state.matchedLocation.startsWith('/register');
    if (!isLoggedIn && !isAuthRoute) return '/login';
    if (isLoggedIn && isAuthRoute) return '/';
    return null;
  },
  routes: [
    // 인증
    GoRoute(path: '/login',    builder: (_,__) => const LoginScreen()),
    GoRoute(path: '/register', builder: (_,__) => const RegisterScreen()),

    // 탭 네비게이션
    StatefulShellRoute.indexedStack(
      builder: (_, __, shell) => MainTabScaffold(shell: shell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/', builder: (_,__) => const JobListScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/favorites', builder: (_,__) => const FavoritesScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/chat', builder: (_,__) => const ChatListScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (_,__) => const ProfileScreen()),
        ]),
      ],
    ),

    // 공고
    GoRoute(path: '/jobs/create',           builder: (_,__) => const JobCreateScreen()),
    GoRoute(path: '/jobs/:id',              builder: (_, s) => JobDetailScreen(id: s.pathParameters['id']!)),
    GoRoute(path: '/jobs/:id/edit',         builder: (_, s) => JobEditScreen(id: s.pathParameters['id']!)),
    GoRoute(path: '/jobs/:id/applications', builder: (_, s) => ApplicationListScreen(jobId: s.pathParameters['id']!)),

    // 채팅
    GoRoute(path: '/chat/:roomId', builder: (_, s) => ChatRoomScreen(roomId: s.pathParameters['roomId']!)),

    // 사용자
    GoRoute(path: '/users/:id', builder: (_, s) => UserProfileScreen(userId: s.pathParameters['id']!)),
  ],
)
```

---

## 6. 인증 플로우 (JWT + flutter_secure_storage)

### 토큰 저장

```dart
// core/storage/secure_storage.dart
class SecureTokenStorage {
  final _storage = const FlutterSecureStorage();

  Future<void> saveTokens({required String access, required String refresh}) async {
    await Future.wait([
      _storage.write(key: 'access_token', value: access),
      _storage.write(key: 'refresh_token', value: refresh),
    ]);
  }

  Future<String?> getAccessToken()  => _storage.read(key: 'access_token');
  Future<String?> getRefreshToken() => _storage.read(key: 'refresh_token');

  Future<void> clearTokens() => Future.wait([
    _storage.delete(key: 'access_token'),
    _storage.delete(key: 'refresh_token'),
  ]);
}
```

### AuthNotifier (Riverpod)

```dart
// providers/auth/auth_provider.dart
@riverpod
class Auth extends _$Auth {
  @override
  Future<AuthState> build() async {
    // 앱 시작 시 SecureStorage에서 토큰 복구
    final access  = await ref.read(secureStorageProvider).getAccessToken();
    final refresh = await ref.read(secureStorageProvider).getRefreshToken();

    if (access == null || refresh == null) return const AuthState.unauthenticated();

    try {
      final user = await ref.read(authRepositoryProvider).getMe();
      return AuthState.authenticated(user: user, accessToken: access);
    } catch (_) {
      return const AuthState.unauthenticated();
    }
  }

  Future<void> login(String email, String password) async { ... }
  Future<void> logout() async { ... }
}
```

### 401 자동 갱신 (Dio Interceptor)

```dart
// core/http/private_dio.dart
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = storage.getAccessToken();
    options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      try {
        final newToken = await _refresh();
        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final response = await dio.fetch(err.requestOptions);
        return handler.resolve(response);
      } catch (_) {
        ref.read(authProvider.notifier).logout();
        return handler.reject(err);
      }
    }
    handler.next(err);
  }
}
```

---

## 7. Model — Freezed (Zod 대응)

```dart
// models/job/job_model.dart
@freezed
class JobModel with _$JobModel {
  const factory JobModel({
    required String id,
    required String activity,
    required String startTime,
    required String endTime,
    String? address,
    double? latitude,
    double? longitude,
    int? price,
    String? priceType,
    required String creatorUserId,
    required List<PetModel> pets,
    required List<PhotoModel> photos,
    required DateTime createdAt,
  }) = _JobModel;

  factory JobModel.fromJson(Map<String, dynamic> json) => _$JobModelFromJson(json);
}
```

```dart
// models/job/pet_model.dart
@freezed
class PetModel with _$PetModel {
  const factory PetModel({
    required String id,
    required String name,
    required int age,
    required String species,
    required String breed,
    String? size,
    required List<PhotoModel> photos,
  }) = _PetModel;

  factory PetModel.fromJson(Map<String, dynamic> json) => _$PetModelFromJson(json);
}
```

코드 생성: `flutter pub run build_runner build --delete-conflicting-outputs`

---

## 8. Repository (Service 대응)

```dart
// repositories/job_repository.dart
@riverpod
JobRepository jobRepository(JobRepositoryRef ref) {
  return JobRepository(dio: ref.watch(privateDioProvider));
}

class JobRepository {
  final Dio _dio;
  const JobRepository({required Dio dio}) : _dio = dio;

  Future<JobListResponse> getJobs(JobFilterModel filter) async {
    final response = await _dio.get('/jobs', queryParameters: filter.toJson());
    return JobListResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<JobModel> getJob(String id) async {
    final response = await _dio.get('/jobs/$id');
    return JobModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<JobModel> createJob(CreateJobRequest body) async {
    final response = await _dio.post('/jobs', data: body.toJson());
    return JobModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<JobModel> updateJob(String id, UpdateJobRequest body) async {
    final response = await _dio.put('/jobs/$id', data: body.toJson());
    return JobModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> deleteJob(String id) => _dio.delete('/jobs/$id');
}
```

---

## 9. Provider (Query Hook 대응)

### GET — AsyncNotifier

```dart
// providers/jobs/job_detail_provider.dart
@riverpod
Future<JobModel> jobDetail(JobDetailRef ref, String id) {
  return ref.watch(jobRepositoryProvider).getJob(id);
}
```

### GET — 무한 스크롤

```dart
// providers/jobs/jobs_provider.dart
@riverpod
class JobsNotifier extends _$JobsNotifier {
  @override
  Future<JobListState> build(JobFilterModel filter) async {
    final response = await ref.read(jobRepositoryProvider).getJobs(filter);
    return JobListState(items: response.items, cursor: response.pageInfo.endCursor, hasMore: response.pageInfo.hasNextPage);
  }

  Future<void> fetchMore() async {
    final current = state.requireValue;
    if (!current.hasMore) return;
    final response = await ref.read(jobRepositoryProvider).getJobs(
      ref.read(jobFilterProvider).copyWith(cursor: current.cursor),
    );
    state = AsyncData(current.copyWith(
      items: [...current.items, ...response.items],
      cursor: response.pageInfo.endCursor,
      hasMore: response.pageInfo.hasNextPage,
    ));
  }
}
```

### POST — Mutation 패턴

```dart
// providers/jobs/job_mutation_provider.dart
@riverpod
class CreateJobNotifier extends _$CreateJobNotifier {
  @override
  AsyncValue<JobModel?> build() => const AsyncData(null);

  Future<void> create(CreateJobRequest body) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(jobRepositoryProvider).createJob(body),
    );
    if (state.hasValue) {
      // 목록 캐시 무효화
      ref.invalidate(jobsNotifierProvider);
    }
  }
}
```

---

## 10. Screen — 상태 분기 (Container 대응)

```dart
// screens/jobs/job_detail_screen.dart
class JobDetailScreen extends ConsumerWidget {
  final String id;
  const JobDetailScreen({required this.id, super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobAsync = ref.watch(jobDetailProvider(id));

    return Scaffold(
      appBar: AppBar(title: const Text('공고 상세')),
      body: switch (jobAsync) {
        AsyncLoading() => const JobDetailSkeleton(),
        AsyncError(:final error) => ErrorView(
            message: error.toString(),
            onRetry: () => ref.invalidate(jobDetailProvider(id)),
          ),
        AsyncData(:final value) => JobDetailView(job: value),
      },
    );
  }
}
```

---

## 11. 에러 처리 구조

Riverpod의 `AsyncValue`가 react-rest의 ErrorBoundary + Suspense 역할을 담당:

```
AsyncValue<T>
  ├─ AsyncLoading  → Skeleton / LoadingView
  ├─ AsyncError    → ErrorView + 재시도 버튼 (ref.invalidate)
  └─ AsyncData     → View 렌더링
        └─ data.isEmpty → EmptyView
```

### 에러 타입별 처리

| 에러 종류 | 처리 위치 | 방법 |
|---|---|---|
| JS 런타임 에러 해당 없음 | Flutter `ErrorWidget.builder` | 전체화면 fallback |
| API 에러 (GET) | `AsyncError` 분기 | ErrorView + `ref.invalidate` |
| API 에러 (POST/Mutation) | `state.hasError` 분기 | SnackBar / Toast |
| 401 | Dio Interceptor | 토큰 갱신 or 로그아웃 |
| 빈 데이터 | `data.isEmpty` 분기 | EmptyView |

```dart
// main.dart — 전역 에러 처리
ErrorWidget.builder = (details) => GlobalErrorWidget(details: details);
```

---

## 12. 화면별 API 호출 목록

| 화면 | API 호출 | Provider |
|---|---|---|
| 공고 목록 | `GET /jobs?filters...` | `jobsNotifierProvider` (무한 스크롤) |
| 공고 상세 | `GET /jobs/:id` | `jobDetailProvider` |
| 공고 등록 | `POST /photos/upload`, `POST /jobs` | `createJobNotifierProvider` |
| 공고 수정 | `GET /jobs/:id`, `PUT /jobs/:id` | `updateJobNotifierProvider` |
| 지원자 목록 | `GET /jobs/:id/job-applications` | `applicationsProvider` |
| 지원 상태 변경 | `PUT /job-applications/:id` | `updateApplicationNotifierProvider` |
| 프로필 | `GET /users/:id`, `GET /users/:id/reviews` | `profileProvider` |
| 프로필 수정 | `PUT /users/:id` | `updateProfileNotifierProvider` |
| 프로필 사진 | `POST /users/:id/photos` | `uploadPhotoNotifierProvider` |
| 즐겨찾기 목록 | `GET /favorites` | `favoritesProvider` |
| 즐겨찾기 토글 | `POST /favorites` | `toggleFavoriteNotifierProvider` |
| 채팅 목록 | `GET /chat-rooms` | `chatRoomsProvider` |
| 채팅방 | `GET /chat-rooms/:id/messages` | `chatMessagesProvider` + Socket.io |
| 리뷰 작성 | `POST /jobs/:jobId/reviews` | `createReviewNotifierProvider` |
| 받은 리뷰 | `GET /users/:userId/reviews` | `userReviewsProvider` |

---

## 13. 공고 목록 — 무한 스크롤

```dart
// screens/jobs/job_list_screen.dart
class JobListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(jobFilterProvider);
    final jobsAsync = ref.watch(jobsNotifierProvider(filter));

    return switch (jobsAsync) {
      AsyncLoading() => const JobListSkeleton(),
      AsyncError(:final error) => JobListErrorView(
          onRetry: () => ref.invalidate(jobsNotifierProvider(filter)),
        ),
      AsyncData(:final value) when value.items.isEmpty => const JobListEmptyView(),
      AsyncData(:final value) => NotificationListener<ScrollNotification>(
          onNotification: (n) {
            if (n.metrics.pixels >= n.metrics.maxScrollExtent - 200) {
              ref.read(jobsNotifierProvider(filter).notifier).fetchMore();
            }
            return false;
          },
          child: JobListView(
            jobs: value.items,
            hasMore: value.hasMore,
          ),
        ),
    };
  }
}
```

---

## 14. 사진 업로드 (`image_picker`)

```dart
// 갤러리/카메라에서 이미지 선택 후 Dio multipart로 업로드
Future<List<PhotoModel>> pickAndUpload() async {
  final picker = ImagePicker();
  final images = await picker.pickMultiImage(imageQuality: 80);

  if (images.isEmpty) return [];

  final formData = FormData.fromMap({
    'file': await Future.wait(images.map((img) async =>
      MultipartFile.fromFileSync(img.path, filename: img.name),
    )),
  });

  final response = await _dio.post('/photos/upload', data: formData);
  return (response.data as List).map((e) => PhotoModel.fromJson(e)).toList();
}
```

**공고 등록 사진 플로우**:
1. `ImagePicker`로 이미지 선택
2. 즉시 `/photos/upload`로 업로드 → `photo_ids` 리스트 상태 저장
3. 최종 공고 등록 요청 body에 `photo_ids` 포함

---

## 15. 채팅 — Socket.io (`chat_socket_provider.dart`)

```dart
// providers/chat/chat_socket_provider.dart
@riverpod
class ChatSocket extends _$ChatSocket {
  IO.Socket? _socket;

  @override
  ChatSocketState build() => const ChatSocketState.disconnected();

  void connect(String jobApplicationId) {
    final token = ref.read(authProvider).requireValue.accessToken;

    _socket = IO.io(
      '$apiBaseUrl/chat',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .build(),
    );

    _socket!.on('connect', (_) {
      _socket!.emit('joinRoom', {'jobApplicationId': jobApplicationId});
    });

    _socket!.on('joinedRoom', (data) {
      final chatRoomId = data['chatRoomId'] as String;
      state = ChatSocketState.connected(chatRoomId: chatRoomId);
    });

    _socket!.on('receiveMessage', (data) {
      final message = MessageModel.fromJson(data as Map<String, dynamic>);
      // Riverpod 캐시에 메시지 추가
      ref.read(chatMessagesProvider(state.chatRoomId!).notifier).addMessage(message);
    });

    _socket!.on('error', (data) {
      state = ChatSocketState.error(message: data.toString());
    });
  }

  void sendMessage(String content) {
    final roomId = state.chatRoomId;
    if (_socket == null || roomId == null) return;
    _socket!.emit('sendMessage', {'chatRoomId': roomId, 'content': content});
  }

  @override
  void dispose() {
    _socket?.disconnect();
    super.dispose();
  }
}
```

채팅방 화면 흐름:
1. `chatMessagesProvider`로 REST `GET /chat-rooms/:id/messages?limit=30` 히스토리 로드
2. `chatSocketProvider.connect(jobApplicationId)` 호출
3. `joinedRoom` 수신 → chatRoomId 저장
4. 신규 메시지 → `receiveMessage` → Riverpod 캐시 업데이트 → 자동 리빌드
5. 위로 스크롤 → cursor 기반 추가 로드

---

## 16. 디자인 시스템

### 색상 토큰 (`design_system/tokens/app_colors.dart`)

```dart
class AppColors {
  static const primary       = Color(0xFF3182F6);
  static const textPrimary   = Color(0xFF191F28);
  static const textSecondary = Color(0xFF4E5968);
  static const grey200       = Color(0xFFE5E8EB);
  static const background    = Color(0xFFF2F4F6);
  static const success       = Color(0xFF12B76A);
  static const warning       = Color(0xFFF79009);
  static const danger        = Color(0xFFF04438);
}
```

### 타이포그래피

| 스케일 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| `t1` | 24sp | Bold | 화면 제목 |
| `t2` | 20sp | Bold | 섹션 제목 |
| `b1` | 16sp | Regular | 본문 |
| `b2` | 14sp | Regular | 보조 본문 |
| `caption` | 12sp | Regular | 캡션, 에러 |

### 간격 (8px Grid)

허용값: `2, 4, 8, 12, 16, 24, 32, 48, 64`

```dart
// ✅ 올바른 사용
AppSpacing.v16  // SizedBox(height: 16)
AppSpacing.h8   // SizedBox(width: 8)

// ❌ 임의 값 금지
SizedBox(height: 15)
Padding(EdgeInsets.only(top: 13))
```

### Atom 위젯

```dart
// ✅ 동일한 사용 패턴
AppButton(label: '등록하기', variant: ButtonVariant.primary, isLoading: isPending, onPressed: onTap)
AppBadge(label: '승인됨', variant: BadgeVariant.success)
AppText('공고 목록', scale: TextScale.t1)
AppSkeleton(width: double.infinity, height: 160, borderRadius: 16)
```

---

## 17. 탭 네비게이션 구조

```dart
// StatefulShellRoute (GoRouter)

탭 구성:
  홈(공고 목록)  →  전체 사용자
  즐겨찾기       →  PetSitter만 (authProvider로 조건부 표시)
  채팅           →  전체 사용자
  프로필         →  전체 사용자
```

---

## 18. Expo vs Flutter 비교

| 항목 | Expo (React Native) | Flutter |
|---|---|---|
| 언어 | TypeScript | Dart |
| 아키텍처 패턴 | Schema→Service→Query→Hook→Container→View | Model→Repository→AsyncNotifier→ViewModel→Screen→Widget |
| 상태 관리 | TanStack Query + Zustand | Riverpod v2 (AsyncNotifier) |
| HTTP | axios + interceptor | Dio + Interceptor |
| 타입/검증 | Zod | Freezed + json_serializable |
| 폼 | React Hook Form | reactive_forms |
| 라우팅 | Expo Router (파일 기반) | GoRouter (선언형) |
| 토큰 저장 | expo-secure-store | flutter_secure_storage |
| 사진 | expo-image-picker | image_picker |
| 무한 스크롤 | `useSuspenseInfiniteQuery` + FlatList | `JobsNotifier.fetchMore()` + NotificationListener |
| 에러 처리 | ErrorBoundary + Suspense 4단계 | AsyncValue 분기 (switch) |
| 코드 생성 | 없음 (런타임 타입 추론) | build_runner (Freezed, Riverpod 자동 생성) |
| Socket.io | socket.io-client | socket_io_client |

---

## 19. 구현 순서

1. **프로젝트 셋업** — `pubspec.yaml`, `build_runner`, Freezed, Riverpod, Dio
2. **Core 레이어** — SecureStorage, publicDio, privateDio (interceptor)
3. **인증** — AuthNotifier, GoRouter redirect guard, 로그인/회원가입 화면
4. **공고 목록/상세** — 가장 핵심 (무한 스크롤, 필터)
5. **공고 CRUD** — 사진 업로드 (image_picker) 포함
6. **지원 관리** — 지원/승인/거절
7. **프로필** — 사진 업로드
8. **리뷰** 작성/삭제
9. **즐겨찾기** 토글/목록
10. **채팅** — ChatSocketNotifier + 히스토리 REST
11. **에러 처리 완성** — 전 레이어 AsyncValue 분기 정리
12. **디자인 시스템 정리** — Skeleton, SnackBar, 공통 Widget

---

## 20. 참고 서버 파일

| 파일 | 용도 |
|---|---|
| `src/chat/chat.gateway.ts` | Socket.io 이벤트명 및 auth 핸드셰이크 (`auth.token`) |
| `src/jobs/dto/create-job-dto.ts` | 공고 생성 바디 구조 (중첩 `pets[]`, `photo_ids[]`) |
| `src/jobs/dto/search-job-query.dto.ts` | 공고 필터 쿼리 파라미터 전체 목록 |
| `src/sessions/sessions.controller.ts` | 로그인/갱신/로그아웃 요청/응답 형식 |
| `src/photos/photos.controller.ts` | 파일 업로드 엔드포인트 및 필드명 |

## 21. 참고 클라이언트 파일

| 파일 | 용도 |
|---|---|
| `web/react-rest/docs/SRP_ARCHITECTURE.md` | 레이어별 책임 분리 규칙 (Dart로 동일 적용) |
| `web/react-rest/docs/API_CONVENTION.md` | HTTP 레이어 구조, 토큰 갱신 interceptor |
| `web/react-rest/docs/Exception_Handling.md` | 4-state 에러 처리 (AsyncValue로 대응) |
| `web/react-rest/docs/DESIGN_SYSTEM.md` | 디자인 토큰 (색상, 타이포, 간격) |
| `mobile/expo/PLAN.md` | Expo 플랜 (동일 기능, 다른 스택) |

---

**문서 버전**: 1.0
**최종 수정일**: 2026-03-23
