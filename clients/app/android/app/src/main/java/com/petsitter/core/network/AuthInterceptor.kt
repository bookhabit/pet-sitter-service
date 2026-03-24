package com.petsitter.core.network

import com.petsitter.core.storage.EncryptedTokenStorage
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthEventBus @Inject constructor() {
    private val _events = MutableSharedFlow<AuthEvent>(extraBufferCapacity = 1)
    val events = _events.asSharedFlow()
    fun tryEmit(event: AuthEvent) = _events.tryEmit(event)
}

enum class AuthEvent { Unauthorized }

@Singleton
class AuthInterceptor @Inject constructor(
    private val storage: EncryptedTokenStorage,
    private val eventBus: AuthEventBus,
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val authed = original.withBearer(storage.getAccessToken())
        val response = chain.proceed(authed)

        if (response.code != 401) return response

        // 401 → refresh 시도
        response.close()
        return runBlocking {
            try {
                val refreshToken = storage.getRefreshToken()
                    ?: throw Exception("refresh_token not found")

                val newTokens = refreshTokens(refreshToken)
                storage.saveTokens(newTokens.first, newTokens.second)
                chain.proceed(original.withBearer(newTokens.first))
            } catch (e: Exception) {
                storage.clearAll()
                eventBus.tryEmit(AuthEvent.Unauthorized)
                chain.proceed(original) // 401 그대로 전파
            }
        }
    }

    // publicClient (no auth) 으로 토큰 갱신
    private fun refreshTokens(refreshToken: String): Pair<String, String> {
        val client = OkHttpClient()
        val body = """{"refresh_token":"$refreshToken"}"""
            .toRequestBody("application/json".toMediaType())
        val req = Request.Builder()
            .url("${com.petsitter.core.config.ApiConfig.BASE_URL}/sessions/refresh")
            .post(body)
            .build()

        val resp = client.newCall(req).execute()
        if (!resp.isSuccessful) throw Exception("Refresh failed: ${resp.code}")

        val json = JSONObject(resp.body!!.string())
        return Pair(
            json.getString("accessToken"),
            json.getString("newRefreshToken"),
        )
    }

    private fun Request.withBearer(token: String?): Request =
        if (token != null) newBuilder().header("Authorization", "Bearer $token").build()
        else this
}
