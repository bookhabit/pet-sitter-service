package com.petsitter.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petsitter.core.network.AuthEvent
import com.petsitter.core.network.AuthEventBus
import com.petsitter.core.storage.EncryptedTokenStorage
import com.petsitter.domain.model.User
import com.petsitter.domain.model.UserRole
import com.petsitter.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val user: User? = null,
    val isLoggedIn: Boolean = false,
    // isHydrated: 앱 시작 시 저장된 토큰 복구 완료 여부
    // false 동안은 라우터가 리다이렉트를 결정하지 않음 (expo-app의 isHydrated와 동일)
    val isHydrated: Boolean = false,
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val storage: EncryptedTokenStorage,
    private val eventBus: AuthEventBus,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState = _uiState.asStateFlow()

    init {
        // 앱 시작: EncryptedSharedPreferences → 메모리 복구
        viewModelScope.launch {
            val token = storage.getAccessToken()
            if (token != null) {
                runCatching { authRepository.getMe() }
                    .onSuccess { user ->
                        _uiState.update { it.copy(user = user, isLoggedIn = true) }
                    }
                    .onFailure { storage.clearAll() }
            }
            _uiState.update { it.copy(isHydrated = true) }
        }

        // AuthInterceptor가 발생시키는 Unauthorized 이벤트 구독 → 강제 로그아웃
        viewModelScope.launch {
            eventBus.events.collect { event ->
                if (event == AuthEvent.Unauthorized) {
                    _uiState.update { AuthUiState(isHydrated = true) }
                }
            }
        }
    }

    fun login(email: String, password: String, onError: (String) -> Unit) {
        viewModelScope.launch {
            runCatching { authRepository.login(email, password) }
                .onSuccess { (access, refresh) ->
                    storage.saveTokens(access, refresh)
                    runCatching { authRepository.getMe() }
                        .onSuccess { user ->
                            _uiState.update { it.copy(user = user, isLoggedIn = true) }
                        }
                        .onFailure { onError("사용자 정보를 불러오는데 실패했습니다") }
                }
                .onFailure { e ->
                    val msg = if (e.message?.contains("401") == true)
                        "이메일 또는 비밀번호가 올바르지 않습니다"
                    else "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
                    onError(msg)
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            runCatching { authRepository.logout() }
            storage.clearAll()
            _uiState.update { AuthUiState(isHydrated = true) }
        }
    }
}
