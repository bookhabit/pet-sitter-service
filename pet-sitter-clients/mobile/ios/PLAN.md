# iOS SwiftUI 펫시터 클라이언트 구축 플랜

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 언어 | **Swift 6.x** | 엄격한 동시성(Strict Concurrency), Sendable |
| UI | **SwiftUI** | 선언형 UI, iOS 17+ 최적화 |
| 아키텍처 | **MVVM + Clean Architecture** | SRP 레이어 분리, 테스트 가능 |
| 상태 관리 | **@Observable** (iOS 17+) + **@State / @Binding** | Swift 공식, ObservableObject 대체 |
| 비동기 | **Swift Concurrency** (async/await, Task, Actor) | 구조화된 동시성, 콜백 불필요 |
| 라우팅 | **NavigationStack** + **NavigationPath** | iOS 16+, 타입 안전 딥링크 |
| HTTP | **URLSession** + 커스텀 래퍼 | 외부 의존성 없음, async/await 네이티브 지원 |
| JSON | **Codable** (Swift 표준) | 별도 라이브러리 불필요 |
| DI | **swift-dependencies** | 테스트 가능, 컴파일 타임 안전 |
| 토큰 저장 | **Keychain** (Security.framework) | iOS 표준 보안 저장소 |
| 사진 | **PhotosUI** (PHPickerViewController) | iOS 14+, 권한 최소화 |
| 이미지 로딩 | **AsyncImage** + 커스텀 캐시 | SwiftUI 내장 |
| WebSocket | **Socket.IO Swift** (socket.io-client-swift) | NestJS Gateway 직접 연결 |
| 패키지 관리 | **Swift Package Manager (SPM)** | Xcode 내장, 외부 도구 불필요 |

---

## 2. 아키텍처 원칙 (react-rest SRP 동일 적용)

```
[Data Layer]
  ├─ DTO (Codable)               ← Schema/Zod 대응 — JSON 직렬화 + 타입 정의
  ├─ APIClient (URLSession)      ← Service 대응 — 순수 네트워크 호출
  └─ RepositoryImpl              ← 데이터 조립, Domain 모델로 변환

[Domain Layer]
  ├─ Entity (struct)             ← 앱 내부 도메인 모델 (UI 독립)
  └─ RepositoryProtocol          ← DI 역전 지점 (테스트용 Mock 교체 가능)

[Presentation Layer]
  ├─ ViewModel (@Observable)     ← Query Hook + Logic Hook 대응
  ├─ Screen (SwiftUI View)       ← Container 대응 — 상태 분기
  └─ Component (SwiftUI View)    ← View 대응 — 순수 UI
```

### 레이어별 절대 규칙

| 레이어 | 역할 | 금지 |
|---|---|---|
| DTO | Codable 직렬화만 | 비즈니스 로직, SwiftUI |
| APIClient | URLSession 호출만 | ViewModel, SwiftUI |
| Repository | 데이터 조립 + 변환 | SwiftUI, @State |
| ViewModel | 상태 관리, 비즈니스 로직 | SwiftUI View 직접 조작 |
| Screen | 상태 분기, View 조합 | 직접 네트워크 호출 |
| Component | 렌더링만 | ViewModel 직접 접근 |

---

## 3. 프로젝트 구조

