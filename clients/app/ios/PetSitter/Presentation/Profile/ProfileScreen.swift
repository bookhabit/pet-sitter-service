import SwiftUI

struct ProfileScreen: View {
    @Environment(AuthStore.self) private var authStore
    @State private var viewModel = ProfileViewModel()

    var body: some View {
        NavigationStack {
            List {
                if let user = authStore.user {
                    Section {
                        HStack(spacing: 12) {
                            Circle()
                                .fill(AppColors.grey200)
                                .frame(width: 56, height: 56)
                                .overlay(
                                    Text(String(user.name.prefix(1)))
                                        .font(AppTypography.t2)
                                        .foregroundStyle(AppColors.textSecondary)
                                )
                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.name).font(AppTypography.b1).foregroundStyle(AppColors.textPrimary)
                                Text(user.email).font(AppTypography.b2).foregroundStyle(AppColors.textSecondary)
                                AppBadge(label: user.role.isPetSitter ? "펫시터" : "반려동물 주인",
                                         variant: user.role.isPetSitter ? .success : .primary)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }

                Section {
                    Button(role: .destructive) {
                        viewModel.showLogoutAlert = true
                    } label: {
                        Text("로그아웃")
                    }
                }
            }
            .navigationTitle("프로필")
            .alert("로그아웃", isPresented: $viewModel.showLogoutAlert) {
                Button("취소", role: .cancel) {}
                Button("로그아웃", role: .destructive) { authStore.logout() }
            } message: {
                Text("로그아웃 하시겠습니까?")
            }
        }
    }
}
