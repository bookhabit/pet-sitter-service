import Foundation

// AuthRepositoryImpl: AuthRepositoryProtocol 구현체
// DTO ↔ Domain 변환 책임 — ViewModel은 Domain 모델만 사용
// @unchecked Sendable: 내부 상태 없음, 모든 메서드는 APIClient를 통해 비동기 호출
final class AuthRepositoryImpl: AuthRepositoryProtocol, @unchecked Sendable {
    static let shared = AuthRepositoryImpl()
    private init() {}

    func login(email: String, password: String) async throws -> (accessToken: String, refreshToken: String, user: User) {
        let res: LoginResponseDTO = try await APIClient.shared.requestPublic(
            "/sessions", method: "POST",
            body: LoginRequestDTO(email: email, password: password)
        )
        let me = try await getMe()
        return (res.accessToken, res.refreshToken, me)
    }

    func register(email: String, password: String, name: String, role: String) async throws -> User {
        let dto: UserDTO = try await APIClient.shared.requestPublic(
            "/users", method: "POST",
            body: RegisterRequestDTO(email: email, password: password, name: name, role: role)
        )
        return dto.toDomain()
    }

    func getMe() async throws -> User {
        let dto: UserDTO = try await APIClient.shared.request("/users/me")
        return dto.toDomain()
    }

    func logout() async throws {
        let _: EmptyResponse = try await APIClient.shared.request("/sessions", method: "DELETE")
    }
}

// DELETE /sessions 처럼 응답 바디가 없는 경우 처리
private struct EmptyResponse: Decodable {}
