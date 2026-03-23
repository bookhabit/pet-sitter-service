# Android Jetpack Compose 펫시터 클라이언트 구축 플랜

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 언어 | **Kotlin 2.x** | 코루틴, null safety, 확장함수 |
| UI | **Jetpack Compose** | 선언형 UI, Material 3 |
| 아키텍처 | **MVVM + Clean Architecture** | SRP 레이어 분리, 테스트 가능 |
| DI | **Hilt** | Jetpack 공식, ViewModel 주입 |
| 라우팅 | **Navigation Compose** | 타입 안전 딥링크, 백스택 관리 |
| HTTP | **Retrofit 2 + OkHttp 4** | Interceptor (토큰 자동 갱신), 멀티파트 업로드 |
| JSON | **kotlinx.serialization** | Kotlin 공식, Retrofit 연동 |
| 서버 상태 | **ViewModel + StateFlow** | Compose 생명주기 연동 |
| 비동기 | **Kotlin Coroutines + Flow** | 구조화된 동시성 |
| 무한 스크롤 | **Paging 3** | 커서/페이지 기반 페이징 공식 지원 |
| 토큰 저장 | **EncryptedSharedPreferences** | AES256 암호화, Keystore 기반 |
| 사진 | **Photo Picker API** (Android 13+) / `ActivityResultContracts` | 갤러리/카메라 |
| 이미지 로딩 | **Coil 3** | Compose 전용, Coroutine 기반 |
| WebSocket | **OkHttp WebSocket** + Socket.IO 이벤트 파싱 | NestJS Gateway 연결 |
| 빌드 | **Gradle KTS (Kotlin DSL)** + **Version Catalog** | 의존성 일원 관리 |

---

## 2. 아키텍처 원칙 (react-rest SRP 동일 적용)

Clean Architecture 3계층으로 react-rest의 레이어를 매핑한다.

```
[Data Layer]
  ├─ Model (kotlinx.serialization)   ← Schema/Zod 대응 — DTO 정의 + 직렬화
  ├─ RemoteDataSource (Retrofit)     ← Service 대응 — 순수 네트워크 호출
  └─ Repository Impl                 ← 데이터 조립

[Domain Layer]
  ├─ Entity                          ← 앱 내부 도메인 모델 (UI 독립)
  └─ Repository Interface            ← DI 역전 지점

[Presentation Layer]
  ├─ ViewModel (StateFlow)           ← Query Hook + Logic Hook 대응
  ├─ Screen (Composable)             ← Container 대응 — 상태 분기
  └─ Component (Composable)          ← View 대응 — 순수 UI
```

### 레이어별 절대 규칙

| 레이어 | 역할 | 금지 |
|---|---|---|
| Model/DTO | JSON 직렬화만 | 비즈니스 로직, Android API |
| RemoteDataSource | Retrofit 호출만 | ViewModel, Compose |
| Repository | 데이터 조립 | UI 코드, Context |
| ViewModel | 상태 관리, 비즈니스 로직 | Composable 호출, UI import |
| Screen | 상태 분기, Composable 조합 | 직접 네트워크 호출 |
| Component | 렌더링만 | ViewModel 직접 접근 |

---

## 3. 프로젝트 구조

