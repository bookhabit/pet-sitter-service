package com.petsitter.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.petsitter.ui.theme.AppColors
import com.petsitter.ui.theme.AppShape
import com.petsitter.ui.theme.AppTypography

enum class ButtonVariant { Primary, Secondary, Danger }

@Composable
fun AppButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.Primary,
    isLoading: Boolean = false,
    enabled: Boolean = true,
) {
    val isEnabled = enabled && !isLoading

    val containerColor = when {
        !isEnabled -> AppColors.grey200
        variant == ButtonVariant.Primary   -> AppColors.primary
        variant == ButtonVariant.Secondary -> AppColors.white
        else                               -> AppColors.danger
    }
    val contentColor = when {
        !isEnabled -> AppColors.grey400
        variant == ButtonVariant.Secondary -> AppColors.textPrimary
        else                               -> AppColors.white
    }

    Button(
        onClick = onClick,
        enabled = isEnabled,
        modifier = modifier.fillMaxWidth().height(52.dp),
        shape = AppShape.md,
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor   = contentColor,
            disabledContainerColor = AppColors.grey200,
            disabledContentColor   = AppColors.grey400,
        ),
        elevation = ButtonDefaults.buttonElevation(0.dp, 0.dp, 0.dp),
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp,
                color = contentColor,
            )
        } else {
            Text(text, style = AppTypography.b1)
        }
    }
}
