import SwiftUI

enum ButtonVariant { case primary, secondary, danger }

struct AppButton: View {
    let title: String
    var variant: ButtonVariant = .primary
    var isLoading: Bool = false
    var isDisabled: Bool = false
    let action: () -> Void

    private var bgColor: Color {
        switch variant {
        case .primary:   return AppColors.primary
        case .secondary: return AppColors.white
        case .danger:    return AppColors.danger
        }
    }
    private var fgColor: Color {
        switch variant {
        case .primary:   return AppColors.white
        case .secondary: return AppColors.primary
        case .danger:    return AppColors.white
        }
    }
    private var borderColor: Color { variant == .secondary ? AppColors.primary : .clear }

    var body: some View {
        Button(action: action) {
            ZStack {
                if isLoading {
                    ProgressView().tint(fgColor)
                } else {
                    Text(title).font(AppTypography.b1).foregroundStyle(fgColor)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(isDisabled ? AppColors.grey200 : bgColor)
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(borderColor, lineWidth: 1))
            .cornerRadius(8)
        }
        .disabled(isLoading || isDisabled)
    }
}
