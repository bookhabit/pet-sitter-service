# Android 프로젝트 셋업 정리

> expo-app과 동일한 SRP 아키텍처를 Android(MVVM + Clean Architecture + Hilt + Compose)로 구현한 Phase 0+1 정리

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 언어 | Kotlin |
| UI | Jetpack Compose + Material Design 3 |
| 아키텍처 | MVVM + Clean Architecture |
| DI | Hilt (Dagger 기반) |
| 네트워크 | Retrofit + OkHttp + kotlinx.serialization |
| 상태 관리 | StateFlow + collectAsStateWithLifecycle |
| 토큰 저장 | EncryptedSharedPreferences (AES256_GCM) |
| 빌드 도구 | Gradle 8.7 + AGP 8.5.2 + KSP |

---

## 2. 폴더 구조

```
app/src/main/java/com/petsitter/
│
├── core/                          # 앱 전반 공통 인프라
│   ├── config/
│   │   └── ApiConfig.kt           # BuildConfig → BASE_URL 노출
│   ├── network/
│   │   ├── NetworkResult.kt       # sealed class (Loading / Success / Error)
│   │   └── AuthInterceptor.kt     # OkHttp 인터셉터 + AuthEventBus
│   ├── storage/
│   │   └── EncryptedTokenStorage.kt  # AES256_GCM 토큰 저장소
│   └── di/
│       ├── NetworkModule.kt       # Hilt — Retrofit/OkHttp 의존성 주입
│       └── RepositoryModule.kt    # Hilt — Repository 인터페이스 바인딩
│
├── data/                          # 외부 데이터 소스 (서버 통신)
│   ├── remote/
│   │   ├── api/
│   │   │   └── AuthApi.kt         # Retrofit 인터페이스 (엔드포인트 선언)
│   │   └── dto/
│   │       └── UserDto.kt         # @Serializable DTO (서버 응답 형태 그대로)
│   └── repository/
│       └── AuthRepositoryImpl.kt  # AuthRepository 구현체 (DTO → Domain 변환)
│
├── domain/                        # 비즈니스 로직 (순수 Kotlin, 프레임워크 의존 없음)
│   ├── model/
│   │   └── User.kt                # Domain 모델 + UserRole enum
│   └── repository/
│       └── AuthRepository.kt      # 인터페이스 (DIP — 의존성 역전)
│
├── presentation/                  # UI 레이어 (Compose 화면 + ViewModel)
│   ├── auth/
│   │   ├── AuthViewModel.kt       # 전역 인증 상태 (isHydrated, isLoggedIn)
│   │   ├── LoginViewModel.kt      # 로그인 폼 상태
│   │   ├── LoginScreen.kt
│   │   ├── RegisterViewModel.kt   # 회원가입 폼 상태
│   │   └── RegisterScreen.kt
│   ├── jobs/
│   │   └── JobListScreen.kt       # placeholder
│   ├── favorites/
│   │   └── FavoritesScreen.kt     # placeholder
│   ├── chat/
│   │   └── ChatListScreen.kt      # placeholder
│   ├── profile/
│   │   ├── ProfileViewModel.kt
│   │   └── ProfileScreen.kt
│   └── navigation/
│       ├── AppRoute.kt            # 라우트 경로 상수
│       └── AppNavHost.kt          # 네비게이션 진입점
│
├── ui/                            # 디자인 시스템
│   ├── theme/
│   │   ├── AppColors.kt           # 색상 토큰 (STANDARDS.md 5장)
│   │   ├── AppTypography.kt       # 폰트 스케일 (t1, t2, b1, b2, caption)
│   │   ├── AppShape.kt            # 모서리 반경
│   │   └── AppTheme.kt            # MaterialTheme 래퍼
│   └── components/
│       ├── AppButton.kt           # 버튼 (Primary / Secondary / Danger)
│       ├── AppTextField.kt        # 텍스트 필드 (에러 메시지 포함)
│       ├── AppBadge.kt            # 배지
│       ├── AppSkeleton.kt         # shimmer 로딩 스켈레톤
│       ├── AppTopBar.kt           # 상단 바 (TopAppBar 기반, safe area 처리)
│       ├── ErrorView.kt           # 에러 상태 UI
│       └── EmptyView.kt           # 빈 상태 UI
│
├── PetSitterApp.kt                # @HiltAndroidApp Application 클래스
└── MainActivity.kt                # @AndroidEntryPoint + enableEdgeToEdge()
```

