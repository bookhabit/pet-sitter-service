import Foundation

// 환경별 API Base URL
// 우선순위:
//   1. Info.plist → API_BASE_URL (실제 기기: Build Settings에서 주입)
//   2. 기본값 localhost:3000 (iOS 시뮬레이터)
//
// 실제 기기 설정:
//   Xcode → Target → Build Settings → User-Defined → API_BASE_URL = http://192.168.x.x:3000
//   Info.plist → API_BASE_URL = $(API_BASE_URL)
enum APIConfig {
    static var baseURL: String {
        if let url = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
           !url.isEmpty {
            return url
        }
        return "http://localhost:3000"
    }
}
