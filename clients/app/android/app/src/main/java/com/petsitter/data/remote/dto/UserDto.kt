package com.petsitter.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// UserDto: Zod userSchema 대응
// kotlinx.serialization으로 JSON 직렬화/역직렬화
@Serializable
data class UserDto(
    val id: String,
    val email: String,
    val name: String?,
    val role: String,
    @SerialName("profileImage") val profileImage: String? = null,
)

@Serializable
data class LoginResponseDto(
    @SerialName("access_token")  val accessToken: String,
    @SerialName("refresh_token") val refreshToken: String,
    val user: UserDto,
)

@Serializable
data class LoginRequestDto(
    val email: String,
    val password: String,
)

@Serializable
data class RegisterRequestDto(
    val email: String,
    val password: String,
    val name: String,
    val role: String,
)