---

## 3. 환경별 API Base URL

expo-app의 `apiBaseUrl.ts`와 동일한 역할을 `app/build.gradle.kts` + `ApiConfig.kt`가 담당한다.

```
빌드 시 우선순위:
  1. ./gradlew assembleDebug -PAPI_BASE_URL=http://192.168.x.x:3000  ← 실제 기기
  2. gradle.properties 에 API_BASE_URL=http://192.168.x.x:3000       ← 팀 공통
  3. 기본값 http://10.0.2.2:3000                                       ← 에뮬레이터
```

| 환경 | URL |
|------|-----|
| Android 에뮬레이터 | `http://10.0.2.2:3000` (호스트 PC의 localhost) |
| 실제 기기 | `http://192.168.x.x:3000` (같은 네트워크 IP) |
| CI / 서버 배포 | 환경 변수 또는 `-P` 옵션으로 주입 |

**비교: 플랫폼별 URL 처리 방식**

| 플랫폼 | 방식 | 위치 |
|--------|------|------|
| expo-app | `Constants.isDevice`, `Platform.OS` 런타임 분기 | `apiBaseUrl.ts` |
| flutter-app | `Platform.isAndroid`, `kIsWeb` 런타임 분기 | `api_base_url.dart` |
| android | `buildConfigField` 빌드 타임 주입 | `app/build.gradle.kts` |

---

## 4. Clean Architecture 레이어

```
서버 응답 (JSON)
    ↓
[Data Layer]
  AuthApi.kt          — Retrofit interface, 순수 HTTP 호출만
  UserDto.kt          — @Serializable, 서버 스키마 그대로 반영
  AuthRepositoryImpl  — DTO → Domain 변환, AuthRepository 구현
    ↓
[Domain Layer]
  User.kt             — 앱 내부 도메인 모델 (서버 의존 없음)
  AuthRepository      — 인터페이스 (DIP: Impl이 이것을 구현)
    ↓
[Presentation Layer]
  AuthViewModel       — isHydrated 패턴, AuthEventBus 구독
  LoginViewModel      — 폼 상태만 관리
  LoginScreen         — 렌더링만, 로직은 ViewModel
```

### DIP (의존성 역전 원칙)

```kotlin
// domain/repository/AuthRepository.kt — 인터페이스
interface AuthRepository {
    suspend fun login(email: String, password: String): Pair<String, String>
    suspend fun getMe(): User
}

// data/repository/AuthRepositoryImpl.kt — 구현체
class AuthRepositoryImpl @Inject constructor(...) : AuthRepository { ... }

// core/di/RepositoryModule.kt — Hilt가 인터페이스 → 구현체 연결
@Binds
abstract fun bindAuthRepository(impl: AuthRepositoryImpl): AuthRepository
```

---

## 5. Hilt DI 구조

### @Named("public") / @Named("private") Retrofit

```
NetworkModule
  ├── @Named("public")  OkHttpClient  — 인증 헤더 없음 (로그인, 회원가입)
  ├── @Named("private") OkHttpClient  — AuthInterceptor 포함 (인증 필요 API)
  ├── @Named("public")  Retrofit      — AuthApi (login, register)
  └── @Named("private") Retrofit      — AuthApi (getMe, logout)
```

expo-app의 `publicApi` / `privateApi` 분리와 동일한 역할.

### 주입 흐름

```
@HiltAndroidApp PetSitterApp
    → @AndroidEntryPoint MainActivity
        → hiltViewModel() AuthViewModel
            → @Inject AuthRepository, EncryptedTokenStorage, AuthEventBus
```

---

## 6. 인증 플로우 (expo-app isHydrated 패턴 대응)

### isHydrated 패턴

```kotlin
// AuthViewModel.kt
init {
    viewModelScope.launch {
        val token = storage.getAccessToken()
        if (token != null) {
            runCatching { authRepository.getMe() }
                .onSuccess { user -> /* 로그인 상태 복원 */ }
                .onFailure { storage.clearAll() }
        }
        _uiState.update { it.copy(isHydrated = true) }  // ← 복원 완료
    }
}
```

```kotlin
// AppNavHost.kt
if (!authState.isHydrated) {
    // 복원 전: 로딩 스피너만 표시 (라우팅 결정 보류)
    CircularProgressIndicator()
    return
}
// 복원 완료 후 인증 상태에 따라 라우팅
```

**비교: 플랫폼별 isHydrated 구현**

