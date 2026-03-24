package com.petsitter.presentation.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.petsitter.ui.components.AppButton
import com.petsitter.ui.components.AppTextField
import com.petsitter.ui.theme.AppColors
import com.petsitter.ui.theme.AppTypography

// LoginScreen: View 대응 — 폼 렌더링만, 로직은 LoginViewModel + AuthViewModel에서
@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    authViewModel: AuthViewModel,
    loginViewModel: LoginViewModel = hiltViewModel(),
) {
    val state by loginViewModel.state.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            // status bar + nav bar safe area 처리 (Scaffold 없는 화면에서 직접 명시)
            .windowInsetsPadding(WindowInsets.systemBars)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 32.dp),
    ) {
        Spacer(modifier = Modifier.height(48.dp))

        Text(
            text = "로그인",
            style = AppTypography.t1,
            color = AppColors.textPrimary,
        )

        Spacer(modifier = Modifier.height(32.dp))

        AppTextField(
            value = state.email,
            onValueChange = loginViewModel::onEmailChange,
            label = "이메일",
            placeholder = "email@example.com",
            errorMessage = state.emailError,
            keyboardType = androidx.compose.ui.text.input.KeyboardType.Email,
        )

        Spacer(modifier = Modifier.height(16.dp))

        AppTextField(
            value = state.password,
            onValueChange = loginViewModel::onPasswordChange,
            label = "비밀번호",
            placeholder = "6자 이상",
            errorMessage = state.passwordError,
            isPassword = true,
        )

        if (state.serverError != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = state.serverError!!,
                style = AppTypography.caption,
                color = AppColors.danger,
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        AppButton(
            text = "로그인",
            isLoading = state.isLoading,
            onClick = {
                if (loginViewModel.validate()) {
                    loginViewModel.setLoading(true)
                    loginViewModel.setServerError(null)
                    authViewModel.login(
                        email = state.email,
                        password = state.password,
                        onError = { msg ->
                            loginViewModel.setLoading(false)
                            loginViewModel.setServerError(msg)
                        },
                    )
                }
            },
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "계정이 없으신가요?",
                style = AppTypography.b2,
                color = AppColors.textSecondary,
            )
            TextButton(onClick = onNavigateToRegister) {
                Text(
                    text = "회원가입",
                    style = AppTypography.b2,
                    color = AppColors.primary,
                )
            }
        }
    }
}
