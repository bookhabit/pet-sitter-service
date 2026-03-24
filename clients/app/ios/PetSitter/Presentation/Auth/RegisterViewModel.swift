import Foundation

@Observable
final class RegisterViewModel {
    var name     = ""
    var email    = ""
    var password = ""
    var role     = "PetOwner"
    var isLoading = false
    var serverError: String?
    // 제출 시도 전에는 에러 표시 안 함
    var submitted = false

    var nameError: String? {
        guard submitted else { return nil }
        return name.isEmpty ? "이름을 입력해주세요" : nil
    }
    var emailError: String? {
        guard submitted else { return nil }
        if email.isEmpty { return "이메일을 입력해주세요" }
        if !email.contains("@") { return "올바른 이메일 형식이 아닙니다" }
        return nil
    }
    var passwordError: String? {
        guard submitted else { return nil }
        if password.isEmpty { return "비밀번호를 입력해주세요" }
        if password.count < 8 { return "8자 이상 입력해주세요" }
        return nil
    }
    var isValid: Bool { nameError == nil && emailError == nil && passwordError == nil && !name.isEmpty && !email.isEmpty && !password.isEmpty }
}
