package com.petsitter.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary          = AppColors.primary,
    background       = AppColors.background,
    surface          = AppColors.white,
    onPrimary        = AppColors.white,
    onBackground     = AppColors.textPrimary,
    onSurface        = AppColors.textPrimary,
    error            = AppColors.danger,
)

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content,
    )
}