```
app/src/main/java/com/petsitter/
│
├── core/
│   ├── network/
│   │   ├── RetrofitClient.kt          ← publicRetrofit, privateRetrofit
│   │   ├── AuthInterceptor.kt         ← 토큰 자동 주입 + 401 refresh
│   │   └── NetworkResult.kt           ← sealed class (Success/Error/Loading)
│   ├── storage/
│   │   └── EncryptedTokenStorage.kt   ← EncryptedSharedPreferences 래퍼
│   ├── di/
│   │   ├── NetworkModule.kt           ← Hilt @Module (Retrofit, OkHttp)
│   │   ├── RepositoryModule.kt        ← Repository 바인딩
│   │   └── StorageModule.kt
│   └── util/
│       ├── DateUtils.kt               ← ISO 8601 ↔ 한국 날짜 포맷
│       ├── PriceUtils.kt              ← ₩ 포맷
│       └── RoleUtils.kt               ← isPetOwner, isPetSitter
│
├── data/
│   ├── remote/
│   │   ├── api/
│   │   │   ├── AuthApi.kt             ← Retrofit interface (login, refresh)
│   │   │   ├── JobApi.kt
│   │   │   ├── JobApplicationApi.kt
│   │   │   ├── PhotoApi.kt
│   │   │   ├── ReviewApi.kt
│   │   │   ├── ChatApi.kt
│   │   │   └── FavoriteApi.kt
│   │   └── dto/                       ← kotlinx.serialization DTO (Zod 대응)
│   │       ├── UserDto.kt
│   │       ├── JobDto.kt
│   │       ├── PetDto.kt
│   │       ├── JobApplicationDto.kt
│   │       ├── PhotoDto.kt
│   │       ├── ReviewDto.kt
│   │       ├── ChatRoomDto.kt
│   │       ├── MessageDto.kt
│   │       └── FavoriteDto.kt
│   ├── repository/
│   │   ├── AuthRepositoryImpl.kt
│   │   ├── JobRepositoryImpl.kt
│   │   ├── JobApplicationRepositoryImpl.kt
│   │   ├── PhotoRepositoryImpl.kt
│   │   ├── ReviewRepositoryImpl.kt
│   │   ├── ChatRepositoryImpl.kt
│   │   └── FavoriteRepositoryImpl.kt
│   └── paging/
│       └── JobPagingSource.kt         ← Paging 3 PagingSource
│
├── domain/
│   ├── model/                         ← 앱 내부 도메인 모델 (UI 독립)
│   │   ├── User.kt
│   │   ├── Job.kt
│   │   ├── Pet.kt
│   │   ├── JobApplication.kt
│   │   ├── Review.kt
│   │   ├── ChatRoom.kt
│   │   └── Message.kt
│   └── repository/                    ← Repository 인터페이스
│       ├── AuthRepository.kt
│       ├── JobRepository.kt
│       ├── JobApplicationRepository.kt
│       ├── PhotoRepository.kt
│       ├── ReviewRepository.kt
│       ├── ChatRepository.kt
│       └── FavoriteRepository.kt
│
├── presentation/
│   ├── navigation/
│   │   ├── AppNavHost.kt              ← Navigation Compose 정의
│   │   └── AppRoute.kt                ← 경로 sealed class
│   ├── auth/
│   │   ├── LoginViewModel.kt
│   │   ├── LoginScreen.kt
│   │   ├── RegisterViewModel.kt
│   │   └── RegisterScreen.kt
│   ├── jobs/
│   │   ├── list/
│   │   │   ├── JobListViewModel.kt
│   │   │   └── JobListScreen.kt
│   │   ├── detail/
│   │   │   ├── JobDetailViewModel.kt
│   │   │   └── JobDetailScreen.kt
│   │   ├── create/
│   │   │   ├── JobCreateViewModel.kt
│   │   │   └── JobCreateScreen.kt
│   │   └── edit/
│   │       ├── JobEditViewModel.kt
│   │       └── JobEditScreen.kt
│   ├── applications/
│   │   ├── ApplicationListViewModel.kt
│   │   └── ApplicationListScreen.kt
│   ├── profile/
│   │   ├── ProfileViewModel.kt
│   │   ├── ProfileScreen.kt
│   │   ├── ProfileEditViewModel.kt
│   │   └── ProfileEditScreen.kt
│   ├── reviews/
│   │   ├── UserReviewsViewModel.kt
│   │   └── UserReviewsScreen.kt
│   ├── favorites/
│   │   ├── FavoritesViewModel.kt
│   │   └── FavoritesScreen.kt
│   ├── chat/
│   │   ├── list/
│   │   │   ├── ChatListViewModel.kt
│   │   │   └── ChatListScreen.kt
│   │   └── room/
│   │       ├── ChatRoomViewModel.kt
│   │       └── ChatRoomScreen.kt
│   └── admin/
│       ├── AdminViewModel.kt
│       └── AdminScreen.kt
│
├── ui/
│   ├── theme/
│   │   ├── AppColors.kt               ← 디자인 토큰 색상
│   │   ├── AppTypography.kt           ← 타이포그래피 스케일
│   │   ├── AppShape.kt                ← BorderRadius
│   │   └── AppTheme.kt                ← MaterialTheme 구성
│   ├── components/                    ← 공통 Composable (View 대응)
│   │   ├── AppButton.kt
│   │   ├── AppTextField.kt
│   │   ├── AppBadge.kt
│   │   ├── AppSkeleton.kt
│   │   ├── AppAvatar.kt
│   │   ├── StarRating.kt
│   │   └── ErrorView.kt
│   │   └── EmptyView.kt
│   └── jobs/
│       ├── JobCard.kt
│       ├── PetCard.kt
│       └── JobListSkeleton.kt
│
└── MainActivity.kt
```

