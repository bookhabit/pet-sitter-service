import SwiftUI

struct LoginScreen: View {
    @Environment(AuthStore.self) private var authStore
    @State private var viewModel = LoginViewModel()

    var body: some View {
        @Bindable var vm = viewModel

        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Spacer().frame(height: 48)

                Text("로그인")
                    .font(AppTypography.t1)
                    .foregroundStyle(AppColors.textPrimary)

                Spacer().frame(height: 32)

                AppTextField(
                    label: "이메일",
                    placeholder: "email@example.com",
                    text: $vm.email,
                    keyboardType: .emailAddress,
                    errorMessage: viewModel.emailError
                )

                Spacer().frame(height: 16)

                AppTextField(
                    label: "비밀번호",
                    placeholder: "6자 이상",
                    text: $vm.password,
                    isSecure: true,
                    errorMessage: viewModel.passwordError
                )

                if let error = viewModel.serverError {
                    Spacer().frame(height: 8)
                    Text(error)
                        .font(AppTypography.caption)
                        .foregroundStyle(AppColors.danger)
                }

                Spacer().frame(height: 24)

                AppButton(title: "로그인", isLoading: viewModel.isLoading) {
                    viewModel.submitted = true
                    guard viewModel.isValid else { return }
                    Task {
                        viewModel.isLoading = true
                        viewModel.serverError = nil
                        do {
                            try await authStore.login(email: viewModel.email, password: viewModel.password)
                        } catch let error as NetworkError {
                            viewModel.serverError = error.errorDescription
                        } catch {
                            viewModel.serverError = "서버 오류가 발생했습니다"
                        }
                        viewModel.isLoading = false
                    }
                }

                Spacer().frame(height: 16)

                HStack {
                    Spacer()
                    Text("계정이 없으신가요?")
                        .font(AppTypography.b2)
                        .foregroundStyle(AppColors.textSecondary)
                    NavigationLink("회원가입") {
                        RegisterScreen()
                    }
                    .font(AppTypography.b2)
                    .foregroundStyle(AppColors.primary)
                    Spacer()
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 16)
        }
        .background(AppColors.white)
    }
}
