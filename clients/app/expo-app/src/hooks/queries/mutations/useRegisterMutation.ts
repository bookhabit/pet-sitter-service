import { useMutation } from '@tanstack/react-query';

import { RegisterInput } from '@/schemas/userSchema';
import { authService } from '@/services/authService';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
  });
}