---

## 4. Gradle 의존성 (`libs.versions.toml`)

```toml
[versions]
kotlin              = "2.0.0"
compose-bom         = "2024.06.00"
hilt                = "2.51.1"
retrofit            = "2.11.0"
okhttp              = "4.12.0"
kotlinx-serial      = "1.7.1"
paging              = "3.3.0"
coil                = "3.0.0"
navigation-compose  = "2.8.0"
security-crypto     = "1.1.0-alpha06"

[libraries]
# Compose BOM
compose-bom         = { group = "androidx.compose", name = "compose-bom", version.ref = "compose-bom" }
compose-ui          = { group = "androidx.compose.ui", name = "ui" }
compose-material3   = { group = "androidx.compose.material3", name = "material3" }

# Navigation
navigation-compose  = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigation-compose" }

# Hilt
hilt-android        = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler       = { group = "com.google.dagger", name = "hilt-compiler", version.ref = "hilt" }
hilt-navigation     = { group = "androidx.hilt", name = "hilt-navigation-compose", version = "1.2.0" }

# Network
retrofit            = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
retrofit-kotlinx    = { group = "com.jakewharton.retrofit", name = "retrofit2-kotlinx-serialization-converter", version = "1.0.0" }
okhttp              = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
okhttp-logging      = { group = "com.squareup.okhttp3", name = "logging-interceptor", version.ref = "okhttp" }

# Serialization
kotlinx-serial      = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinx-serial" }

# Paging
paging-runtime      = { group = "androidx.paging", name = "paging-runtime", version.ref = "paging" }
paging-compose      = { group = "androidx.paging", name = "paging-compose", version.ref = "paging" }

# Image
coil-compose        = { group = "io.coil-kt.coil3", name = "coil-compose", version.ref = "coil" }

# Security
security-crypto     = { group = "androidx.security", name = "security-crypto", version.ref = "security-crypto" }

# Socket.IO
socket-io           = { group = "io.socket", name = "socket.io-client", version = "2.1.0" }
```

---

## 5. 라우트 구조 (Navigation Compose)

```kotlin
// presentation/navigation/AppRoute.kt
sealed class AppRoute(val route: String) {
  data object Login       : AppRoute("login")
  data object Register    : AppRoute("register")
  data object JobList     : AppRoute("jobs")
  data class  JobDetail   (val id: String) : AppRoute("jobs/{id}")
  data object JobCreate   : AppRoute("jobs/create")
  data class  JobEdit     (val id: String) : AppRoute("jobs/{id}/edit")
  data class  Applications(val jobId: String) : AppRoute("jobs/{jobId}/applications")
  data object Favorites   : AppRoute("favorites")
  data object Profile     : AppRoute("profile")
  data class  UserProfile (val userId: String) : AppRoute("users/{userId}")
  data object ChatList    : AppRoute("chat")
  data class  ChatRoom    (val roomId: String) : AppRoute("chat/{roomId}")
  data object Admin       : AppRoute("admin")
}

// presentation/navigation/AppNavHost.kt
@Composable
fun AppNavHost(navController: NavHostController) {
  val authState by authViewModel.uiState.collectAsStateWithLifecycle()

  NavHost(
    navController = navController,
    startDestination = if (authState.isLoggedIn) AppRoute.JobList.route else AppRoute.Login.route
  ) {
    composable(AppRoute.Login.route)    { LoginScreen(navController) }
    composable(AppRoute.Register.route) { RegisterScreen(navController) }
    composable(AppRoute.JobList.route)  { JobListScreen(navController) }
    composable("jobs/{id}") { backStackEntry ->
      JobDetailScreen(id = backStackEntry.arguments?.getString("id")!!, navController)
    }
    // ... 이하 동일 패턴
  }
}
```