| 플랫폼 | 저장소 | hydration 처리 |
|--------|--------|----------------|
| expo-app | expo-secure-store (async) | `useAuthStore`의 `isHydrated` state |
| flutter-app | flutter_secure_storage | `AsyncNotifier` init |
| android | EncryptedSharedPreferences (sync) | `AuthViewModel` init 블록 |

### 401 자동 토큰 갱신 (AuthInterceptor)

```
OkHttp 요청
    → AuthInterceptor: access_token 헤더 주입
    → 401 응답 시:
        1. refresh_token 읽기
        2. POST /sessions/refresh (새 OkHttpClient로 직접 호출 — 무한루프 방지)
        3. 성공: 새 토큰 저장 → 원래 요청 재시도
        4. 실패: 토큰 삭제 → AuthEventBus.emit(Unauthorized)
    → AuthViewModel: Unauthorized 이벤트 수신 → 강제 로그아웃
```

expo-app의 `failedQueue` 패턴 대응:
- expo-app: axios interceptor + `failedQueue` 배열로 동시 401 처리
- android: OkHttp `runBlocking` 내 동기 처리 (OkHttp 스레드 풀이 직렬화 보장)

---

## 7. 네비게이션 구조

```
AppNavHost
  ├─ isHydrated = false → CircularProgressIndicator (라우팅 보류)
  │
  ├─ isLoggedIn = false → 비인증 NavHost
  │    ├─ LOGIN     → LoginScreen
  │    └─ REGISTER  → RegisterScreen
  │
  └─ isLoggedIn = true  → MainTabScaffold
       └─ Scaffold (NavigationBar)
            ├─ JOB_LIST   → JobListScreen
            ├─ FAVORITES  → FavoritesScreen  (PetSitter만 탭 표시)
            ├─ CHAT_LIST  → ChatListScreen
            └─ PROFILE    → ProfileScreen
```

---

## 8. 디자인 시스템

STANDARDS.md의 디자인 토큰을 그대로 반영.

| 파일 | 역할 | expo-app 대응 |
|------|------|---------------|
| `AppColors.kt` | 색상 상수 | `colors.ts` |
| `AppTypography.kt` | 폰트 스케일 (t1/t2/b1/b2/caption) | `typography.ts` |
| `AppShape.kt` | 모서리 반경 | `radius.ts` |
| `AppTheme.kt` | MaterialTheme 래퍼 | `ThemeProvider` |
| `AppButton.kt` | Primary/Secondary/Danger | `AppButton.tsx` |
| `AppTextField.kt` | 에러 메시지 포함 입력 필드 | `AppTextInput.tsx` |
| `AppBadge.kt` | 상태 배지 | `AppBadge.tsx` |
| `AppSkeleton.kt` | shimmer 로딩 | `AppSkeleton.tsx` |
| `AppTopBar.kt` | 상단 바 (TopAppBar 기반) | — |

---

## 9. 빌드 파일 구조

```
android/
├── settings.gradle.kts          # 프로젝트 진입점 — 저장소 + 모듈 선언
├── build.gradle.kts             # 루트 — 플러그인 버전 선언 (apply false)
├── gradle.properties            # JVM 옵션, Android 설정 플래그
├── gradle/
│   ├── libs.versions.toml       # Version Catalog — 모든 의존성 버전 중앙 관리
│   └── wrapper/
│       └── gradle-wrapper.properties  # Gradle 버전 지정 (8.7)
└── app/
    └── build.gradle.kts         # 앱 모듈 — 실제 빌드 구성 + 의존성 선언
```

### Version Catalog 사용법

```toml
# gradle/libs.versions.toml 에서 버전 한 번만 선언
[versions]
retrofit = "2.11.0"

[libraries]
retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
```

```kotlin
// app/build.gradle.kts 에서 libs.xxx 로 참조
implementation(libs.retrofit)  // 버전 명시 불필요
```

---

## 10. 빌드 명령어

```bash
# 디버그 APK 빌드
./gradlew assembleDebug

# 실제 기기용 (API URL 지정)
./gradlew assembleDebug -PAPI_BASE_URL=http://192.168.0.10:3000

# 기기에 설치
./gradlew installDebug

# 전체 클린 후 빌드
./gradlew clean assembleDebug
```

---

## 11. 관련 문서

- `PLAN.md` — 전체 기능 구현 계획 (Phase 0~4)
- `RULES.md` — 개발 규칙 (Safe Area, 컴포넌트 가이드)
