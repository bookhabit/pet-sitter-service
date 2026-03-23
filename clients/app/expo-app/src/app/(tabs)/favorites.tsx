import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text, colors } from '@/design-system';

export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text size="b1" color="textSecondary">
        Phase 7에서 즐겨찾기 목록이 여기에 표시됩니다
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
});