---

## 6. 인증 플로우 (JWT + EncryptedSharedPreferences)

### 토큰 저장

```kotlin
// core/storage/EncryptedTokenStorage.kt
class EncryptedTokenStorage @Inject constructor(@ApplicationContext context: Context) {

  private val prefs = EncryptedSharedPreferences.create(
    context,
    "auth_tokens",
    MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
  )

  fun saveTokens(access: String, refresh: String) {
    prefs.edit()
        .putString("access_token", access)
        .putString("refresh_token", refresh)
        .apply()
  }

  fun getAccessToken():  String? = prefs.getString("access_token", null)
  fun getRefreshToken(): String? = prefs.getString("refresh_token", null)
  fun clearTokens() = prefs.edit().clear().apply()
}
```

### AuthInterceptor (OkHttp)

```kotlin
// core/network/AuthInterceptor.kt
class AuthInterceptor @Inject constructor(
  private val storage: EncryptedTokenStorage,
  private val authRepository: AuthRepository,
) : Interceptor {

  override fun intercept(chain: Interceptor.Chain): Response {
    val request = chain.request().newBuilder()
        .header("Authorization", "Bearer ${storage.getAccessToken()}")
        .build()

    val response = chain.proceed(request)

    if (response.code == 401) {
      response.close()
      return runBlocking {
        try {
          val newToken = authRepository.refreshToken(storage.getRefreshToken()!!)
          storage.saveTokens(newToken.accessToken, newToken.refreshToken)
          chain.proceed(
            chain.request().newBuilder()
                .header("Authorization", "Bearer ${newToken.accessToken}")
                .build()
          )
        } catch (e: Exception) {
          storage.clearTokens()
          // 로그아웃 이벤트 전파 (SharedFlow)
          authEventBus.emit(AuthEvent.Unauthorized)
          response
        }
      }
    }

    return response
  }
}
```

### AuthViewModel (앱 전역 인증 상태)

```kotlin
@HiltViewModel
class AuthViewModel @Inject constructor(
  private val authRepository: AuthRepository,
  private val storage: EncryptedTokenStorage,
) : ViewModel() {

  private val _uiState = MutableStateFlow(AuthUiState())
  val uiState = _uiState.asStateFlow()

  init {
    // 앱 시작 시 토큰 복구
    viewModelScope.launch {
      val token = storage.getAccessToken()
      if (token != null) {
        runCatching { authRepository.getMe() }
            .onSuccess { user -> _uiState.update { it.copy(user = user, isLoggedIn = true) } }
            .onFailure { storage.clearTokens() }
      }
      _uiState.update { it.copy(isHydrated = true) }
    }
  }
}
```

---

## 7. DTO — kotlinx.serialization (Zod 대응)

```kotlin
// data/remote/dto/JobDto.kt
@Serializable
data class JobDto(
  val id: String,
  val activity: String,
  @SerialName("start_time") val startTime: String,
  @SerialName("end_time")   val endTime: String,
  val address: String? = null,
  val latitude: Double? = null,
  val longitude: Double? = null,
  val price: Int? = null,
  @SerialName("price_type") val priceType: String? = null,
  @SerialName("creator_user_id") val creatorUserId: String,
  val pets: List<PetDto>,
  val photos: List<PhotoDto>,
  @SerialName("created_at") val createdAt: String,
)

@Serializable
data class PetDto(
  val id: String,
  val name: String,
  val age: Int,
  val species: String,
  val breed: String,
  val size: String? = null,
  val photos: List<PhotoDto> = emptyList(),
)

// Domain 모델로 매핑
fun JobDto.toDomain() = Job(
  id = id,
  activity = activity,
  startTime = startTime,
  // ...
)
```

