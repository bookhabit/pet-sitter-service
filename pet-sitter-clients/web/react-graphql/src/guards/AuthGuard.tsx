import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';

/** 미인증 사용자를 /login 으로 리다이렉트 */
export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
