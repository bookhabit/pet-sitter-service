import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Spacing, Text, colors } from '@/design-system';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

// 프로필 화면 — Phase 0에서는 유저 정보 + 로그아웃 버튼만 제공
// Phase 3에서 프로필 수정 / 사진 업로드로 확장 예정
export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            // 서버 세션 삭제 → 로컬 토큰 삭제
            await authService.logout();
          } catch {
            // 서버 에러가 나도 로컬 로그아웃은 진행
          } finally {
            await logout();
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text size="t2">{user?.name ?? '이름 없음'}</Text>
      <Spacing size={4} />
      <Text size="b2" color="textSecondary">
        {user?.email}
      </Text>
      <Spacing size={8} />
      <Text size="caption" color="textSecondary">
        역할: {user?.role === 'PetOwner' ? '반려동물 주인' : user?.role === 'PetSitter' ? '펫시터' : '관리자'}
      </Text>

      <Spacing size={32} />

      <Button variant="secondary" onPress={handleLogout}>
        로그아웃
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
});