---

## 8. Retrofit API Interface

```kotlin
// data/remote/api/JobApi.kt
interface JobApi {
  @GET("jobs")
  suspend fun getJobs(@QueryMap filters: Map<String, String>): JobListResponse

  @GET("jobs/{id}")
  suspend fun getJob(@Path("id") id: String): JobDto

  @POST("jobs")
  suspend fun createJob(@Body body: CreateJobRequest): JobDto

  @PUT("jobs/{id}")
  suspend fun updateJob(@Path("id") id: String, @Body body: UpdateJobRequest): JobDto

  @DELETE("jobs/{id}")
  suspend fun deleteJob(@Path("id") id: String)

  @Multipart
  @POST("photos/upload")
  suspend fun uploadPhoto(@Part file: MultipartBody.Part): List<PhotoDto>
}
```

---

## 9. ViewModel — UiState + StateFlow (Query Hook 대응)

### UiState sealed class 패턴

```kotlin
// presentation/jobs/detail/JobDetailViewModel.kt
sealed class JobDetailUiState {
  data object Loading                  : JobDetailUiState()
  data class  Success(val job: Job)    : JobDetailUiState()
  data class  Error(val message: String, val onRetry: () -> Unit) : JobDetailUiState()
}

@HiltViewModel
class JobDetailViewModel @Inject constructor(
  private val jobRepository: JobRepository,
  savedStateHandle: SavedStateHandle,
) : ViewModel() {

  private val jobId = savedStateHandle.get<String>("id")!!

  private val _uiState = MutableStateFlow<JobDetailUiState>(JobDetailUiState.Loading)
  val uiState = _uiState.asStateFlow()

  init { loadJob() }

  fun loadJob() {
    viewModelScope.launch {
      _uiState.value = JobDetailUiState.Loading
      runCatching { jobRepository.getJob(jobId) }
          .onSuccess { _uiState.value = JobDetailUiState.Success(it) }
          .onFailure { _uiState.value = JobDetailUiState.Error(it.message ?: "오류 발생", ::loadJob) }
    }
  }
}
```

### Mutation 패턴 (POST/PUT/DELETE)

```kotlin
// presentation/jobs/create/JobCreateViewModel.kt
data class JobCreateUiState(
  val isLoading: Boolean = false,
  val isSuccess: Boolean = false,
  val errorMessage: String? = null,
  // 폼 필드
  val activity: String = "",
  val pets: List<PetFormState> = listOf(PetFormState()),
  val photoIds: List<String> = emptyList(),
)

@HiltViewModel
class JobCreateViewModel @Inject constructor(
  private val jobRepository: JobRepository,
  private val photoRepository: PhotoRepository,
) : ViewModel() {

  private val _uiState = MutableStateFlow(JobCreateUiState())
  val uiState = _uiState.asStateFlow()

  // One-shot 이벤트 (네비게이션 등)
  private val _events = MutableSharedFlow<JobCreateEvent>()
  val events = _events.asSharedFlow()

  fun uploadPhoto(uri: Uri, contentResolver: ContentResolver) {
    viewModelScope.launch {
      _uiState.update { it.copy(isLoading = true) }
      runCatching { photoRepository.upload(uri, contentResolver) }
          .onSuccess { photos ->
            _uiState.update { it.copy(photoIds = it.photoIds + photos.map { p -> p.id }, isLoading = false) }
          }
          .onFailure { _uiState.update { it.copy(errorMessage = it.errorMessage, isLoading = false) } }
    }
  }

  fun submit() {
    viewModelScope.launch {
      _uiState.update { it.copy(isLoading = true) }
      runCatching { jobRepository.createJob(_uiState.value.toRequest()) }
          .onSuccess { job -> _events.emit(JobCreateEvent.NavigateToDetail(job.id)) }
          .onFailure { _uiState.update { it.copy(errorMessage = it.message, isLoading = false) } }
    }
  }
}
```

---

## 10. Screen — 상태 분기 (Container 대응)

