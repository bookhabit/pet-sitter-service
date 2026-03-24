package com.petsitter.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petsitter.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RegisterFormState(
    val name: String = "",
    val email: String = "",
    val password: String = "",
    val role: String = "PetOwner",
    val nameError: String? = null,
    val emailError: String? = null,
    val passwordError: String? = null,
    val serverError: String? = null,
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
)

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RegisterFormState())
    val state = _state.asStateFlow()

    fun onNameChange(v: String)     = _state.update { it.copy(name = v, nameError = null) }
    fun onEmailChange(v: String)    = _state.update { it.copy(email = v, emailError = null) }
    fun onPasswordChange(v: String) = _state.update { it.copy(password = v, passwordError = null) }
    fun onRoleChange(v: String)     = _state.update { it.copy(role = v) }

    fun submit() {
        if (!validate()) return
        val s = _state.value

        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, serverError = null) }
            runCatching {
                authRepository.register(s.email, s.password, s.name, s.role)
            }.onSuccess {
                _state.update { it.copy(isLoading = false, isSuccess = true) }
            }.onFailure { e ->
                _state.update {
                    it.copy(
                        isLoading = false,
                        serverError = "회원가입에 실패했습니다. 다시 시도해주세요."
                    )
                }
            }
        }
    }

    private fun validate(): Boolean {
        val s = _state.value
        var valid = true

        if (s.name.isBlank()) {
            _state.update { it.copy(nameError = "이름을 입력해주세요") }
            valid = false
        }
        if (s.email.isBlank()) {
            _state.update { it.copy(emailError = "이메일을 입력해주세요") }
            valid = false
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(s.email).matches()) {
            _state.update { it.copy(emailError = "올바른 이메일 형식이 아닙니다") }
            valid = false
        }
        if (s.password.length < 8) {
            _state.update { it.copy(passwordError = "비밀번호는 8자 이상이어야 합니다") }
            valid = false
        }

        return valid
    }
}
