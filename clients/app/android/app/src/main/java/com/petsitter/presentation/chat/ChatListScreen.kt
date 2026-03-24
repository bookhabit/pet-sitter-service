package com.petsitter.presentation.chat

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.petsitter.ui.components.EmptyView

@Composable
fun ChatListScreen() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        EmptyView(message = "Phase 6에서 채팅방 목록이 표시됩니다")
    }
}
