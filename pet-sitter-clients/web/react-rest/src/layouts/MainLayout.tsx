import { NavLink, Outlet } from 'react-router-dom';

import { useGlobalChatNotifications } from '@/hooks/chat';

const NAV_TABS = [
  { to: '/jobs', label: '홈', emoji: '🏠' },
  { to: '/chat', label: '채팅', emoji: '💬' },
  { to: '/favorites', label: '즐겨찾기', emoji: '⭐' },
  { to: '/profile/me', label: '프로필', emoji: '👤' },
] as const;

function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'white',
        borderTop: '1px solid var(--grey200)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 100,
      }}
    >
      {NAV_TABS.map(({ to, label, emoji }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            textDecoration: 'none',
            color: isActive ? 'var(--blue500)' : 'var(--grey400)',
            fontSize: '1rem',
            fontWeight: isActive ? 600 : 400,
            transition: 'color 0.15s',
          })}
        >
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{emoji}</span>
          <span style={{ fontSize: '1rem' }}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function MainLayout() {
  useGlobalChatNotifications();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        paddingBottom: '64px',
        backgroundColor: 'var(--grey50)',
      }}
    >
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
