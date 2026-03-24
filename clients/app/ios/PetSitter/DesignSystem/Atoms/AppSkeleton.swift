import SwiftUI

// AppSkeleton: shimmer 로딩 스켈레톤
struct AppSkeleton: View {
    var width: CGFloat? = nil   // nil = 가로 전체
    var height: CGFloat = 16
    var cornerRadius: CGFloat = 8

    @State private var shimmer = false

    var body: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [AppColors.grey200, AppColors.grey400.opacity(0.4), AppColors.grey200],
                    startPoint: shimmer ? .leading : .trailing,
                    endPoint: shimmer ? .trailing : .leading
                )
            )
            .frame(width: width, height: height)
            .cornerRadius(cornerRadius)
            .onAppear {
                withAnimation(.linear(duration: 1.2).repeatForever(autoreverses: false)) {
                    shimmer = true
                }
            }
    }
}