```
PetSitter/
├── App/
│   ├── PetSitterApp.swift          ← @main 진입점
│   ├── AppView.swift               ← Root View (NavigationStack)
│   └── Dependencies.swift          ← swift-dependencies 등록
│
├── Core/
│   ├── Network/
│   │   ├── APIClient.swift         ← URLSession 래퍼 (baseURL, 헤더, Codable 디코딩)
│   │   ├── AuthInterceptor.swift   ← 토큰 자동 주입 + 401 refresh
│   │   ├── NetworkError.swift      ← 상태코드별 에러 타입
│   │   └── MultipartUploader.swift ← 사진 업로드 전용
│   ├── Storage/
│   │   └── KeychainStorage.swift   ← Security.framework 래퍼
│   ├── Auth/
│   │   ├── AuthStore.swift         ← 전역 인증 상태 (@Observable)
│   │   └── TokenRefresher.swift    ← refresh 로직 (Actor)
│   └── Utils/
│       ├── DateUtils.swift         ← ISO 8601 ↔ 한국 날짜 포맷
│       ├── PriceUtils.swift        ← ₩ 포맷
│       └── RoleUtils.swift         ← isPetOwner, isPetSitter
│
├── Data/
│   ├── DTO/                        ← Codable DTO (Zod 대응)
│   │   ├── UserDTO.swift
│   │   ├── JobDTO.swift
│   │   ├── PetDTO.swift
│   │   ├── JobApplicationDTO.swift
│   │   ├── PhotoDTO.swift
│   │   ├── ReviewDTO.swift
│   │   ├── ChatRoomDTO.swift
│   │   ├── MessageDTO.swift
│   │   └── FavoriteDTO.swift
│   └── Repositories/
│       ├── AuthRepositoryImpl.swift
│       ├── JobRepositoryImpl.swift
│       ├── JobApplicationRepositoryImpl.swift
│       ├── PhotoRepositoryImpl.swift
│       ├── ReviewRepositoryImpl.swift
│       ├── ChatRepositoryImpl.swift
│       └── FavoriteRepositoryImpl.swift
│
├── Domain/
│   ├── Entities/                   ← 앱 내부 도메인 모델
│   │   ├── User.swift
│   │   ├── Job.swift
│   │   ├── Pet.swift
│   │   ├── JobApplication.swift
│   │   ├── Review.swift
│   │   ├── ChatRoom.swift
│   │   └── Message.swift
│   └── Protocols/                  ← Repository 인터페이스 (DI 역전)
│       ├── AuthRepositoryProtocol.swift
│       ├── JobRepositoryProtocol.swift
│       ├── JobApplicationRepositoryProtocol.swift
│       ├── PhotoRepositoryProtocol.swift
│       ├── ReviewRepositoryProtocol.swift
│       ├── ChatRepositoryProtocol.swift
│       └── FavoriteRepositoryProtocol.swift
│
├── Presentation/
│   ├── Navigation/
│   │   ├── AppRouter.swift         ← NavigationPath 관리
│   │   └── AppRoute.swift          ← 경로 enum
│   ├── Auth/
│   │   ├── LoginViewModel.swift
│   │   ├── LoginScreen.swift
│   │   ├── RegisterViewModel.swift
│   │   └── RegisterScreen.swift
│   ├── Jobs/
│   │   ├── List/
│   │   │   ├── JobListViewModel.swift
│   │   │   └── JobListScreen.swift
│   │   ├── Detail/
│   │   │   ├── JobDetailViewModel.swift
│   │   │   └── JobDetailScreen.swift
│   │   ├── Create/
│   │   │   ├── JobCreateViewModel.swift
│   │   │   └── JobCreateScreen.swift
│   │   └── Edit/
│   │       ├── JobEditViewModel.swift
│   │       └── JobEditScreen.swift
│   ├── Applications/
│   │   ├── ApplicationListViewModel.swift
│   │   └── ApplicationListScreen.swift
│   ├── Profile/
│   │   ├── ProfileViewModel.swift
│   │   ├── ProfileScreen.swift
│   │   ├── ProfileEditViewModel.swift
│   │   └── ProfileEditScreen.swift
│   ├── Reviews/
│   │   ├── UserReviewsViewModel.swift
│   │   └── UserReviewsScreen.swift
│   ├── Favorites/
│   │   ├── FavoritesViewModel.swift
│   │   └── FavoritesScreen.swift
│   ├── Chat/
│   │   ├── List/
│   │   │   ├── ChatListViewModel.swift
│   │   │   └── ChatListScreen.swift
│   │   └── Room/
│   │       ├── ChatRoomViewModel.swift
│   │       └── ChatRoomScreen.swift
│   └── Admin/
│       ├── AdminViewModel.swift
│       └── AdminScreen.swift
│
├── DesignSystem/
│   ├── Tokens/
│   │   ├── AppColors.swift
│   │   ├── AppTypography.swift
│   │   └── AppSpacing.swift
│   ├── Atoms/
│   │   ├── AppButton.swift
│   │   ├── AppTextField.swift
│   │   ├── AppBadge.swift
│   │   ├── AppSkeleton.swift
│   │   └── AppAvatar.swift
│   └── Components/
│       ├── ErrorView.swift
│       ├── EmptyView.swift
│       ├── LoadingView.swift
│       └── StarRating.swift
│
└── Resources/
    ├── Assets.xcassets
    └── Info.plist
```

