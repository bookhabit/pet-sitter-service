import { Navigate, Outlet } from 'react-router-dom';

import type { UserRole } from '@/schemas/user.schema';
import { useAuthStore } from '@/store/useAuthStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

/** 허용된 role 을 하나도 갖지 않은 사용자를 /jobs 로 리다이렉트 */
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);

  const hasRole = user?.roles.some((r) => allowedRoles.includes(r)) ?? false;
  if (!hasRole) return <Navigate to="/jobs" replace />;

  return <Outlet />;
}
