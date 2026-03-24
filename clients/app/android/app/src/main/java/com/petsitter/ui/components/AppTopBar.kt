package com.petsitter.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import com.petsitter.ui.theme.AppColors
import com.petsitter.ui.theme.AppTypography

// AppTopBar: 모든 화면의 상단 바 표준 컴포넌트
// - TopAppBar 기반 → windowInsetsPadding(WindowInsets.statusBars) 자동 처리
// - 뒤로가기 버튼은 onNavigateBack 이 null 이면 숨김
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppTopBar(
    title: String = "",
    onNavigateBack: (() -> Unit)? = null,
) {
    TopAppBar(
        title = {
            if (title.isNotEmpty()) {
                Text(text = title, style = AppTypography.t2, color = AppColors.textPrimary)
            }
        },
        navigationIcon = {
            if (onNavigateBack != null) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "뒤로가기",
                        tint = AppColors.textPrimary,
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = AppColors.white,
            navigationIconContentColor = AppColors.textPrimary,
        ),
    )
}