---

## 4. Swift Package Manager 의존성 (`Package.swift`)

```swift
dependencies: [
  // DI
  .package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.3.0"),

  // Socket.IO
  .package(url: "https://github.com/socketio/socket.io-client-swift", from: "16.1.0"),

  // (선택) 이미지 캐시 — AsyncImage로 대체 가능
  .package(url: "https://github.com/onevcat/Kingfisher", from: "7.12.0"),
]
```

> URLSession, Codable, Keychain(Security.framework), PhotosUI 는 모두 Apple 표준 프레임워크 — 외부 의존성 없음.

---

## 5. 라우트 구조 (NavigationStack)

```swift
// Domain/Entities/AppRoute.swift
enum AppRoute: Hashable {
  case jobDetail(id: String)
  case jobCreate
  case jobEdit(id: String)
  case applications(jobId: String)
  case userProfile(userId: String)
  case chatRoom(roomId: String, jobApplicationId: String)
  case userReviews(userId: String)
}

// Presentation/Navigation/AppRouter.swift
@Observable
final class AppRouter {
  var path = NavigationPath()

  func push(_ route: AppRoute) { path.append(route) }
  func pop()                   { path.removeLast() }
  func popToRoot()             { path.removeLast(path.count) }
}

// App/AppView.swift
struct AppView: View {
  @State private var router = AppRouter()
  @Environment(AuthStore.self) private var authStore

  var body: some View {
    if !authStore.isHydrated {
      SplashView()
    } else if authStore.isLoggedIn {
      MainTabView()
        .environment(router)
        .navigationDestination(for: AppRoute.self) { route in
          switch route {
          case .jobDetail(let id):           JobDetailScreen(id: id)
          case .jobCreate:                   JobCreateScreen()
          case .jobEdit(let id):             JobEditScreen(id: id)
          case .applications(let jobId):     ApplicationListScreen(jobId: jobId)
          case .userProfile(let userId):     UserProfileScreen(userId: userId)
          case .chatRoom(let roomId, let jobAppId): ChatRoomScreen(roomId: roomId, jobApplicationId: jobAppId)
          case .userReviews(let userId):     UserReviewsScreen(userId: userId)
          }
        }
    } else {
      AuthFlow()
    }
  }
}
```

---

## 6. 인증 플로우 (JWT + Keychain)

### Keychain 토큰 저장

```swift
// Core/Storage/KeychainStorage.swift
final class KeychainStorage {
  static let shared = KeychainStorage()

  func save(_ value: String, forKey key: String) {
    let data = Data(value.utf8)
    let query: [String: Any] = [
      kSecClass as String:            kSecClassGenericPassword,
      kSecAttrAccount as String:      key,
      kSecValueData as String:        data,
      kSecAttrAccessible as String:   kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
    ]
    SecItemDelete(query as CFDictionary)
    SecItemAdd(query as CFDictionary, nil)
  }

  func load(forKey key: String) -> String? {
    let query: [String: Any] = [
      kSecClass as String:       kSecClassGenericPassword,
      kSecAttrAccount as String: key,
      kSecReturnData as String:  true,
      kSecMatchLimit as String:  kSecMatchLimitOne,
    ]
    var item: CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
          let data = item as? Data else { return nil }
    return String(data: data, encoding: .utf8)
  }

  func delete(forKey key: String) {
    let query: [String: Any] = [
      kSecClass as String:       kSecClassGenericPassword,
      kSecAttrAccount as String: key,
    ]
    SecItemDelete(query as CFDictionary)
  }
}
```

### AuthStore (전역 인증 상태)

