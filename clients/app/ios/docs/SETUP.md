# iOS 프로젝트 셋업 정리

> expo-app, Android와 동일한 SRP 아키텍처를 iOS(Swift 6 / SwiftUI / URLSession)로 구현한 Phase 0+1 정리

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 언어 | Swift 6 (Strict Concurrency) |
| UI | SwiftUI (iOS 17+) |
| 아키텍처 | MVVM + Clean Architecture |
| DI | 수동 DI (Hilt 없음 — 구조는 동일) |
| 네트워크 | URLSession (Codable 기반) |
| 상태 관리 | @Observable + @MainActor |
| 토큰 저장 | Keychain (Security.framework) |
| 빌드 도구 | XcodeGen (project.yml → .xcodeproj 생성) |
| 최소 iOS | 17.0 |

---

## 2. 폴더 구조

```
ios/
├── project.yml                    # XcodeGen 명세 — .xcodeproj 생성 원본
└── PetSitter/
    │
    ├── App/
    │   ├── PetSitterApp.swift     # @main 진입점 — AuthStore 주입, hydrate() 호출
    │   └── AppView.swift          # 루트 뷰 — isHydrated 가드 + 라우팅 분기
    │
    ├── Core/                      # 앱 전반 공통 인프라
    │   ├── Config/
    │   │   └── APIConfig.swift    # Info.plist → API_BASE_URL 읽기
    │   ├── Network/
    │   │   ├── APIClient.swift    # URLSession 래퍼 — 인증/공개 요청, 401 재시도
    │   │   └── NetworkError.swift # LocalizedError enum (한글 메시지 포함)
    │   ├── Storage/
    │   │   └── KeychainStorage.swift  # Security.framework CRUD (토큰 저장소)
    │   └── Auth/
    │       ├── TokenRefresher.swift   # actor — 동시 401 시 refresh 1회만 실행
    │       └── AuthStore.swift        # @Observable @MainActor — 전역 인증 상태
    │
    ├── Data/                      # 외부 데이터 소스 (서버 통신)
    │   ├── DTO/
    │   │   └── UserDTO.swift      # Codable DTO + toDomain() 변환
    │   └── Repositories/
    │       └── AuthRepositoryImpl.swift  # AuthRepositoryProtocol 구현체
    │
    ├── Domain/                    # 비즈니스 로직 (프레임워크 의존 없음)
    │   ├── Entities/
    │   │   └── User.swift         # Domain 모델 + UserRole enum
    │   └── Protocols/
    │       └── AuthRepositoryProtocol.swift  # DIP 인터페이스
    │
    ├── Presentation/              # UI 레이어 (SwiftUI 화면 + ViewModel)
    │   ├── Navigation/
    │   │   ├── AppRoute.swift     # Hashable enum (라우트 경로)
    │   │   └── AppRouter.swift    # @Observable NavigationPath 래퍼
    │   ├── Auth/
    │   │   ├── AuthFlowView.swift # NavigationStack 진입점 (비인증 플로우)
    │   │   ├── LoginViewModel.swift
    │   │   ├── LoginScreen.swift
    │   │   ├── RegisterViewModel.swift
    │   │   └── RegisterScreen.swift
    │   ├── Jobs/List/
    │   │   └── JobListScreen.swift    # placeholder
    │   ├── Favorites/
    │   │   └── FavoritesScreen.swift  # placeholder
    │   ├── Chat/List/
    │   │   └── ChatListScreen.swift   # placeholder
    │   ├── Profile/
    │   │   ├── ProfileViewModel.swift
    │   │   └── ProfileScreen.swift
    │   └── MainTabView.swift      # TabView — 역할별 탭 구성
    │
    └── DesignSystem/
        ├── Tokens/
        │   ├── AppColors.swift    # 색상 토큰 (hex 초기화 헬퍼 포함)
        │   ├── AppTypography.swift # 폰트 스케일 (t1/t2/b1/b2/caption)
        │   └── AppSpacing.swift   # 간격 토큰
        ├── Atoms/
        │   ├── AppButton.swift    # Primary/Secondary/Danger
        │   ├── AppTextField.swift # 에러 메시지 + placeholder 색상 포함
        │   ├── AppBadge.swift
        │   └── AppSkeleton.swift  # shimmer 로딩 스켈레톤
        └── Components/
            ├── ErrorView.swift
            ├── EmptyView.swift
            └── LoadingView.swift
```

---

## 3. XcodeGen — 빌드 시스템

