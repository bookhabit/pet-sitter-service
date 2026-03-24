package com.petsitter.presentation.jobs

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.petsitter.ui.components.EmptyView

@Composable
fun JobListScreen() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        EmptyView(message = "Phase 2에서 공고 목록이 표시됩니다")
    }
}