```swift
// Core/Auth/AuthStore.swift
@Observable
final class AuthStore {
  var user:        User?    = nil
  var isLoggedIn:  Bool     = false
  var isHydrated:  Bool     = false  // Keychain 초기 로드 완료 여부

  private let keychain = KeychainStorage.shared

  func hydrate() async {
    guard let token = keychain.load(forKey: "access_token") else {
      isHydrated = true
      return
    }
    do {
      user       = try await AuthRepositoryImpl.shared.getMe(token: token)
      isLoggedIn = true
    } catch {
      keychain.delete(forKey: "access_token")
      keychain.delete(forKey: "refresh_token")
    }
    isHydrated = true
  }

  func login(email: String, password: String) async throws {
    let result = try await AuthRepositoryImpl.shared.login(email: email, password: password)
    keychain.save(result.accessToken,  forKey: "access_token")
    keychain.save(result.refreshToken, forKey: "refresh_token")
    user       = result.user
    isLoggedIn = true
  }

  func logout() {
    keychain.delete(forKey: "access_token")
    keychain.delete(forKey: "refresh_token")
    user       = nil
    isLoggedIn = false
  }
}
```

### 401 자동 갱신 (Actor — Thread-safe)

```swift
// Core/Auth/TokenRefresher.swift
actor TokenRefresher {
  private var isRefreshing = false
  private var waiters: [CheckedContinuation<String, Error>] = []

  func refresh() async throws -> String {
    if isRefreshing {
      // 동시 요청 대기
      return try await withCheckedThrowingContinuation { waiters.append($0) }
    }

    isRefreshing = true
    defer { isRefreshing = false }

    do {
      let refreshToken = KeychainStorage.shared.load(forKey: "refresh_token")!
      let newTokens = try await AuthRepositoryImpl.shared.refresh(token: refreshToken)
      KeychainStorage.shared.save(newTokens.accessToken,  forKey: "access_token")
      KeychainStorage.shared.save(newTokens.refreshToken, forKey: "refresh_token")
      waiters.forEach { $0.resume(returning: newTokens.accessToken) }
      waiters.removeAll()
      return newTokens.accessToken
    } catch {
      waiters.forEach { $0.resume(throwing: error) }
      waiters.removeAll()
      throw error
    }
  }
}
```

### APIClient — 401 처리

```swift
// Core/Network/APIClient.swift
func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
  var req = endpoint.urlRequest(baseURL: baseURL)

  if let token = KeychainStorage.shared.load(forKey: "access_token") {
    req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
  }

  let (data, response) = try await URLSession.shared.data(for: req)
  let http = response as! HTTPURLResponse

  if http.statusCode == 401 {
    let newToken = try await tokenRefresher.refresh()
    req.setValue("Bearer \(newToken)", forHTTPHeaderField: "Authorization")
    let (retryData, _) = try await URLSession.shared.data(for: req)
    return try JSONDecoder.iso8601.decode(T.self, from: retryData)
  }

  guard (200..<300).contains(http.statusCode) else {
    throw NetworkError.httpError(statusCode: http.statusCode, data: data)
  }

  return try JSONDecoder.iso8601.decode(T.self, from: data)
}
```

---

## 7. DTO — Codable (Zod 대응)

```swift
// Data/DTO/JobDTO.swift
struct JobDTO: Codable {
  let id: String
  let activity: String
  let startTime: String
  let endTime: String
  let address: String?
  let latitude: Double?
  let longitude: Double?
  let price: Int?
  let priceType: String?
  let creatorUserId: String
  let pets: [PetDTO]
  let photos: [PhotoDTO]
  let createdAt: String

  enum CodingKeys: String, CodingKey {
    case id, activity, address, latitude, longitude, price, pets, photos
    case startTime    = "start_time"
    case endTime      = "end_time"
    case priceType    = "price_type"
    case creatorUserId = "creator_user_id"
    case createdAt    = "created_at"
  }

  // Domain 모델로 변환
  func toDomain() -> Job {
    Job(id: id, activity: activity, startTime: startTime, /* ... */)
  }
}

struct PetDTO: Codable {
  let id: String
  let name: String
  let age: Int
  let species: String
  let breed: String
  let size: String?
  let photos: [PhotoDTO]
}
```

---

## 8. ViewModel — @Observable (Query Hook + Logic Hook 대응)

### LoadingState 패턴

```swift
// 공통 상태 enum
enum LoadingState<T> {
  case idle
  case loading
  case success(T)
  case failure(Error)

  var value: T? {
    guard case .success(let v) = self else { return nil }
    return v
  }
}
```

