'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Flex, Text } from '@/design-system';
import {
  HeartIcon,
  HomeIcon,
  LogoIcon,
  LogoutIcon,
  MessageCircleIcon,
  UserIcon,
} from '@/design-system/icons';
import { Image } from '@/design-system/atoms/Image/Image';
import { useLogoutMutation } from '@/hooks/auth';
import { useAuthStore } from '@/store/useAuthStore';

interface NavItem {
  to: string;
  label: string;
  Icon: React.FC<{ size?: number; color?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/jobs', label: '홈', Icon: HomeIcon },
  { to: '/chat', label: '채팅', Icon: MessageCircleIcon },
  { to: '/favorites', label: '즐겨찾기', Icon: HeartIcon },
  { to: '/profile/me', label: '프로필', Icon: UserIcon },
];

/**
 * [View] PC 전용 상단 헤더
 *
 * Figma: node-id 6:2440
 * - 로고 (그라디언트 아이콘 + "펫시터" 텍스트)
 * - 네비게이션 탭 (홈/채팅/즐겨찾기/프로필)
 * - 우측: 유저 아바타 + 이름/역할 + 로그아웃 버튼
 *
 * 모바일(lg 미만)에서는 숨김 처리 — BottomNav가 대신함
 */
export function PCHeader() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const roleLabel = user?.roles.includes('PetSitter')
    ? '펫시터'
    : user?.roles.includes('PetOwner')
      ? '펫 오너'
      : '';

  const avatarSrc = user?.photos[0]?.url ?? undefined;

  return (
    <header className="hidden border-b border-grey200 bg-white lg:block">
      <div className="mx-auto flex h-64 max-w-[136rem] items-center justify-between px-16">
        {/* 좌측: 로고 + 네비게이션 */}
        <Flex align="center" gap={32}>
          {/* 로고 */}
          <Link href="/jobs" className="flex items-center gap-8 no-underline">
            <div className="h-36 w-36 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#2b7fff] to-[#155dfc] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
              <LogoIcon size={20} />
            </div>
            <Text
              as="span"
              size="t2"
              className="bg-gradient-to-r from-primary to-[#1447e6] bg-clip-text font-bold text-transparent"
            >
              펫시터
            </Text>
          </Link>

          {/* 네비게이션 탭 */}
          <nav className="flex items-center gap-8">
            {NAV_ITEMS.map(({ to, label, Icon }) => {
              const isActive = pathname === to || pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  href={to}
                  className={[
                    'flex items-center gap-8 rounded-xl px-12 py-8 text-b1 font-medium no-underline transition-colors',
                    isActive
                      ? 'bg-[#eff6ff] text-primary'
                      : 'text-text-secondary hover:bg-background hover:text-text-primary',
                  ].join(' ')}
                >
                  <Icon size={20} color={isActive ? 'var(--blue500)' : 'var(--grey600)'} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </Flex>

        {/* 우측: 유저 정보 + 로그아웃 */}
        <Flex align="center" gap={12}>
          {/* 아바타 */}
          {avatarSrc && (
            <div className="h-36 w-36 overflow-hidden rounded-full">
              <Image src={avatarSrc} alt="프로필 사진" className="h-full w-full" />
            </div>
          )}

          {/* 이름 + 역할 */}
          <div className="flex flex-col items-start">
            <Text as="span" size="b2" className="font-medium text-text-primary">
              {user?.full_name ?? ''}
            </Text>
            {roleLabel && (
              <Text as="span" size="caption" color="secondary">
                {roleLabel}
              </Text>
            )}
          </div>

          {/* 로그아웃 버튼 */}
          <button
            type="button"
            aria-label="로그아웃"
            disabled={isLoggingOut}
            onClick={() => logout()}
            className="h-36 w-36 flex items-center justify-center rounded-full bg-danger transition-colors hover:brightness-90 disabled:opacity-50"
          >
            <LogoutIcon size={20} color="white" />
          </button>
        </Flex>
      </div>
    </header>
  );
}
