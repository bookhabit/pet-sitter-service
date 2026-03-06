import { primitiveColors } from '@/design-system/tokens/colors';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: primitiveColors.grey100,
      }}
    >
      <Outlet />
    </div>
  );
}
