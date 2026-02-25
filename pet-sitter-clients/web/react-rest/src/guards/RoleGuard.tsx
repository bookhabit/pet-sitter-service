import { Navigate, Outlet } from 'react-router-dom';

import type { UserRole } from '@/store/useAuthStore';
import { useAuthStore } from '@/store/useAuthStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

/** 허용되지 않은 role 의 사용자를 /jobs 로 리다이렉트 */
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/jobs" replace />;
  }

  return <Outlet />;
}
