import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';

/** 로그인 사용자가 /login, /signup 접근 시 /jobs 로 리다이렉트 */
export function GuestGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/jobs" replace />;

  return <Outlet />;
}
