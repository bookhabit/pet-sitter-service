import Foundation

@Observable
final class LoginViewModel {
    var email    = ""
    var password = ""
    var isLoading = false
    var serverError: String?
    // 제출 시도 전에는 에러 표시 안 함
    var submitted = false

    // submitted = true 이후에만 에러 반환
    var emailError: String? {
        guard submitted else { return nil }
        if email.isEmpty { return "이메일을 입력해주세요" }
        if !email.contains("@") { return "올바른 이메일 형식이 아닙니다" }
        return nil
    }
    var passwordError: String? {
        guard submitted else { return nil }
        if password.isEmpty { return "비밀번호를 입력해주세요" }
        if password.count < 6 { return "6자 이상 입력해주세요" }
        return nil
    }
    var isValid: Bool { emailError == nil && passwordError == nil && !email.isEmpty && !password.isEmpty }
}
