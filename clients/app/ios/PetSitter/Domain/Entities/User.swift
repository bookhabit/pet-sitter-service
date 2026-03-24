// User: 앱 내부 도메인 모델 — 서버 스키마(DTO)와 독립
// 프레임워크 의존 없음 (순수 Swift struct)
struct User {
    let id: String
    let email: String
    let name: String
    let role: UserRole
    let profileImage: String?
}

enum UserRole: String {
    case petOwner  = "PetOwner"
    case petSitter = "PetSitter"
    case admin     = "Admin"

    var isPetOwner:  Bool { self == .petOwner }
    var isPetSitter: Bool { self == .petSitter }
}
