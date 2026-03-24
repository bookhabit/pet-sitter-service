package com.petsitter.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.petsitter.ui.theme.AppColors
import com.petsitter.ui.theme.AppTypography

enum class BadgeVariant { Primary, Success, Warning, Danger, Neutral }

@Composable
fun AppBadge(
    text: String,
    variant: BadgeVariant = BadgeVariant.Neutral,
) {
    val (bg, fg) = when (variant) {
        BadgeVariant.Primary -> AppColors.primaryLight to AppColors.primary
        BadgeVariant.Success -> AppColors.successLight to AppColors.success
        BadgeVariant.Warning -> AppColors.warningLight to AppColors.warning
        BadgeVariant.Danger  -> AppColors.dangerLight  to AppColors.danger
        BadgeVariant.Neutral -> AppColors.grey200      to AppColors.textSecondary
    }

    Box(
        modifier = Modifier
            .background(bg, RoundedCornerShape(100.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp),
    ) {
        Text(text, style = AppTypography.caption, color = fg)
    }
}
