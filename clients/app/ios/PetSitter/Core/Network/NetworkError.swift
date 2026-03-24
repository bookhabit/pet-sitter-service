import Foundation

// NetworkError: HTTP 상태코드 기반 에러 타입
// 모든 API 호출의 실패는 이 타입으로 통일
enum NetworkError: LocalizedError {
    case unauthorized                   // 401 — refresh 필요
    case forbidden                      // 403
    case notFound                       // 404
    case unprocessable                  // 422 — 유효성 검사 실패
    case serverError                    // 5xx
    case decodingFailed(Error)          // Codable 디코딩 실패
    case noRefreshToken                 // Keychain에 refresh_token 없음
    case refreshFailed                  // 토큰 갱신 실패 → 로그아웃 필요
    case unknown(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .unauthorized:         return "인증이 필요합니다"
        case .forbidden:            return "접근 권한이 없습니다"
        case .notFound:             return "요청한 리소스를 찾을 수 없습니다"
        case .unprocessable:        return "입력값을 확인해주세요"
        case .serverError:          return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
        case .decodingFailed:       return "데이터 처리 중 오류가 발생했습니다"
        case .noRefreshToken:       return "다시 로그인해주세요"
        case .refreshFailed:        return "세션이 만료되었습니다. 다시 로그인해주세요"
        case .unknown(let code):    return "오류가 발생했습니다 (코드: \(code))"
        }
    }
}
