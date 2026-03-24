package com.petsitter.data.repository

import com.petsitter.data.remote.api.AuthApi
import com.petsitter.data.remote.dto.LoginRequestDto
import com.petsitter.data.remote.dto.RegisterRequestDto
import com.petsitter.data.remote.dto.UserDto
import com.petsitter.domain.model.User
import com.petsitter.domain.model.UserRole
import com.petsitter.domain.repository.AuthRepository
import javax.inject.Inject
import javax.inject.Named
import retrofit2.Retrofit

class AuthRepositoryImpl @Inject constructor(
    private val authApi: AuthApi,
    @Named("private") private val privateRetrofit: Retrofit,
) : AuthRepository {

    // 로그인 후 토큰 반환 — 토큰 저장은 ViewModel에서 처리 (Repository는 저장 책임 없음)
    override suspend fun login(email: String, password: String): Pair<String, String> {
        val res = authApi.login(LoginRequestDto(email, password))
        return Pair(res.accessToken, res.refreshToken)
    }

    override suspend fun register(
        email: String,
        password: String,
        name: String,
        role: String,
    ): User {
        val dto = authApi.register(RegisterRequestDto(email, password, name, role))
        return dto.toDomain()
    }

    override suspend fun getMe(): User {
        // getMe는 인증이 필요하므로 privateRetrofit 사용
        val api = privateRetrofit.create(AuthApi::class.java)
        return api.getMe().toDomain()
    }

    override suspend fun logout() {
        val api = privateRetrofit.create(AuthApi::class.java)
        api.logout()
    }
}

private fun UserDto.toDomain() = User(
    id = id,
    email = email,
    name = name ?: "",
    role = when (role) {
        "PetOwner"  -> UserRole.PetOwner
        "PetSitter" -> UserRole.PetSitter
        else        -> UserRole.Admin
    },
    profileImage = profileImage,
)