### GET ViewModel

```swift
// Presentation/Jobs/Detail/JobDetailViewModel.swift
@Observable
final class JobDetailViewModel {
  var state: LoadingState<Job> = .idle
  private let jobId: String
  @ObservationIgnored private let repository: any JobRepositoryProtocol

  init(jobId: String, repository: some JobRepositoryProtocol = JobRepositoryImpl()) {
    self.jobId = jobId
    self.repository = repository
  }

  func load() async {
    state = .loading
    do {
      let job = try await repository.getJob(id: jobId)
      state = .success(job)
    } catch {
      state = .failure(error)
    }
  }
}
```

### POST ViewModel (Mutation)

```swift
// Presentation/Jobs/Create/JobCreateViewModel.swift
@Observable
final class JobCreateViewModel {
  // 폼 상태
  var activity   = ""
  var startTime  = Date()
  var endTime    = Date()
  var address    = ""
  var price      = ""
  var pets: [PetFormState] = [PetFormState()]
  var photoIds:  [String]  = []

  // 요청 상태
  var isLoading  = false
  var errorMessage: String?

  // 완료 이벤트 (Navigation용)
  var createdJobId: String?

  @ObservationIgnored private let jobRepository: any JobRepositoryProtocol
  @ObservationIgnored private let photoRepository: any PhotoRepositoryProtocol

  func uploadPhoto(data: Data, filename: String) async {
    isLoading = true
    defer { isLoading = false }
    do {
      let photos = try await photoRepository.upload(data: data, filename: filename)
      photoIds += photos.map(\.id)
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func submit() async {
    isLoading = true
    defer { isLoading = false }
    do {
      let job = try await jobRepository.createJob(buildRequest())
      createdJobId = job.id
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
```

---

## 9. Screen — 상태 분기 (Container 대응)

```swift
// Presentation/Jobs/Detail/JobDetailScreen.swift
struct JobDetailScreen: View {
  let id: String
  @State private var viewModel: JobDetailViewModel

  init(id: String) {
    self.id = id
    _viewModel = State(initialValue: JobDetailViewModel(jobId: id))
  }

  var body: some View {
    Group {
      switch viewModel.state {
      case .idle, .loading:
        JobDetailSkeleton()

      case .failure(let error):
        ErrorView(message: error.localizedDescription) {
          Task { await viewModel.load() }
        }

      case .success(let job):
        JobDetailView(job: job)
      }
    }
    .navigationTitle("공고 상세")
    .task { await viewModel.load() }
  }
}
```

---

## 10. 공고 목록 — 커서 기반 무한 스크롤

```swift
// Presentation/Jobs/List/JobListViewModel.swift
@Observable
final class JobListViewModel {
  var jobs:      [Job]   = []
  var isLoading: Bool    = false
  var hasMore:   Bool    = true
  var cursor:    String? = nil
  var errorMessage: String?
  var filter = JobFilter()

  @ObservationIgnored private let repository: any JobRepositoryProtocol

  func loadInitial() async {
    guard !isLoading else { return }
    isLoading = true
    jobs      = []
    cursor    = nil
    hasMore   = true
    await fetchPage()
  }

  func loadMore() async {
    guard !isLoading && hasMore else { return }
    isLoading = true
    await fetchPage()
  }

  private func fetchPage() async {
    defer { isLoading = false }
    do {
      let response = try await repository.getJobs(filter: filter, cursor: cursor)
      jobs   += response.items
      cursor  = response.pageInfo.endCursor
      hasMore = response.pageInfo.hasNextPage
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}

// JobListScreen.swift
struct JobListScreen: View {
  @State private var viewModel = JobListViewModel()

  var body: some View {
    List {
      ForEach(viewModel.jobs, id: \.id) { job in
        JobCard(job: job)
          .onAppear {
            if job.id == viewModel.jobs.last?.id {
              Task { await viewModel.loadMore() }
            }
          }
      }

      if viewModel.isLoading {
        ProgressView().frame(maxWidth: .infinity)
      }

      if let error = viewModel.errorMessage {
        ErrorView(message: error) {
          Task { await viewModel.loadInitial() }
        }
      }
    }
    .task { await viewModel.loadInitial() }
  }
}
```

