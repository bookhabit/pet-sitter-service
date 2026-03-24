import SwiftUI

// MainTabView: 인증 후 탭 네비게이션
// PetSitter만 즐겨찾기 탭 표시 (Android의 isPetSitter 조건과 동일)
struct MainTabView: View {
    @Environment(AuthStore.self) private var authStore

    var body: some View {
        TabView {
            JobListScreen()
                .tabItem {
                    Label("공고", systemImage: "house")
                }

            if authStore.user?.role.isPetSitter == true {
                FavoritesScreen()
                    .tabItem {
                        Label("즐겨찾기", systemImage: "heart")
                    }
            }

            ChatListScreen()
                .tabItem {
                    Label("채팅", systemImage: "message")
                }

            ProfileScreen()
                .tabItem {
                    Label("프로필", systemImage: "person")
                }
        }
        .tint(AppColors.primary)
    }
}
