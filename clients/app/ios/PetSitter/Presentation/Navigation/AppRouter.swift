import SwiftUI

// AppRouter: NavigationPath 중앙 관리
// @Observable → SwiftUI가 path 변경을 자동 감지하여 NavigationStack 업데이트
@Observable
final class AppRouter {
    var path = NavigationPath()

    func push(_ route: AppRoute) { path.append(route) }
    func pop()                   { if !path.isEmpty { path.removeLast() } }
    func popToRoot()             { path.removeLast(path.count) }
}