---

## 11. 사진 업로드 (PhotosUI)

```swift
// Screen에서 PhotosPicker
struct JobCreateScreen: View {
  @State private var viewModel = JobCreateViewModel()
  @State private var selectedItems: [PhotosPickerItem] = []

  var body: some View {
    Form {
      // ...
      PhotosPicker(
        selection: $selectedItems,
        maxSelectionCount: 5,
        matching: .images
      ) {
        Label("사진 추가", systemImage: "photo.on.rectangle.angled")
      }
      .onChange(of: selectedItems) { _, items in
        Task {
          for item in items {
            guard let data = try? await item.loadTransferable(type: Data.self) else { continue }
            await viewModel.uploadPhoto(data: data, filename: UUID().uuidString + ".jpg")
          }
          selectedItems.removeAll()
        }
      }
    }
  }
}

// Repository 업로드
func upload(data: Data, filename: String) async throws -> [Photo] {
  let boundary = UUID().uuidString
  var body = Data()
  body.append("--\(boundary)\r\n".data(using: .utf8)!)
  body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
  body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
  body.append(data)
  body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

  var request = URLRequest(url: URL(string: "\(baseURL)/photos/upload")!)
  request.httpMethod = "POST"
  request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
  request.httpBody = body

  return try await apiClient.upload(request: request)
}
```

---

## 12. 채팅 — Socket.IO (socket.io-client-swift)

```swift
// Presentation/Chat/Room/ChatRoomViewModel.swift
@Observable
final class ChatRoomViewModel {
  var messages:    [Message] = []
  var isConnected: Bool      = false
  var chatRoomId:  String?   = nil
  var isLoading:   Bool      = false

  @ObservationIgnored private var socket: SocketIOClient?
  @ObservationIgnored private let jobApplicationId: String
  @ObservationIgnored private let repository: any ChatRepositoryProtocol

  init(roomId: String, jobApplicationId: String, repository: some ChatRepositoryProtocol = ChatRepositoryImpl()) {
    self.jobApplicationId = jobApplicationId
    self.repository       = repository
  }

  func setup() async {
    // 1. REST로 히스토리 로드
    isLoading = true
    if let history = try? await repository.getMessages(limit: 30) {
      messages = history
    }
    isLoading = false

    // 2. Socket.IO 연결
    let token = KeychainStorage.shared.load(forKey: "access_token") ?? ""
    let manager = SocketManager(
      socketURL: URL(string: apiBaseURL)!,
      config: [.log(false), .compress, .connectParams(["token": token])]
    )
    socket = manager.socket(forNamespace: "/chat")

    socket?.on(clientEvent: .connect) { [weak self] _, _ in
      guard let self else { return }
      self.socket?.emit("joinRoom", ["jobApplicationId": self.jobApplicationId])
    }

    socket?.on("joinedRoom") { [weak self] data, _ in
      guard let self,
            let dict = data.first as? [String: Any],
            let id = dict["chatRoomId"] as? String else { return }
      self.chatRoomId  = id
      self.isConnected = true
    }

    socket?.on("receiveMessage") { [weak self] data, _ in
      guard let self,
            let dict = data.first as? [String: Any],
            let message = Message(dict: dict) else { return }
      self.messages.append(message)
    }

    socket?.on("error") { [weak self] data, _ in
      // 에러 처리
    }

    socket?.connect()
  }

  func send(content: String) {
    guard let roomId = chatRoomId else { return }
    socket?.emit("sendMessage", ["chatRoomId": roomId, "content": content])
  }

  func disconnect() {
    socket?.disconnect()
  }
}

// ChatRoomScreen.swift
struct ChatRoomScreen: View {
  let roomId:           String
  let jobApplicationId: String
  @State private var viewModel: ChatRoomViewModel
  @State private var inputText = ""

  var body: some View {
    VStack {
      ScrollViewReader { proxy in
        ScrollView {
          LazyVStack {
            ForEach(viewModel.messages, id: \.id) { msg in
              MessageBubble(message: msg)
                .id(msg.id)
            }
          }
        }
        .onChange(of: viewModel.messages.count) { _, _ in
          proxy.scrollTo(viewModel.messages.last?.id, anchor: .bottom)
        }
      }

      HStack {
        TextField("메시지 입력...", text: $inputText)
          .textFieldStyle(.roundedBorder)
        Button("전송") {
          viewModel.send(content: inputText)
          inputText = ""
        }
        .disabled(inputText.isEmpty || !viewModel.isConnected)
      }
      .padding()
    }
    .navigationTitle("채팅")
    .task { await viewModel.setup() }
    .onDisappear { viewModel.disconnect() }
  }
}
```

