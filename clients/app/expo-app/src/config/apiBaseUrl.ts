import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 환경별 API Base URL 결정 우선순위:
// 1. 실제 기기 → app.json extra.apiBaseUrl 또는 EXPO_PUBLIC_API_BASE_URL (실제 서버 IP 명시 필요)
// 2. Android 에뮬레이터 → 10.0.2.2 (에뮬레이터에서 호스트 머신을 가리키는 특수 IP)
// 3. iOS 시뮬레이터 → localhost

function resolveApiBaseUrl(): string {
  if (Constants.isDevice) {
    // 실제 기기: app.json extra 또는 .env에서 실제 서버 IP/도메인을 지정해야 함
    // 예) app.json: { "extra": { "apiBaseUrl": "http://192.168.0.10:3000" } }
    // 예) .env:      EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:3000
    return (
      Constants.expoConfig?.extra?.apiBaseUrl ??
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      'http://localhost:3000'
    );
  }

  if (Platform.OS === 'android') {
    // Android 에뮬레이터: 10.0.2.2 = 호스트 머신의 localhost
    return 'http://10.0.2.2:3000';
  }

  // iOS 시뮬레이터
  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveApiBaseUrl();
