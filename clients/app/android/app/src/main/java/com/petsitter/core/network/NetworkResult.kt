package com.petsitter.core.network

// NetworkResult: 비동기 상태를 타입 안전하게 표현 (STANDARDS.md 2장)
// Loading / Error / Success 3상태 필수 처리
sealed class NetworkResult<out T> {
    data object Loading : NetworkResult<Nothing>()
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error(val message: String, val code: Int? = null) : NetworkResult<Nothing>()
}

// ViewModel에서 UiState 패턴으로 사용
// StateFlow<NetworkResult<T>>로 Screen에 전달