---

## 13. 에러 처리 구조

```
PetSitterApp (@main)
  └─ AppView (NavigationStack)
       └─ 각 Screen에서 LoadingState 분기
            ├─ .idle / .loading → Skeleton
            ├─ .failure         → ErrorView (재시도 → Task { await vm.load() })
            └─ .success
                 └─ data.isEmpty → EmptyView
                    data.notEmpty → ContentView
```

### 에러 타입별 처리

| 에러 종류 | 처리 위치 | 방법 |
|---|---|---|
| 런타임 예외 | `@main` Task catch | 전체화면 에러 View |
| API GET 에러 | `LoadingState.failure` 분기 | ErrorView + 재시도 |
| API POST 에러 | `viewModel.errorMessage` | `.alert` 또는 Toast |
| 401 | `TokenRefresher` Actor | 토큰 갱신 or 로그아웃 |
| 빈 데이터 | `.success` + isEmpty | EmptyView |

---

## 14. 디자인 시스템

### 색상 토큰 (`DesignSystem/Tokens/AppColors.swift`)

```swift
extension Color {
  static let appPrimary       = Color(hex: "#3182F6")
  static let appTextPrimary   = Color(hex: "#191F28")
  static let appTextSecondary = Color(hex: "#4E5968")
  static let appGrey200       = Color(hex: "#E5E8EB")
  static let appBackground    = Color(hex: "#F2F4F6")
  static let appSuccess       = Color(hex: "#12B76A")
  static let appWarning       = Color(hex: "#F79009")
  static let appDanger        = Color(hex: "#F04438")
}
```

### 타이포그래피

| 스케일 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| `t1` | 24pt | Bold | 화면 제목 |
| `t2` | 20pt | Semibold | 섹션 제목 |
| `b1` | 16pt | Regular | 본문 |
| `b2` | 14pt | Regular | 보조 본문 |
| `caption` | 12pt | Regular | 캡션, 에러 |

```swift
extension Font {
  static let appT1      = Font.system(size: 24, weight: .bold)
  static let appT2      = Font.system(size: 20, weight: .semibold)
  static let appB1      = Font.system(size: 16, weight: .regular)
  static let appB2      = Font.system(size: 14, weight: .regular)
  static let appCaption = Font.system(size: 12, weight: .regular)
}
```

### 간격 (8px Grid)

```swift
enum AppSpacing {
  static let xxs: CGFloat =  2
  static let xs:  CGFloat =  4
  static let sm:  CGFloat =  8
  static let md:  CGFloat = 16
  static let lg:  CGFloat = 24
  static let xl:  CGFloat = 32
  static let xxl: CGFloat = 48
}

// ✅ 올바른 사용
Spacer().frame(height: AppSpacing.md)
.padding(AppSpacing.lg)
// ❌ 임의 값 금지
.padding(15)
```

---

## 15. 탭 네비게이션 구조

```swift
// MainTabView.swift
struct MainTabView: View {
  @Environment(AuthStore.self) private var authStore

  var body: some View {
    TabView {
      JobListScreen()
        .tabItem { Label("홈", systemImage: "house") }

      if authStore.user?.isPetSitter == true {
        FavoritesScreen()
          .tabItem { Label("즐겨찾기", systemImage: "heart") }
      }

      ChatListScreen()
        .tabItem { Label("채팅", systemImage: "bubble.left.and.bubble.right") }

      ProfileScreen()
        .tabItem { Label("프로필", systemImage: "person") }
    }
  }
}
```

---

## 16. Expo / Flutter / Android / iOS 비교

