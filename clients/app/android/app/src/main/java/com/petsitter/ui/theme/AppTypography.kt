package com.petsitter.ui.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// STANDARDS.md 5장 타이포그래피 스케일
object AppTypography {
    val t1      = TextStyle(fontSize = 24.sp, fontWeight = FontWeight.Bold,    lineHeight = 34.sp)
    val t2      = TextStyle(fontSize = 20.sp, fontWeight = FontWeight.Bold,    lineHeight = 28.sp)
    val b1      = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Normal,  lineHeight = 24.sp)
    val b2      = TextStyle(fontSize = 14.sp, fontWeight = FontWeight.Normal,  lineHeight = 20.sp)
    val caption = TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Normal,  lineHeight = 17.sp)
}
