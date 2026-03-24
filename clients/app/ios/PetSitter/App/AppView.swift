import SwiftUI

// AppView: 루트 뷰 — isHydrated 전까지 LoadingView 표시
// expo-app의 AuthGuard, android의 AppNavHost isHydrated 패턴과 동일
struct AppView: View {
    @Environment(AuthStore.self) private var authStore

    var body: some View {
        if !authStore.isHydrated {
            LoadingView()
        } else if authStore.isLoggedIn {
            MainTabView()
        } else {
            AuthFlowView()
        }
    }
}
