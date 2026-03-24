package com.petsitter.core.config

import com.petsitter.BuildConfig

// 환경별 API Base URL:
// - 에뮬레이터: 10.0.2.2 (host machine의 localhost)
// - 실제 기기:  gradle.properties에서 API_BASE_URL 지정
//               ./gradlew assembleDebug -PAPI_BASE_URL=http://192.168.0.10:3000
object ApiConfig {
    val BASE_URL: String = BuildConfig.API_BASE_URL
}