Android가 Gradle을 사용하듯, iOS는 **XcodeGen**으로 `.xcodeproj`를 선언적으로 관리한다.

```
문제: .xcodeproj는 XML 기반 바이너리 → 팀 협업 시 git 충돌 빈발
해결: project.yml 만 커밋 → 각자 xcodegen generate 로 재생성
```

```bash
# 최초 설정 또는 project.yml 변경 후
brew install xcodegen   # 최초 1회
xcodegen generate       # .xcodeproj 생성
open PetSitter.xcodeproj
```

**비교: 플랫폼별 프로젝트 파일 관리**

| 플랫폼 | 관리 방식 | 커밋 파일 |
|--------|-----------|-----------|
| Android | Gradle (.kts) | `build.gradle.kts`, `libs.versions.toml` |
| iOS | XcodeGen (.yml) | `project.yml` |
| expo-app | Expo config | `app.json`, `package.json` |

---

## 4. 환경별 API Base URL

Android의 `buildConfigField`, expo-app의 `apiBaseUrl.ts`와 동일한 역할을 `project.yml` + `APIConfig.swift`가 담당한다.

```
우선순위:
  1. Xcode Build Settings → User-Defined → API_BASE_URL 직접 설정  ← 실제 기기
  2. project.yml configs.Debug.API_BASE_URL = ""                     ← 시뮬레이터
  3. APIConfig 기본값 http://localhost:3000                           ← 빈 문자열 시 fallback
```

| 환경 | URL |
|------|-----|
| iOS 시뮬레이터 | `http://localhost:3000` (Mac의 로컬 서버) |
| 실제 기기 | `http://192.168.x.x:3000` (같은 네트워크 IP) |

```swift
// APIConfig.swift
enum APIConfig {
    static let baseURL: String = {
        let url = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String ?? ""
        return url.isEmpty ? "http://localhost:3000" : url
    }()
}
```

> **Android와의 차이**: Android 에뮬레이터는 `10.0.2.2`로 호스트 접근.
> iOS 시뮬레이터는 Mac과 네트워크를 공유하므로 `localhost`가 바로 동작한다.

---

## 5. Clean Architecture 레이어

```
서버 응답 (JSON)
    ↓
[Data Layer]
  UserDTO.swift          — Codable, 서버 스키마 그대로 반영
  AuthRepositoryImpl     — DTO → Domain 변환, Protocol 구현
    ↓
[Domain Layer]
  User.swift             — 앱 내부 도메인 모델 (프레임워크 의존 없음)
  AuthRepositoryProtocol — 인터페이스 (DIP: Impl이 이것을 구현)
    ↓
[Presentation Layer]
  AuthStore              — isHydrated 패턴, 전역 인증 상태
  LoginViewModel         — 폼 상태만 관리
  LoginScreen            — 렌더링만, 로직은 ViewModel
```

### DIP (의존성 역전 원칙)

```swift
// Domain/Protocols/AuthRepositoryProtocol.swift — 인터페이스
protocol AuthRepositoryProtocol {
    func login(email: String, password: String) async throws -> (accessToken: String, refreshToken: String, user: User)
    func getMe() async throws -> User
}

// Data/Repositories/AuthRepositoryImpl.swift — 구현체
final class AuthRepositoryImpl: AuthRepositoryProtocol { ... }
```

> Android는 Hilt `@Binds`로 인터페이스→구현체 연결.
> iOS는 수동 DI — `AuthStore`가 직접 `AuthRepositoryImpl.shared`를 사용.
> 현재 Phase 0+1은 단일 구현체이므로 수동 DI로 충분.

---

## 6. Swift 6 Strict Concurrency

project.yml에 `SWIFT_STRICT_CONCURRENCY: complete` 설정 — Sendable 체크를 포함한 최고 수준의 동시성 안전 검사.

### @Observable @MainActor 패턴

```swift
// AuthStore.swift
@Observable       // iOS 17+ ObservableObject 대체 — SwiftUI 반응형 상태
@MainActor        // 모든 프로퍼티 접근/변경이 메인 스레드에서만 일어남을 보장
final class AuthStore {
    var isLoggedIn = false
    var isHydrated = false

    // @MainActor 클래스 내 async 메서드는
    // MainActor.run {} 없이 직접 프로퍼티 수정 가능
    func hydrate() async {
        defer { isHydrated = true }
        // ...
        isLoggedIn = true  // MainActor 보장으로 안전
    }
}
```

**비교: Android와의 차이**

