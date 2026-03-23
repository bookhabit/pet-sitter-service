// 'type' 키워드를 추가하여 타입 전용 임포트임을 명시합니다.
import type { SVGProps } from 'react';

// 공통 아이콘 속성 정의
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}
