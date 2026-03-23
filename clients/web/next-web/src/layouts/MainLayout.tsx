'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useGlobalChatNotifications } from '@/hooks/chat';
import { PCHeader } from './PCHeader';

const NAV_TABS = [
  { to: '/jobs', label: '홈', emoji: '🏠' },
  { to: '/chat', label: '채팅', emoji: '💬' },
  { to: '/favorites', label: '즐겨찾기', emoji: '⭐' },
  { to: '/profile/me', label: '프로필', emoji: '👤' },
] as const;

/**
 * [View] 모바일 하단 내비게이션 바
 * PC(lg 이상)에서는 숨김 — PCHeader의 네비게이션이 대신함
 */
function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex h-64 items-stretch border-t border-grey200 bg-white lg:hidden">
      {NAV_TABS.map(({ to, label, emoji }) => {
        const isActive = pathname === to || pathname.startsWith(to + '/');
        return (
          <Link
            key={to}
            href={to}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-2 no-underline transition-colors',
              isActive ? 'font-semibold text-primary' : 'font-normal text-text-secondary',
            ].join(' ')}
          >
            <span className="text-[2rem] leading-none">{emoji}</span>
            <span className="text-[1rem]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface Props {
  children: React.ReactNode;
}

/**
 * [Layout] 인증된 사용자 전용 메인 레이아웃
 *
 * - PC(lg 이상): 상단 PCHeader + 콘텐츠 영역
 * - 모바일(lg 미만): 하단 BottomNav + 콘텐츠 영역
 */
export function MainLayout({ children }: Props) {
  useGlobalChatNotifications();

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-64 lg:pb-0">
      {/* PC 전용 상단 헤더 */}
      <PCHeader />

      <div className="flex-1">{children}</div>

      {/* 모바일 전용 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
