import SwiftUI

// STANDARDS.md 5장 타이포그래피 스케일
// Android AppTypography.kt, expo-app typography.ts와 동일
enum AppTypography {
    static let t1      = Font.system(size: 24, weight: .bold)    // 제목 대
    static let t2      = Font.system(size: 20, weight: .bold)    // 제목 소
    static let b1      = Font.system(size: 16, weight: .regular) // 본문 대
    static let b2      = Font.system(size: 14, weight: .regular) // 본문 소
    static let caption = Font.system(size: 12, weight: .regular) // 캡션
}
