package com.petsitter.presentation.auth

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.petsitter.ui.components.AppButton
import com.petsitter.ui.components.AppTextField
import com.petsitter.ui.components.AppTopBar
import com.petsitter.ui.theme.AppColors
import com.petsitter.ui.theme.AppTypography

@Composable
fun RegisterScreen(
    onNavigateBack: () -> Unit,
    onRegisterSuccess: () -> Unit,
    viewModel: RegisterViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(state.isSuccess) {
        if (state.isSuccess) onRegisterSuccess()
    }

    Scaffold(
        topBar = { AppTopBar(onNavigateBack = onNavigateBack) },
        containerColor = AppColors.white,
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(start = 24.dp, end = 24.dp, bottom = 16.dp),
        ) {
            Text("회원가입", style = AppTypography.t1, color = AppColors.textPrimary)

            Spacer(Modifier.height(32.dp))

            AppTextField(
                value = state.name,
                onValueChange = viewModel::onNameChange,
                label = "이름",
                errorMessage = state.nameError,
            )

            Spacer(Modifier.height(16.dp))

            AppTextField(
                value = state.email,
                onValueChange = viewModel::onEmailChange,
                label = "이메일",
                keyboardType = androidx.compose.ui.text.input.KeyboardType.Email,
                errorMessage = state.emailError,
            )

            Spacer(Modifier.height(16.dp))

            AppTextField(
                value = state.password,
                onValueChange = viewModel::onPasswordChange,
                label = "비밀번호",
                placeholder = "8자 이상",
                isPassword = true,
                errorMessage = state.passwordError,
            )

            Spacer(Modifier.height(24.dp))

            // 역할 선택
            Text("역할", style = AppTypography.b2, color = AppColors.textPrimary)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                RoleChip("반려동물 주인", "PetOwner", state.role == "PetOwner") {
                    viewModel.onRoleChange("PetOwner")
                }
                RoleChip("펫시터", "PetSitter", state.role == "PetSitter") {
                    viewModel.onRoleChange("PetSitter")
                }
            }

            if (state.serverError != null) {
                Spacer(Modifier.height(8.dp))
                Text(state.serverError!!, style = AppTypography.caption, color = AppColors.danger)
            }

            Spacer(Modifier.height(24.dp))

            AppButton(text = "가입하기", isLoading = state.isLoading, onClick = viewModel::submit)
        }
    }
}

@Composable
private fun RoleChip(label: String, value: String, selected: Boolean, onClick: () -> Unit) {
    val borderColor = if (selected) AppColors.primary else AppColors.grey200
    val bgColor     = if (selected) AppColors.primaryLight else AppColors.white
    val textColor   = if (selected) AppColors.primary else AppColors.textSecondary

    Box(
        modifier = Modifier
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 10.dp),
    ) {
        Text(label, style = AppTypography.b2, color = textColor)
    }
}
