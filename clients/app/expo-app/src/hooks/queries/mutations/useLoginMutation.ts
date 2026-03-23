import { useMutation } from '@tanstack/react-query';

import { LoginInput } from '@/schemas/userSchema';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

// useLoginMutation: 로그인 API 호출 상태 관리
// - isPending: 로딩 상태 → 버튼 비활성화
// - onSuccess: 토큰 + 유저 정보를 AuthStore(SecureStore)에 저장
// - onError: 실패 시 에러를 호출부(Logic Hook)로 전달
export function useLoginMutation() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: async (response) => {
      // 로그인 성공 → SecureStore + Zustand 상태 동시 업데이트
      await login(
        {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        },
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          profileImage: response.user.profileImage,
        },
      );
    },
  });
}