```kotlin
// presentation/jobs/detail/JobDetailScreen.kt
@Composable
fun JobDetailScreen(
  id: String,
  navController: NavController,
  viewModel: JobDetailViewModel = hiltViewModel(),
) {
  val uiState by viewModel.uiState.collectAsStateWithLifecycle()

  Scaffold(
    topBar = { TopAppBar(title = { Text("공고 상세") }, navigationIcon = { BackButton(navController) }) }
  ) { padding ->
    when (val state = uiState) {
      is JobDetailUiState.Loading -> JobDetailSkeleton(modifier = Modifier.padding(padding))
      is JobDetailUiState.Error   -> ErrorView(
          message = state.message,
          onRetry = state.onRetry,
          modifier = Modifier.padding(padding),
        )
      is JobDetailUiState.Success -> JobDetailView(
          job = state.job,
          onApply = { navController.navigate("jobs/${id}/apply") },
          onEdit  = { navController.navigate("jobs/${id}/edit") },
          modifier = Modifier.padding(padding),
        )
    }
  }
}
```

---

## 11. 공고 목록 — Paging 3 (무한 스크롤)

```kotlin
// data/paging/JobPagingSource.kt
class JobPagingSource(
  private val jobApi: JobApi,
  private val filters: JobFilter,
) : PagingSource<String, Job>() {

  override suspend fun load(params: LoadParams<String>): LoadResult<String, Job> {
    return try {
      val response = jobApi.getJobs(
        filters.toQueryMap() + mapOf("cursor" to (params.key ?: ""), "limit" to "${params.loadSize}")
      )
      LoadResult.Page(
        data      = response.items.map { it.toDomain() },
        prevKey   = null,
        nextKey   = if (response.pageInfo.hasNextPage) response.pageInfo.endCursor else null,
      )
    } catch (e: Exception) {
      LoadResult.Error(e)
    }
  }

  override fun getRefreshKey(state: PagingState<String, Job>) = state.anchorPosition?.let {
    state.closestPageToPosition(it)?.prevKey
  }
}

// ViewModel
@HiltViewModel
class JobListViewModel @Inject constructor(private val jobRepository: JobRepository) : ViewModel() {
  private val _filter = MutableStateFlow(JobFilter())

  val jobs: Flow<PagingData<Job>> = _filter.flatMapLatest { filter ->
    jobRepository.getJobsPaged(filter).cachedIn(viewModelScope)
  }
}

// Screen
@Composable
fun JobListScreen(viewModel: JobListViewModel = hiltViewModel()) {
  val jobs = viewModel.jobs.collectAsLazyPagingItems()

  LazyColumn {
    items(count = jobs.itemCount, key = { jobs[it]?.id ?: it }) { index ->
      jobs[index]?.let { job -> JobCard(job = job) }
    }
    item {
      when (val state = jobs.loadState.append) {
        is LoadState.Loading -> CircularProgressIndicator()
        is LoadState.Error   -> ErrorView(message = state.error.message ?: "", onRetry = jobs::retry)
        else -> Unit
      }
    }
  }
}
```

---

## 12. 사진 업로드

```kotlin
// Android Photo Picker (API 33+) 또는 ActivityResultContracts

// Screen에서 launcher 등록
val photoPickerLauncher = rememberLauncherForActivityResult(
  contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 5)
) { uris ->
  uris.forEach { uri -> viewModel.uploadPhoto(uri, context.contentResolver) }
}

// 버튼 클릭 시
photoPickerLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))

// ViewModel → Repository
suspend fun upload(uri: Uri, contentResolver: ContentResolver): List<Photo> {
  val stream = contentResolver.openInputStream(uri)!!
  val bytes  = stream.readBytes()
  val part   = MultipartBody.Part.createFormData(
    name     = "file",
    filename = "photo.jpg",
    body     = bytes.toRequestBody("image/jpeg".toMediaTypeOrNull()),
  )
  return jobApi.uploadPhoto(part).map { it.toDomain() }
}
```

---

## 13. 채팅 — Socket.IO (OkHttp 기반)

