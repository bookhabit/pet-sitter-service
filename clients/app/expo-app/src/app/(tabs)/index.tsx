import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing, Text, colors } from '@/design-system';

// Phase 0 확인용 임시 화면
// Phase 2에서 구인글 목록 (JobListContainer)으로 교체 예정
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text size="t2">공고 목록</Text>
      <Spacing size={8} />
      <Text size="b1" color="textSecondary">
        Phase 2에서 구인글 목록이 여기에 표시됩니다
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
