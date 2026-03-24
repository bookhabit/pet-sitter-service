package com.petsitter.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.petsitter.ui.theme.AppColors
import com.petsitter.ui.theme.AppTypography

@Composable
fun EmptyView(
    message: String = "데이터가 없습니다",
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(message, style = AppTypography.b2, color = AppColors.textSecondary)
    }
}
