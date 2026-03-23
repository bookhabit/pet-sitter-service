import { Tabs } from 'expo-router';
import React from 'react';

import { colors } from '@/design-system';
import { useAuthStore } from '@/store/useAuthStore';

// (tabs) 그룹: 로그인 후 보이는 탭 네비게이터
// 역할별 탭 노출 제어:
//   PetOwner:  홈 | 채팅 | 프로필
//   PetSitter: 홈 | 즐겨찾기 | 채팅 | 프로필
export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);
  const isPetSitter = user?.role === 'PetSitter';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.grey200,
        },
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '공고',
          tabBarLabel: '공고',
        }}
      />
      {/* 즐겨찾기: PetSitter만 노출 */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: '즐겨찾기',
          tabBarLabel: '즐겨찾기',
          href: isPetSitter ? undefined : null, // null이면 탭에서 숨김
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarLabel: '채팅',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarLabel: '프로필',
        }}
      />
    </Tabs>
  );
}
