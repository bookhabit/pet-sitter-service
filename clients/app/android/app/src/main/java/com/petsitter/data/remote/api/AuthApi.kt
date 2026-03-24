package com.petsitter.data.remote.api

import com.petsitter.data.remote.dto.LoginRequestDto
import com.petsitter.data.remote.dto.LoginResponseDto
import com.petsitter.data.remote.dto.RegisterRequestDto
import com.petsitter.data.remote.dto.UserDto
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST

// AuthApi: Retrofit interface — 순수 네트워크 호출만 (STANDARDS.md 서비스 레이어)
interface AuthApi {
    @POST("sessions")
    suspend fun login(@Body body: LoginRequestDto): LoginResponseDto

    @POST("users")
    suspend fun register(@Body body: RegisterRequestDto): UserDto

    @GET("users/me")
    suspend fun getMe(): UserDto

    @DELETE("sessions")
    suspend fun logout()
}
