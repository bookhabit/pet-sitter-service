// ─────────────────────────────────────────────────────────────────────────────
// app/build.gradle.kts — 앱 모듈(:app) 빌드 설정
//
// 루트 build.gradle.kts가 "플러그인 선언"이라면,
// 이 파일은 "플러그인 적용 + 실제 빌드 구성"을 담당한다.
// ─────────────────────────────────────────────────────────────────────────────

plugins {
    alias(libs.plugins.android.application)   // android {} 블록 활성화, APK 빌드
    alias(libs.plugins.kotlin.android)         // Kotlin 소스 컴파일
    alias(libs.plugins.kotlin.compose)         // @Composable 컴파일러 플러그인
    alias(libs.plugins.kotlin.serialization)   // @Serializable 어노테이션 처리
    alias(libs.plugins.hilt)                   // Hilt DI 컴포넌트 생성
    alias(libs.plugins.ksp)                    // 어노테이션 프로세서 (Hilt 코드 생성)
}

android {
    // 앱의 Java 패키지 경로 — R.java, BuildConfig 생성 시 기준이 됨
    namespace = "com.petsitter"

    // 컴파일 시 사용할 Android API 레벨
    // 최신 API를 소스에서 참조할 수 있는 기준 (실제 실행 기기와는 무관)
    compileSdk = 35

    defaultConfig {
        // 앱 고유 식별자 — Play Store 등록 및 기기 설치 시 사용
        applicationId = "com.petsitter"

        // 앱이 실행될 수 있는 최소 Android 버전
        // 26 = Android 8.0 (EncryptedSharedPreferences 지원 시작 버전)
        minSdk = 26

        // 개발·테스트 기준 Android 버전
        // compileSdk 와 동일하게 맞추는 것이 표준
        targetSdk = 35

        // 내부 버전 번호 — Play Store 업데이트 판별용 (정수, 올릴 때마다 증가)
        versionCode = 1

        // 사용자에게 표시되는 버전 문자열
        versionName = "1.0"

        // ── API Base URL (환경별 분기) ────────────────────────────────────────
        // BuildConfig.API_BASE_URL 로 코드에서 참조 (ApiConfig.kt)
        //
        // 우선순위:
        //   1. 빌드 시 -PAPI_BASE_URL=http://192.168.x.x:3000 (실제 기기)
        //   2. gradle.properties 에 API_BASE_URL=... (팀 공통 설정)
        //   3. 기본값 10.0.2.2:3000 (Android 에뮬레이터 → 호스트 머신 localhost)
        //
        // 10.0.2.2 = Android 에뮬레이터에서 호스트 PC의 localhost를 가리키는 특수 IP
        val apiBaseUrl = project.findProperty("API_BASE_URL")?.toString()
            ?: "http://10.0.2.2:3000"
        buildConfigField("String", "API_BASE_URL", "\"$apiBaseUrl\"")
    }

    buildTypes {
        release {
            // 코드 난독화·최적화 (ProGuard/R8) — 현재는 비활성
            // 실무 배포 시 true로 변경 권장
            isMinifyEnabled = false
            proguardFiles(
                // Android 기본 제공 ProGuard 규칙
                getDefaultProguardFile("proguard-android-optimize.txt"),
                // 프로젝트 커스텀 규칙 (proguard-rules.pro)
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        // Java 소스 호환성 — Java 17 문법(record, sealed class 등) 사용 가능
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        // Kotlin 컴파일 타겟 JVM 버전 — compileOptions와 맞춰야 함
        jvmTarget = "17"
    }

    buildFeatures {
        // Jetpack Compose 활성화 — @Composable 함수 사용 가능
        compose = true
        // BuildConfig 클래스 생성 — BuildConfig.API_BASE_URL 등 참조 가능
        buildConfig = true
    }
}

dependencies {
    // ── AndroidX Core ──────────────────────────────────────────────────────────
    implementation(libs.core.ktx)          // Kotlin 확장 (context, bundle 등)
    implementation(libs.activity.compose)  // ComponentActivity.setContent {} 진입점

    // ── Lifecycle ──────────────────────────────────────────────────────────────
    implementation(libs.lifecycle.viewmodel)  // ViewModel + viewModelScope
    implementation(libs.lifecycle.runtime)    // repeatOnLifecycle
    implementation(libs.lifecycle.compose)    // collectAsStateWithLifecycle (Flow → State)

    // ── Compose ────────────────────────────────────────────────────────────────
    // platform(BOM): Compose 라이브러리 버전을 BOM이 자동 결정 → 개별 버전 생략 가능
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)                    // Modifier, Layout
    implementation(libs.compose.ui.graphics)           // Color, Shape
    implementation(libs.compose.ui.tooling.preview)    // @Preview (릴리즈 포함)
    implementation(libs.compose.material3)             // M3 컴포넌트
    debugImplementation(libs.compose.ui.tooling)       // Layout Inspector (디버그만)

    // ── Navigation ─────────────────────────────────────────────────────────────
    // NavHost, composable(), rememberNavController()
    implementation(libs.navigation.compose)

    // ── Hilt (DI) ──────────────────────────────────────────────────────────────
    implementation(libs.hilt.android)   // @HiltAndroidApp, @AndroidEntryPoint
    ksp(libs.hilt.compiler)             // KSP로 DI 코드 생성 (컴파일 타임)
    implementation(libs.hilt.navigation) // hiltViewModel() — Compose에서 VM 주입

    // ── Network ────────────────────────────────────────────────────────────────
    implementation(libs.retrofit)         // HTTP 클라이언트 (interface → API 호출)
    implementation(libs.retrofit.kotlinx) // Retrofit × kotlinx.serialization 변환기
    implementation(libs.okhttp)           // Retrofit 기반 HTTP 엔진
    implementation(libs.okhttp.logging)   // 요청/응답 로그 (디버그용)

    // ── Serialization ──────────────────────────────────────────────────────────
    // @Serializable → JSON 직렬화/역직렬화 (Gson 대체)
    implementation(libs.kotlinx.serial)

    // ── Coroutines ─────────────────────────────────────────────────────────────
    // Dispatchers.Main (UI 스레드), Flow, suspend
    implementation(libs.coroutines.android)

    // ── Paging 3 ───────────────────────────────────────────────────────────────
    implementation(libs.paging.runtime)   // PagingSource, Pager
    implementation(libs.paging.compose)   // collectAsLazyPagingItems()

    // ── Image Loading ──────────────────────────────────────────────────────────
    implementation(libs.coil.compose)   // AsyncImage() — URL 이미지 로딩
    implementation(libs.coil.network)   // OkHttp 기반 이미지 네트워크 fetcher

    // ── Security ───────────────────────────────────────────────────────────────
    // EncryptedSharedPreferences — AES256_GCM 토큰 암호화 저장 (EncryptedTokenStorage)
    implementation(libs.security.crypto)

    // ── Socket.IO ──────────────────────────────────────────────────────────────
    // 실시간 채팅 WebSocket 통신
    implementation(libs.socket.io)
}
