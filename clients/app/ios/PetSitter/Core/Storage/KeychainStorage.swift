import Foundation
import Security

// KeychainStorage: iOS Keychain을 이용한 보안 토큰 저장
// expo-app의 expo-secure-store, Android의 EncryptedSharedPreferences와 동일 역할
// @unchecked Sendable: Security.framework Keychain API는 thread-safe
final class KeychainStorage: @unchecked Sendable {
    static let shared = KeychainStorage()
    private init() {}

    func save(_ value: String, forKey key: String) {
        let data = Data(value.utf8)
        let query: [String: Any] = [
            kSecClass as String:          kSecClassGenericPassword,
            kSecAttrAccount as String:    key,
            kSecValueData as String:      data,
            // 기기 재시작 후 첫 잠금 해제 이후 접근 가능 (백그라운드 토큰 갱신 지원)
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func load(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String:  true,
            kSecMatchLimit as String:  kSecMatchLimitOne,
        ]
        var item: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
              let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String:       kSecClassGenericPassword,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }

    func clearAll() {
        delete(forKey: "access_token")
        delete(forKey: "refresh_token")
    }
}
