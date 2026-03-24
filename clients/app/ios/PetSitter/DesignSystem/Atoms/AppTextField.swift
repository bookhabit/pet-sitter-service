import SwiftUI

struct AppTextField: View {
    let label: String
    var placeholder: String = ""
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    var isSecure: Bool = false
    var errorMessage: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(AppTypography.b2)
                .foregroundStyle(AppColors.textPrimary)

            Group {
                if isSecure {
                    SecureField("", text: $text, prompt: Text(placeholder).foregroundStyle(AppColors.grey400))
                } else {
                    TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(AppColors.grey400))
                        .keyboardType(keyboardType)
                }
            }
            .foregroundStyle(AppColors.textPrimary)
            .font(AppTypography.b1)
            .padding(.horizontal, 12)
            .frame(height: 48)
            .background(AppColors.white)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(errorMessage != nil ? AppColors.danger : AppColors.grey200, lineWidth: 1)
            )

            if let error = errorMessage {
                Text(error)
                    .font(AppTypography.caption)
                    .foregroundStyle(AppColors.danger)
            }
        }
    }
}
