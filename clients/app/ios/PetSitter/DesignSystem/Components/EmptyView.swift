import SwiftUI

struct EmptyView: View {
    let message: String
    var actionTitle: String? = nil
    var onAction: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: AppSpacing.md) {
            Image(systemName: "tray")
                .font(.system(size: 48))
                .foregroundStyle(AppColors.grey400)
            Text(message)
                .font(AppTypography.b2)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
            if let title = actionTitle, let action = onAction {
                AppButton(title: title, action: action)
                    .frame(width: 180)
            }
        }
        .padding(AppSpacing.lg)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
