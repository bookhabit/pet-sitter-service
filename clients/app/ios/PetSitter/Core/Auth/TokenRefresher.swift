import Foundation

// TokenRefresher: Actor 기반 스레드 안전 토큰 갱신
// 동시에 여러 401이 발생해도 refresh를 한 번만 실행하고 나머지는 대기(waiters)
// expo-app의 failedQueue, Android의 runBlocking 직렬화와 동일 역할
actor TokenRefresher {
    static let shared = TokenRefresher()
    private init() {}

    private var isRefreshing = false
    // refresh 완료를 기다리는 대기 continuation 목록
    private var waiters: [CheckedContinuation<String, Error>] = []

    func refresh() async throws -> String {
        // 이미 refresh 중이면 완료될 때까지 대기
        if isRefreshing {
            return try await withCheckedThrowingContinuation { cont in
                waiters.append(cont)
            }
        }

        isRefreshing = true
        defer { isRefreshing = false }

        do {
            guard let refreshToken = KeychainStorage.shared.load(forKey: "refresh_token") else {
                throw NetworkError.noRefreshToken
            }

            let tokens = try await APIClient.shared.refreshTokens(refreshToken: refreshToken)

            KeychainStorage.shared.save(tokens.accessToken, forKey: "access_token")
            KeychainStorage.shared.save(tokens.newRefreshToken, forKey: "refresh_token")

            // 대기 중이던 요청들에게 새 토큰 전달
            waiters.forEach { $0.resume(returning: tokens.accessToken) }
            waiters.removeAll()
            return tokens.accessToken
        } catch {
            waiters.forEach { $0.resume(throwing: error) }
            waiters.removeAll()
            KeychainStorage.shared.clearAll()
            throw NetworkError.refreshFailed
        }
    }
}
