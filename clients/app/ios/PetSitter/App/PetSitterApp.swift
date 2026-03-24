import SwiftUI

@main
struct PetSitterApp: App {
    @State private var authStore = AuthStore()

    var body: some Scene {
        WindowGroup {
            AppView()
                .environment(authStore)
                .task { await authStore.hydrate() }
        }
    }
}
