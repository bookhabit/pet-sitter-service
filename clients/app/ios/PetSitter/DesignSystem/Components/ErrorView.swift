import SwiftUI

struct ErrorView: View {
    let message: String
    var onRetry: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: AppSpacing.md) {
            Image(systemName: "exclamationmark.circle")
                .font(.system(size: 48))
                .foregroundStyle(AppColors.danger)
            Text(message)
                .font(AppTypography.b2)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
            if let retry = onRetry {
                AppButton(title: "다시 시도", variant: .secondary, action: retry)
                    .frame(width: 140)
            }
        }
        .padding(AppSpacing.lg)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
