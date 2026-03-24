package com.petsitter.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.petsitter.ui.theme.AppColors
import com.petsitter.ui.theme.AppTypography

@Composable
fun ErrorView(
    message: String,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(Icons.Outlined.Warning, contentDescription = null, tint = AppColors.danger,
             modifier = Modifier.size(48.dp))
        Spacer(Modifier.height(16.dp))
        Text(message, style = AppTypography.b2, color = AppColors.textSecondary, textAlign = TextAlign.Center)
        if (onRetry != null) {
            Spacer(Modifier.height(16.dp))
            AppButton(text = "다시 시도", onClick = onRetry, variant = ButtonVariant.Secondary)
        }
    }
}
