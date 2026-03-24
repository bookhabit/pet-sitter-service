import SwiftUI

// STANDARDS.md 5장 색상 토큰 — Android AppColors.kt, expo-app colors.ts와 동일한 값
enum AppColors {
    static let primary       = Color(hex: "#3182F6")
    static let primaryLight  = Color(hex: "#E8F3FF")
    static let textPrimary   = Color(hex: "#191F28")
    static let textSecondary = Color(hex: "#4E5968")
    static let grey200       = Color(hex: "#E5E8EB")
    static let grey400       = Color(hex: "#8B95A1")
    static let background    = Color(hex: "#F2F4F6")
    static let white         = Color(hex: "#FFFFFF")
    static let success       = Color(hex: "#12B76A")
    static let successLight  = Color(hex: "#ECFDF3")
    static let warning       = Color(hex: "#F79009")
    static let warningLight  = Color(hex: "#FFFAEB")
    static let danger        = Color(hex: "#F04438")
    static let dangerLight   = Color(hex: "#FEF3F2")
}

// Hex 문자열로 Color 생성 헬퍼
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8)  & 0xFF) / 255
        let b = Double(int         & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
