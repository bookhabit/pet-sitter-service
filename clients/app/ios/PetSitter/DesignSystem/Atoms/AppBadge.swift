import SwiftUI

enum BadgeVariant { case primary, success, warning, danger, neutral }

struct AppBadge: View {
    let label: String
    var variant: BadgeVariant = .primary

    private var bgColor: Color {
        switch variant {
        case .primary: return AppColors.primaryLight
        case .success: return AppColors.successLight
        case .warning: return AppColors.warningLight
        case .danger:  return AppColors.dangerLight
        case .neutral: return AppColors.grey200
        }
    }
    private var textColor: Color {
        switch variant {
        case .primary: return AppColors.primary
        case .success: return AppColors.success
        case .warning: return AppColors.warning
        case .danger:  return AppColors.danger
        case .neutral: return AppColors.textSecondary
        }
    }

    var body: some View {
        Text(label)
            .font(AppTypography.caption)
            .foregroundStyle(textColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(bgColor)
            .cornerRadius(4)
    }
}
