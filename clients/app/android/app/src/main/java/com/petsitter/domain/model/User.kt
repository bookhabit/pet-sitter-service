package com.petsitter.domain.model

// User: 도메인 레이어의 내부 모델 (UI에서 직접 사용)
// DTO(UserDto)와 분리하여 서버 스키마 변경이 UI에 직접 영향 안 주도록
enum class UserRole { PetOwner, PetSitter, Admin }

data class User(
    val id: String,
    val email: String,
    val name: String,
    val role: UserRole,
    val profileImage: String? = null,
)
