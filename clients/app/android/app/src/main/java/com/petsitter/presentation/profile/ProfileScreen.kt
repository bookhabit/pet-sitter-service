package com.petsitter.presentation.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.petsitter.domain.model.User
import com.petsitter.domain.model.UserRole
import com.petsitter.ui.components.AppButton
import com.petsitter.ui.components.ButtonVariant
import com.petsitter.ui.theme.AppColors
import com.petsitter.ui.theme.AppTypography

@Composable
fun ProfileScreen(
    user: User?,
    onLogout: () -> Unit,
) {
    var showDialog by remember { mutableStateOf(false) }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("로그아웃") },
            text  = { Text("정말 로그아웃하시겠습니까?") },
            confirmButton = {
                TextButton(onClick = { showDialog = false; onLogout() }) {
                    Text("로그아웃", color = AppColors.danger)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) { Text("취소") }
            },
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 32.dp),
    ) {
        Text(
            text = user?.name ?: "이름 없음",
            style = AppTypography.t2,
            color = AppColors.textPrimary,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = user?.email ?: "",
            style = AppTypography.b2,
            color = AppColors.textSecondary,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "역할: ${user?.role.toLabel()}",
            style = AppTypography.caption,
            color = AppColors.textSecondary,
        )
        Spacer(Modifier.height(32.dp))
        AppButton(
            text = "로그아웃",
            variant = ButtonVariant.Secondary,
            onClick = { showDialog = true },
        )
    }
}

private fun UserRole?.toLabel() = when (this) {
    UserRole.PetOwner  -> "반려동물 주인"
    UserRole.PetSitter -> "펫시터"
    UserRole.Admin     -> "관리자"
    null               -> "-"
}