```kotlin
// presentation/chat/room/ChatRoomViewModel.kt
@HiltViewModel
class ChatRoomViewModel @Inject constructor(
  private val chatRepository: ChatRepository,
  private val storage: EncryptedTokenStorage,
  savedStateHandle: SavedStateHandle,
) : ViewModel() {

  private val roomId = savedStateHandle.get<String>("roomId")!!
  private val jobApplicationId = savedStateHandle.get<String>("jobApplicationId")!!

  private val _messages = MutableStateFlow<List<Message>>(emptyList())
  val messages = _messages.asStateFlow()

  private var socket: Socket? = null

  init {
    loadHistory()
    connectSocket()
  }

  private fun loadHistory() {
    viewModelScope.launch {
      val history = chatRepository.getMessages(roomId, limit = 30)
      _messages.value = history
    }
  }

  private fun connectSocket() {
    val opts = IO.Options.builder()
        .setAuth(mapOf("token" to storage.getAccessToken()))
        .setTransports(arrayOf("websocket"))
        .build()

    socket = IO.socket("$API_BASE_URL/chat", opts)

    socket?.on(Socket.EVENT_CONNECT) {
      socket?.emit("joinRoom", JSONObject(mapOf("jobApplicationId" to jobApplicationId)))
    }

    socket?.on("receiveMessage") { args ->
      val data = args[0] as JSONObject
      val message = data.toMessage()
      _messages.update { it + message }
    }

    socket?.on("error") { args ->
      // 에러 처리
    }

    socket?.connect()
  }

  fun sendMessage(content: String) {
    socket?.emit("sendMessage", JSONObject(mapOf("chatRoomId" to roomId, "content" to content)))
  }

  override fun onCleared() {
    socket?.disconnect()
    super.onCleared()
  }
}
```

---

## 14. 에러 처리 구조

```
MainActivity
  └─ AppNavHost
       └─ 각 Screen에서 UiState 분기
            ├─ Loading → Skeleton
            ├─ Error   → ErrorView (재시도 버튼 → viewModel.retry())
            └─ Success
                 └─ data.isEmpty → EmptyView
                    data.isNotEmpty → ContentView
```

### 에러 타입별 처리

| 에러 종류 | 처리 위치 | 방법 |
|---|---|---|
| 런타임 예외 | `Thread.setDefaultUncaughtExceptionHandler` | 전체화면 에러 액티비티 |
| API GET 에러 | `UiState.Error` 분기 | ErrorView + 재시도 |
| API POST/Mutation 에러 | `SharedFlow<Event>` | Snackbar |
| 401 | `AuthInterceptor` | 토큰 갱신 or 로그아웃 |
| 빈 데이터 | `UiState.Success` + isEmpty | EmptyView |

---

## 15. 디자인 시스템 (`ui/theme/`)

### 색상 토큰

```kotlin
// ui/theme/AppColors.kt
object AppColors {
  val Primary        = Color(0xFF3182F6)
  val TextPrimary    = Color(0xFF191F28)
  val TextSecondary  = Color(0xFF4E5968)
  val Grey200        = Color(0xFFE5E8EB)
  val Background     = Color(0xFFF2F4F6)
  val Success        = Color(0xFF12B76A)
  val Warning        = Color(0xFFF79009)
  val Danger         = Color(0xFFF04438)
}
```

### 타이포그래피

| 스케일 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| `t1` | 24sp | Bold | 화면 제목 |
| `t2` | 20sp | Bold | 섹션 제목 |
| `b1` | 16sp | Normal | 본문 |
| `b2` | 14sp | Normal | 보조 본문 |
| `caption` | 12sp | Normal | 캡션, 에러 |

### 간격 (8px Grid)

```kotlin
object AppSpacing {
  val xxs =  2.dp
  val xs  =  4.dp
  val sm  =  8.dp
  val md  = 16.dp
  val lg  = 24.dp
  val xl  = 32.dp
  val xxl = 48.dp
}

// ✅ 올바른 사용
Spacer(modifier = Modifier.height(AppSpacing.md))
// ❌ 임의 값 금지
Modifier.padding(top = 15.dp)
```

---

## 16. 탭 네비게이션 구조