| 항목 | Expo (RN) | Flutter | Android | iOS |
|---|---|---|---|---|
| 언어 | TypeScript | Dart | Kotlin | **Swift** |
| UI | React Native | Flutter Widget | Jetpack Compose | **SwiftUI** |
| 상태 관리 | TanStack Query + Zustand | Riverpod | ViewModel + StateFlow | **@Observable + LoadingState** |
| HTTP | axios | Dio | Retrofit | **URLSession** |
| JSON | Zod | Freezed + json_serializable | kotlinx.serialization | **Codable** |
| DI | Provider 패턴 | Riverpod | Hilt | **swift-dependencies** |
| 비동기 | async/await | async/await | Coroutines + Flow | **Swift Concurrency (actor)** |
| 무한 스크롤 | useSuspenseInfiniteQuery | fetchMore() | Paging 3 | **커서 기반 수동 구현** |
| 토큰 저장 | expo-secure-store | flutter_secure_storage | EncryptedSharedPreferences | **Keychain (Security.framework)** |
| 사진 | expo-image-picker | image_picker | Photo Picker API | **PhotosUI (PHPickerViewController)** |
| Socket.io | socket.io-client | socket_io_client | socket.io-client (Java) | **socket.io-client-swift** |
| 코드 생성 | 없음 | build_runner | KSP (Hilt) | **없음 (Swift 컴파일러가 처리)** |
| 에러 처리 | ErrorBoundary | AsyncValue switch | UiState sealed class | **LoadingState enum + Group** |
| Thread 안전 | — | — | Coroutine scope | **Actor (Swift 6 Strict Concurrency)** |

---

## 17. 구현 순서

1. **프로젝트 셋업** — Xcode, SPM 의존성, 폴더 구조
2. **Core 레이어** — KeychainStorage, APIClient, TokenRefresher (Actor)
3. **인증** — AuthStore (@Observable), NavigationStack guard, 로그인/회원가입 화면
4. **공고 목록/상세** — 커서 기반 무한 스크롤 (가장 핵심)
5. **공고 CRUD** — 사진 업로드 (PhotosUI) 포함
6. **지원 관리** — 지원/승인/거절
7. **프로필** — 사진 업로드
8. **리뷰** 작성/삭제
9. **즐겨찾기** 토글/목록
10. **채팅** — socket.io-client-swift + 히스토리 REST
11. **에러 처리 완성** — LoadingState 전 화면 정리
12. **디자인 시스템 정리** — Skeleton, Alert, 공통 Component

---

## 18. 참고 서버 파일

| 파일 | 용도 |
|---|---|
| `src/chat/chat.gateway.ts` | Socket.IO 이벤트명 및 auth 핸드셰이크 (`auth.token`) |
| `src/jobs/dto/create-job-dto.ts` | 공고 생성 바디 구조 (중첩 `pets[]`, `photo_ids[]`) |
| `src/jobs/dto/search-job-query.dto.ts` | 공고 필터 쿼리 파라미터 전체 목록 |
| `src/sessions/sessions.controller.ts` | 로그인/갱신/로그아웃 요청/응답 형식 |
| `src/photos/photos.controller.ts` | 파일 업로드 엔드포인트 및 필드명 |

## 19. 참고 클라이언트 파일

| 파일 | 용도 |
|---|---|
| `web/react-rest/docs/SRP_ARCHITECTURE.md` | 레이어별 책임 분리 규칙 (Swift로 동일 적용) |
| `web/react-rest/docs/API_CONVENTION.md` | HTTP 레이어 구조, 토큰 갱신 패턴 |
| `web/react-rest/docs/Exception_Handling.md` | 4-state 에러 처리 (LoadingState enum으로 대응) |
| `web/react-rest/docs/DESIGN_SYSTEM.md` | 디자인 토큰 (AppColors, AppTypography, AppSpacing) |
| `mobile/expo/PLAN.md` | Expo 플랜 (동일 기능, RN 스택) |
| `mobile/flutter/PLAN.md` | Flutter 플랜 (동일 기능, Dart 스택) |
| `mobile/android/PLAN.md` | Android 플랜 (동일 기능, Kotlin 스택) |

---

**문서 버전**: 1.0
**최종 수정일**: 2026-03-23
