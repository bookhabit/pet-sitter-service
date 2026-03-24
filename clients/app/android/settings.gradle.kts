// ─────────────────────────────────────────────────────────────────────────────
// settings.gradle.kts — 프로젝트 전체 설정 (Gradle 빌드 진입점)
//
// Gradle이 빌드를 시작할 때 가장 먼저 읽는 파일.
// 어떤 저장소(repository)에서 플러그인·라이브러리를 받을지,
// 어떤 모듈(module)이 이 프로젝트에 포함되는지를 정의한다.
// ─────────────────────────────────────────────────────────────────────────────

pluginManagement {
    // Gradle 플러그인(AGP, Kotlin, Hilt 등)을 다운로드할 저장소 목록
    // 순서가 곧 탐색 우선순위 — google()을 첫 번째로 두는 것이 Android 표준
    repositories {
        google()              // Android 공식 저장소 (AGP, Compose 등)
        mavenCentral()        // Maven 중앙 저장소 (Kotlin, Coroutines 등)
        gradlePluginPortal()  // Gradle 플러그인 전용 저장소 (KSP 등)
    }
}

dependencyResolutionManagement {
    // FAIL_ON_PROJECT_REPOS: 개별 모듈(app/build.gradle.kts)에서
    // repositories {} 블록 직접 선언을 금지 → 모든 저장소를 이 파일에서 통합 관리
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)

    // 라이브러리 의존성을 다운로드할 저장소 목록
    repositories {
        google()        // AndroidX, Compose, Hilt 등
        mavenCentral()  // Retrofit, OkHttp, Coil, Coroutines 등
    }
}

// 루트 프로젝트 이름 — Android Studio 프로젝트 제목에 표시됨
rootProject.name = "PetSitter"

// 빌드에 포함할 모듈 선언
// ":app" = app/ 디렉터리를 단일 앱 모듈로 포함
// 멀티 모듈 구조라면 include(":app", ":core", ":feature:auth") 형태로 추가
include(":app")
