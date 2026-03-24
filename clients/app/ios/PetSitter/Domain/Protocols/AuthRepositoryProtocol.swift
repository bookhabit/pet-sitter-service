// AuthRepositoryProtocol: DIP — Presentation이 Data 구현체에 직접 의존하지 않음
// 테스트 시 MockAuthRepository로 교체 가능
protocol AuthRepositoryProtocol {
    func login(email: String, password: String) async throws -> (accessToken: String, refreshToken: String, user: User)
    func register(email: String, password: String, name: String, role: String) async throws -> User
    func getMe() async throws -> User
    func logout() async throws
}
