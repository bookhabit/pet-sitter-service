import Foundation

// ─── 요청 DTO ───────────────────────────────────────────────────────────────

struct LoginRequestDTO: Encodable {
    let email: String
    let password: String
}

struct RegisterRequestDTO: Encodable {
    let email: String
    let password: String
    let name: String
    let role: String
}

// ─── 응답 DTO ───────────────────────────────────────────────────────────────

struct LoginResponseDTO: Decodable {
    let accessToken: String
    let refreshToken: String
}

struct RefreshResponseDTO: Decodable {
    let accessToken: String
    let newRefreshToken: String
}

struct UserDTO: Decodable {
    let id: String
    let email: String
    let name: String?
    let role: String
    let profileImage: String?

    // DTO → Domain 변환
    func toDomain() -> User {
        User(
            id: id,
            email: email,
            name: name ?? "",
            role: UserRole(rawValue: role) ?? .petOwner,
            profileImage: profileImage
        )
    }
}
