import SwiftUI

struct RegisterScreen: View {
    @Environment(AuthStore.self) private var authStore
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = RegisterViewModel()
    @State private var registerSuccess = false

    var body: some View {
        @Bindable var vm = viewModel

        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Text("회원가입")
                    .font(AppTypography.t1)
                    .foregroundStyle(AppColors.textPrimary)

                Spacer().frame(height: 32)

                AppTextField(label: "이름", placeholder: "홍길동", text: $vm.name, errorMessage: viewModel.nameError)

                Spacer().frame(height: 16)

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
                    placeholder: "8자 이상",
                    text: $vm.password,
                    isSecure: true,
                    errorMessage: viewModel.passwordError
                )

                Spacer().frame(height: 24)

                // 역할 선택
                Text("역할")
                    .font(AppTypography.b2)
                    .foregroundStyle(AppColors.textPrimary)
                Spacer().frame(height: 8)
                HStack(spacing: 12) {
                    RoleChip(label: "반려동물 주인", value: "PetOwner", selected: viewModel.role == "PetOwner") {
                        viewModel.role = "PetOwner"
                    }
                    RoleChip(label: "펫시터", value: "PetSitter", selected: viewModel.role == "PetSitter") {
                        viewModel.role = "PetSitter"
                    }
                }

                if let error = viewModel.serverError {
                    Spacer().frame(height: 8)
                    Text(error).font(AppTypography.caption).foregroundStyle(AppColors.danger)
                }

                Spacer().frame(height: 24)

                AppButton(title: "가입하기", isLoading: viewModel.isLoading) {
                    viewModel.submitted = true
                    guard viewModel.isValid else { return }
                    Task {
                        viewModel.isLoading = true
                        viewModel.serverError = nil
                        do {
                            try await authStore.register(
                                email: viewModel.email,
                                password: viewModel.password,
                                name: viewModel.name,
                                role: viewModel.role
                            )
                            registerSuccess = true
                        } catch let error as NetworkError {
                            viewModel.serverError = error.errorDescription
                        } catch {
                            viewModel.serverError = "서버 오류가 발생했습니다"
                        }
                        viewModel.isLoading = false
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 16)
        }
        .background(AppColors.white)
        .navigationBarBackButtonHidden(false)
        .alert("회원가입 완료", isPresented: $registerSuccess) {
            Button("로그인하기") { dismiss() }
        } message: {
            Text("가입이 완료되었습니다. 로그인해주세요.")
        }
    }
}

private struct RoleChip: View {
    let label: String
    let value: String
    let selected: Bool
    let onTap: () -> Void

    var body: some View {
        Text(label)
            .font(AppTypography.b2)
            .foregroundStyle(selected ? AppColors.primary : AppColors.textSecondary)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(selected ? AppColors.primaryLight : AppColors.white)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(selected ? AppColors.primary : AppColors.grey200, lineWidth: 1)
            )
            .onTapGesture(perform: onTap)
    }
}