| | Android | iOS |
|-|---------|-----|
| 상태 관리 | `StateFlow` + `collectAsStateWithLifecycle` | `@Observable` + `@MainActor` |
| 메인 스레드 | `withContext(Dispatchers.Main)` | `@MainActor` 선언으로 자동 |
| 스레드 안전 클래스 | `@Singleton` Hilt 제공 | `@unchecked Sendable` + 불변 초기화 |

### @unchecked Sendable 패턴

```swift
// APIClient, KeychainStorage, AuthRepositoryImpl 공통 패턴
final class APIClient: @unchecked Sendable {
    static let shared = APIClient()
    private init() {}
    // 모든 프로퍼티는 let (불변) — 실제로는 Sendable 안전
}
```

> `JSONDecoder`/`JSONEncoder`가 Swift 6에서 Sendable 미준수.
> `let`으로 초기화 후 불변 사용이므로 `@unchecked Sendable`로 안전 선언.

---

## 7. 인증 플로우 (expo-app isHydrated 패턴 대응)

### isHydrated 패턴

```swift
// PetSitterApp.swift
WindowGroup {
    AppView()
        .environment(authStore)
        .task { await authStore.hydrate() }  // 앱 시작 시 Keychain 복원
}

// AppView.swift
if !authStore.isHydrated {
    LoadingView()          // 복원 전: 스피너 (라우팅 결정 보류)
} else if authStore.isLoggedIn {
    MainTabView()          // 복원 완료 + 로그인 상태
} else {
    AuthFlowView()         // 복원 완료 + 비로그인 상태
}
```

**비교: 플랫폼별 isHydrated 구현**

| 플랫폼 | 저장소 | hydration 처리 |
|--------|--------|----------------|
| expo-app | expo-secure-store (async) | `useAuthStore`의 `isHydrated` state |
| Android | EncryptedSharedPreferences | `AuthViewModel` init 블록 |
| iOS | Keychain (Security.framework) | `PetSitterApp.task { hydrate() }` |

---

## 8. 401 자동 토큰 갱신 (TokenRefresher)

```
URLSession 요청
    → APIClient.request(): Keychain에서 access_token 주입
    → 401 응답 시:
        1. TokenRefresher.shared.refresh() 호출
        2. actor 보장: 동시에 여러 401이 와도 refresh는 1회만 실행
           나머지 요청은 waiters 배열에서 대기
        3. 성공: 새 토큰 저장 → waiters 전부 resume → 원래 요청 재시도
        4. 실패: waiters 전부 에러 resume → Keychain 삭제 → 강제 로그아웃
    → AuthStore.forceLogout() → isLoggedIn = false → AppView가 AuthFlowView로 전환
```

**비교: 플랫폼별 동시 401 처리**

| 플랫폼 | 방식 |
|--------|------|
| expo-app | axios interceptor + `failedQueue` 배열 |
| Android | OkHttp `runBlocking` (스레드 풀 직렬화) |
| iOS | Swift `actor` + `CheckedContinuation` waiters |

```swift
// TokenRefresher.swift 핵심 구조
actor TokenRefresher {
    private var isRefreshing = false
    private var waiters: [CheckedContinuation<String, Error>] = []

    func refresh() async throws -> String {
        if isRefreshing {
            // 이미 갱신 중 → 완료 때까지 대기
            return try await withCheckedThrowingContinuation { waiters.append($0) }
        }
        isRefreshing = true
        // ... refresh 실행 후 waiters.forEach { $0.resume(...) }
    }
}
```

> `actor`는 Swift의 동시성 안전 타입.
> 내부 상태(`isRefreshing`, `waiters`)에 대한 접근이 직렬화되어 race condition이 원천 차단된다.

---

## 9. 상태 관리 — @Observable vs ObservableObject

iOS 17 이전까지는 `ObservableObject` + `@Published`를 사용했다.
이 프로젝트는 iOS 17+만 지원하므로 최신 `@Observable`을 사용한다.

```swift
// 구버전 (iOS 16 이하)
class AuthStore: ObservableObject {
    @Published var isLoggedIn = false
}
// 뷰에서
@StateObject private var authStore = AuthStore()
@EnvironmentObject var authStore: AuthStore

// 신버전 (iOS 17+ — 이 프로젝트)
@Observable
class AuthStore {
    var isLoggedIn = false   // @Published 불필요
}
// 뷰에서
@State private var authStore = AuthStore()
@Environment(AuthStore.self) private var authStore
```

**장점**: `@Published` 제거, `@StateObject`/`@EnvironmentObject` 대신 `@State`/`@Environment` 통일.

