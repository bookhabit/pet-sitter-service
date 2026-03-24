import Foundation

// AppRoute: 타입 안전 딥링크 라우트
// NavigationStack의 navigationDestination(for:)과 연결
enum AppRoute: Hashable {
    case jobDetail(id: String)
    case jobCreate
    case jobEdit(id: String)
    case applications(jobId: String)
    case userProfile(userId: String)
    case chatRoom(roomId: String, jobApplicationId: String)
    case userReviews(userId: String)
}
