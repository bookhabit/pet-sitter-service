package com.petsitter.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.petsitter.ui.theme.AppColors

@Composable
fun AppSkeleton(
    height: Dp,
    modifier: Modifier = Modifier,
    width: Dp? = null,
    borderRadius: Dp = 8.dp,
) {
    val alpha by rememberInfiniteTransition(label = "skeleton").animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = EaseInOut),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "alpha",
    )

    val m = if (width != null) modifier.width(width).height(height)
            else modifier.height(height)

    Box(
        modifier = m
            .alpha(alpha)
            .background(AppColors.grey200, RoundedCornerShape(borderRadius)),
    )
}