---

## 10. 네비게이션 구조

```
PetSitterApp (.task → hydrate)
    └── AppView
         ├─ isHydrated = false → LoadingView
         │
         ├─ isLoggedIn = false → AuthFlowView
         │    └── NavigationStack
         │         ├─ LoginScreen (root)
         │         └─ RegisterScreen (NavigationLink)
         │
         └─ isLoggedIn = true  → MainTabView
              └── TabView
                   ├─ 구인공고    → JobListScreen
                   ├─ 즐겨찾기   → FavoritesScreen  (PetSitter 역할만 탭 표시)
                   ├─ 채팅        → ChatListScreen
                   └─ 프로필      → ProfileScreen
```

**비교: 플랫폼별 네비게이션**

| 플랫폼 | 방식 |
|--------|------|
| expo-app | React Navigation Stack + Tab |
| Android | Compose NavHost + NavigationBar |
| iOS | NavigationStack + TabView |

---

## 11. 디자인 시스템

STANDARDS.md의 디자인 토큰을 그대로 반영.

| 파일 | 역할 | expo-app 대응 |
|------|------|---------------|
| `AppColors.swift` | 색상 상수 + hex 초기화 헬퍼 | `colors.ts` |
| `AppTypography.swift` | 폰트 스케일 (t1/t2/b1/b2/caption) | `typography.ts` |
| `AppSpacing.swift` | 간격 토큰 | `spacing.ts` |
| `AppButton.swift` | Primary/Secondary/Danger | `AppButton.tsx` |
| `AppTextField.swift` | 에러 메시지 + placeholder 색상 | `AppTextInput.tsx` |
| `AppBadge.swift` | 상태 배지 | `AppBadge.tsx` |
| `AppSkeleton.swift` | shimmer 로딩 스켈레톤 | `AppSkeleton.tsx` |

### AppTextField 특이사항

SwiftUI의 `TextField(placeholder, text: $text)` 는 placeholder 색상을 직접 설정할 수 없다.
`prompt:` 파라미터를 사용해야 명시적 색상 지정이 가능하다.

```swift
TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(AppColors.grey400))
```

---

## 12. 폼 유효성 검사 패턴

`submitted` 플래그로 첫 제출 전까지 에러를 숨긴다.

```swift
// LoginViewModel.swift
var submitted = false

var emailError: String? {
    guard submitted else { return nil }  // 제출 전: 에러 없음
    if email.isEmpty { return "이메일을 입력해주세요" }
    if !email.contains("@") { return "올바른 이메일 형식이 아닙니다" }
    return nil
}

// LoginScreen.swift
AppButton(title: "로그인") {
    viewModel.submitted = true     // ← 이 시점부터 에러 표시 시작
    guard viewModel.isValid else { return }
    // ...
}
```

**비교: 플랫폼별 폼 유효성 패턴**

| 플랫폼 | 패턴 |
|--------|------|
| expo-app | `touched` 상태 + `onBlur` 트리거 |
| Android | `submitted: Boolean` StateFlow |
| iOS | `submitted: Bool` @Observable 프로퍼티 |

---

## 13. 빌드 파일 구조

```
ios/
├── project.yml                        # XcodeGen 명세 (유일한 빌드 설정 파일)
└── PetSitter/
    └── Info.plist                     # xcodegen 자동 생성 — 커밋 제외 (.gitignore)
```

### project.yml 주요 설정

```yaml
targets:
  PetSitter:
    settings:
      base:
        SWIFT_VERSION: "6.0"
        SWIFT_STRICT_CONCURRENCY: complete   # Swift 6 최고 수준 동시성 검사
        IPHONEOS_DEPLOYMENT_TARGET: "17.0"
        API_BASE_URL: ""                     # 빈 문자열 → APIConfig에서 localhost 사용
    dependencies:
      - sdk: Security.framework              # Keychain 사용을 위한 프레임워크 링킹
```

---

## 14. 빌드 명령어

```bash
# 프로젝트 파일 생성 (최초 또는 project.yml 변경 후 필수)
xcodegen generate

# Xcode에서 열기
open PetSitter.xcodeproj

# 실제 기기용 API URL 설정
# Xcode → PetSitter target → Build Settings → User-Defined → API_BASE_URL
# 값: http://192.168.x.x:3000
```

---

## 15. 관련 문서

- `RULES.md` — Safe Area 처리 규칙 (coming soon)
- `../android/docs/SETUP.md` — Android 프로젝트 셋업
