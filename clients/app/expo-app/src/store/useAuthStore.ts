import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

// UserDto: 서버 /users/me 응답 중 클라이언트에서 필요한 필드만
interface UserDto {
  id: string;
  email: string;
  name: string | null;
  role: 'PetOwner' | 'PetSitter' | 'Admin';
  profileImage: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDto | null;
  // isHydrated: SecureStore에서 토큰을 읽는 초기화가 완료됐는지 여부
  // false 동안은 라우터가 리다이렉트를 결정하지 않음 (스플래시 유지)
  isHydrated: boolean;

  // 앱 시작 시 SecureStore → 메모리 상태로 복구
  hydrate: () => Promise<void>;
  // 로그인 성공 후 토큰 + 유저 정보를 SecureStore + 메모리에 저장
  login: (tokens: { accessToken: string; refreshToken: string }, user: UserDto) => Promise<void>;
  // 로그아웃: 서버 DELETE /sessions는 호출부에서 처리, 여기서는 로컬 정리만
  logout: () => Promise<void>;
  // 토큰 갱신 후 새 토큰만 업데이트 (privateApi interceptor에서 호출 가능)
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isHydrated: false,

  hydrate: async () => {
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    // 유저 정보는 SecureStore에 JSON으로 저장
    const userJson = await SecureStore.getItemAsync('user');
    const user: UserDto | null = userJson ? (JSON.parse(userJson) as UserDto) : null;
    set({ accessToken, refreshToken, user, isHydrated: true });
  },

  login: async (tokens, user) => {
    await SecureStore.setItemAsync('access_token', tokens.accessToken);
    await SecureStore.setItemAsync('refresh_token', tokens.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user');
    set({ accessToken: null, refreshToken: null, user: null });
  },

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    set({ accessToken, refreshToken });
  },
}));
