import Foundation

// AuthStore: 전역 인증 상태 관리
// - @Observable: iOS 17+ SwiftUI 반응형 상태 (ObservableObject 대체)
// - @MainActor: Swift 6 strict concurrency — UI 상태는 메인 스레드에서만 변경
//   async 메서드 내에서 MainActor.run {} 없이 직접 프로퍼티 수정 가능
// - isHydrated: Keychain에서 토큰 복원 완료 여부
//   false인 동안 AppView는 LoadingView를 보여주고 라우팅 결정을 보류
// expo-app의 useAuthStore, Android의 AuthViewModel isHydrated 패턴과 동일
@Observable
@MainActor
final class AuthStore {
    var user:       User? = nil
    var isLoggedIn: Bool  = false
    // Keychain 초기 로드 + 토큰 유효성 확인 완료 여부
    var isHydrated: Bool  = false

    private let keychain = KeychainStorage.shared

    // 앱 시작 시 호출 — Keychain → 서버 유효성 확인
    func hydrate() async {
        defer { isHydrated = true }
        guard let _ = keychain.load(forKey: "access_token") else { return }
        do {
            let me: UserDTO = try await APIClient.shared.request("/users/me")
            user = me.toDomain()
            isLoggedIn = true
        } catch {
            keychain.clearAll()
        }
    }

    func login(email: String, password: String) async throws {
        let response: LoginResponseDTO = try await APIClient.shared.requestPublic(
            "/sessions",
            method: "POST",
            body: LoginRequestDTO(email: email, password: password)
        )
        keychain.save(response.accessToken,  forKey: "access_token")
        keychain.save(response.refreshToken, forKey: "refresh_token")
        let me: UserDTO = try await APIClient.shared.request("/users/me")
        user = me.toDomain()
        isLoggedIn = true
    }

    func register(email: String, password: String, name: String, role: String) async throws {
        let _: UserDTO = try await APIClient.shared.requestPublic(
            "/users",
            method: "POST",
            body: RegisterRequestDTO(email: email, password: password, name: name, role: role)
        )
    }

    func logout() {
        keychain.clearAll()
        user       = nil
        isLoggedIn = false
    }

    // 401 갱신 실패 시 강제 로그아웃 (Android AuthEventBus 대응)
    func forceLogout() {
        logout()
    }
}
