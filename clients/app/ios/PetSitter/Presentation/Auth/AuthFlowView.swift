import SwiftUI

// AuthFlowView: 비인증 플로우 — NavigationStack으로 Login → Register 전환
struct AuthFlowView: View {
    var body: some View {
        NavigationStack {
            LoginScreen()
        }
    }
}
