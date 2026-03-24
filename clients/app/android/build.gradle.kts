// ─────────────────────────────────────────────────────────────────────────────
// build.gradle.kts (루트) — 프로젝트 레벨 빌드 설정
//
// 모든 모듈(:app, :core 등)에 공통으로 적용할 플러그인 버전을 선언하는 파일.
// 실제 플러그인 적용(apply)은 각 모듈의 build.gradle.kts에서 수행한다.
// 여기서는 "이런 플러그인이 존재한다"는 것만 알려주고 apply false로 적용은 보류.
// ─────────────────────────────────────────────────────────────────────────────

plugins {
    // Android Application 플러그인 (AGP) — :app 모듈에서 apply
    alias(libs.plugins.android.application) apply false

    // Kotlin Android 플러그인 — Kotlin으로 Android 코드 작성 시 필수
    alias(libs.plugins.kotlin.android) apply false

    // Kotlin Compose Compiler 플러그인 — Kotlin 2.0+에서 Compose 사용 시 필수
    // (이전에는 composeOptions.kotlinCompilerExtensionVersion 으로 설정했으나 2.0부터 분리)
    alias(libs.plugins.kotlin.compose) apply false

    // Kotlin Serialization 플러그인 — @Serializable 어노테이션 처리 (Retrofit + kotlinx.serialization)
    alias(libs.plugins.kotlin.serialization) apply false

    // Hilt (Dagger) 플러그인 — @HiltAndroidApp, @AndroidEntryPoint 어노테이션 처리
    alias(libs.plugins.hilt) apply false

    // KSP (Kotlin Symbol Processing) — 어노테이션 프로세서
    // Hilt와 Room 등의 코드 생성에 사용 (kapt 대비 빌드 속도 2~3배 빠름)
    alias(libs.plugins.ksp) apply false
}
