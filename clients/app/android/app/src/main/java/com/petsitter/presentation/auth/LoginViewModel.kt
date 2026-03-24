package com.petsitter.presentation.auth

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject

data class LoginFormState(
    val email: String = "",
    val password: String = "",
    val emailError: String? = null,
    val passwordError: String? = null,
    val serverError: String? = null,
    val isLoading: Boolean = false,
)

// LoginViewModel: Logic Hook 대응
// 폼 상태 + 검증만 담당, 실제 API 호출은 AuthViewModel에 위임
@HiltViewModel
class LoginViewModel @Inject constructor() : ViewModel() {

    private val _state = MutableStateFlow(LoginFormState())
    val state = _state.asStateFlow()

    fun onEmailChange(value: String) {
        _state.update { it.copy(email = value, emailError = null) }
    }

    fun onPasswordChange(value: String) {
        _state.update { it.copy(password = value, passwordError = null) }
    }

    // 폼 검증 후 콜백으로 결과 전달 (AuthViewModel.login() 호출은 Screen에서)
    fun validate(): Boolean {
        val s = _state.value
        var valid = true

        if (s.email.isBlank()) {
            _state.update { it.copy(emailError = "이메일을 입력해주세요") }
            valid = false
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(s.email).matches()) {
            _state.update { it.copy(emailError = "올바른 이메일 형식이 아닙니다") }
            valid = false
        }

        if (s.password.isBlank()) {
            _state.update { it.copy(passwordError = "비밀번호를 입력해주세요") }
            valid = false
        }

        return valid
    }

    fun setLoading(loading: Boolean) = _state.update { it.copy(isLoading = loading) }
    fun setServerError(msg: String?) = _state.update { it.copy(serverError = msg) }
}
