package com.petsitter.domain.repository

import com.petsitter.domain.model.User

// AuthRepository: 인터페이스 (Domain Layer)
// Hilt로 AuthRepositoryImpl이 주입됨
// 이 인터페이스로 의존 역전(DIP) 달성
interface AuthRepository {
    suspend fun login(email: String, password: String): Pair<String, String> // (accessToken, refreshToken)
    suspend fun register(email: String, password: String, name: String, role: String): User
    suspend fun getMe(): User
    suspend fun logout()
}
