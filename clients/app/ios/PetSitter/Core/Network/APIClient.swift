import Foundation

// APIClient: URLSession 기반 HTTP 클라이언트
// - 인증 헤더 자동 주입
// - 401 발생 시 TokenRefresher로 자동 갱신 후 재시도
// - Codable 기반 타입 안전 응답 디코딩
// @unchecked Sendable: JSONDecoder/Encoder가 Swift 6에서 Sendable 미준수
// — 모두 let으로 초기화 후 불변 사용이므로 실제로는 안전함
final class APIClient: @unchecked Sendable {
    static let shared = APIClient()
    private init() {}

    private let session = URLSession.shared
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }()
    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.keyEncodingStrategy = .convertToSnakeCase
        return e
    }()

    // MARK: - Public (인증 필요)

    func request<T: Decodable>(
        _ endpoint: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        guard let token = KeychainStorage.shared.load(forKey: "access_token") else {
            throw NetworkError.unauthorized
        }
        return try await performRequest(endpoint, method: method, body: body, token: token)
    }

    // MARK: - Public (인증 불필요)

    func requestPublic<T: Decodable>(
        _ endpoint: String,
        method: String = "GET",
        body: Encodable? = nil
    ) async throws -> T {
        return try await performRequest(endpoint, method: method, body: body, token: nil)
    }

    // MARK: - Token Refresh (TokenRefresher 전용)

    func refreshTokens(refreshToken: String) async throws -> RefreshResponseDTO {
        return try await performRequest(
            "/sessions/refresh",
            method: "POST",
            body: ["refresh_token": refreshToken],
            token: nil
        )
    }

    // MARK: - Private

    private func performRequest<T: Decodable>(
        _ endpoint: String,
        method: String,
        body: Encodable?,
        token: String?,
        isRetry: Bool = false
    ) async throws -> T {
        let url = URL(string: APIConfig.baseURL + endpoint)!
        var request = URLRequest(url: url, timeoutInterval: 10)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            request.httpBody = try encoder.encode(AnyEncodable(body))
        }

        let (data, response) = try await session.data(for: request)
        let statusCode = (response as! HTTPURLResponse).statusCode

        switch statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw NetworkError.decodingFailed(error)
            }

        case 401 where !isRetry:
            // 401 → 토큰 갱신 후 1회 재시도
            let newToken = try await TokenRefresher.shared.refresh()
            return try await performRequest(endpoint, method: method, body: body, token: newToken, isRetry: true)

        case 401: throw NetworkError.unauthorized
        case 403: throw NetworkError.forbidden
        case 404: throw NetworkError.notFound
        case 422: throw NetworkError.unprocessable
        case 500...: throw NetworkError.serverError
        default:  throw NetworkError.unknown(statusCode: statusCode)
        }
    }
}

// Encodable 타입 소거 헬퍼
private struct AnyEncodable: Encodable {
    private let _encode: (Encoder) throws -> Void
    init(_ value: Encodable) { _encode = value.encode }
    func encode(to encoder: Encoder) throws { try _encode(encoder) }
}