```kotlin
// BottomNavigation Composable
// 역할별 탭 노출

val tabs = buildList {
  add(Tab.Home)         // 전체
  if (isPetSitter) add(Tab.Favorites)
  add(Tab.Chat)         // 전체
  add(Tab.Profile)      // 전체
}
```

---

## 17. Expo / Flutter / Android 비교

| 항목 | Expo (RN) | Flutter | Android (Jetpack) |
|---|---|---|---|
| 언어 | TypeScript | Dart | Kotlin |
| UI | React Native | Flutter Widget | Jetpack Compose |
| 아키텍처 | SRP 레이어 | Clean Arch (Riverpod) | Clean Arch (MVVM + Hilt) |
| 상태 관리 | TanStack Query + Zustand | Riverpod AsyncNotifier | ViewModel + StateFlow |
| HTTP | axios + interceptor | Dio + Interceptor | Retrofit + OkHttp Interceptor |
| JSON | Zod (런타임 검증) | Freezed + json_serializable | kotlinx.serialization |
| DI | 없음 (Provider 패턴) | Riverpod 자체 | Hilt |
| 무한 스크롤 | useSuspenseInfiniteQuery | JobsNotifier.fetchMore() | Paging 3 |
| 토큰 저장 | expo-secure-store | flutter_secure_storage | EncryptedSharedPreferences |
| 사진 | expo-image-picker | image_picker | Photo Picker API |
| Socket.io | socket.io-client | socket_io_client | socket.io-client (Java) |
| 코드 생성 | 없음 | build_runner (Freezed) | kapt/KSP (Hilt, Room) |
| 에러 처리 | ErrorBoundary + AsyncValue | AsyncValue switch | UiState sealed class |

---

## 18. 구현 순서

1. **프로젝트 셋업** — Gradle KTS, Version Catalog, Hilt, Compose BOM
2. **Core 레이어** — EncryptedTokenStorage, RetrofitClient, AuthInterceptor
3. **인증** — AuthViewModel, GoRouter guard, 로그인/회원가입 화면
4. **공고 목록/상세** — Paging 3 + JobPagingSource (가장 핵심)
5. **공고 CRUD** — 사진 업로드 (Photo Picker) 포함
6. **지원 관리** — 지원/승인/거절
7. **프로필** — 사진 업로드
8. **리뷰** 작성/삭제
9. **즐겨찾기** 토글/목록
10. **채팅** — Socket.IO + 히스토리 REST
11. **에러 처리 완성** — UiState 전 화면 정리
12. **디자인 시스템 정리** — Skeleton, Snackbar, 공통 Composable

---

## 19. 참고 서버 파일

| 파일 | 용도 |
|---|---|
| `src/chat/chat.gateway.ts` | Socket.IO 이벤트명 및 auth 핸드셰이크 (`auth.token`) |
| `src/jobs/dto/create-job-dto.ts` | 공고 생성 바디 구조 (중첩 `pets[]`, `photo_ids[]`) |
| `src/jobs/dto/search-job-query.dto.ts` | 공고 필터 쿼리 파라미터 전체 목록 |
| `src/sessions/sessions.controller.ts` | 로그인/갱신/로그아웃 요청/응답 형식 |
| `src/photos/photos.controller.ts` | 파일 업로드 엔드포인트 및 필드명 |

## 20. 참고 클라이언트 파일

| 파일 | 용도 |
|---|---|
| `web/react-rest/docs/SRP_ARCHITECTURE.md` | 레이어별 책임 분리 규칙 (Kotlin으로 동일 적용) |
| `web/react-rest/docs/API_CONVENTION.md` | HTTP 레이어 구조, 토큰 갱신 Interceptor |
| `web/react-rest/docs/Exception_Handling.md` | 4-state 에러 처리 (UiState sealed class로 대응) |
| `web/react-rest/docs/DESIGN_SYSTEM.md` | 디자인 토큰 (AppColors, AppTypography, AppSpacing) |
| `mobile/expo/PLAN.md` | Expo 플랜 (동일 기능, RN 스택) |
| `mobile/flutter/PLAN.md` | Flutter 플랜 (동일 기능, Dart 스택) |

---

**문서 버전**: 1.0
**최종 수정일**: 2026-03-23
