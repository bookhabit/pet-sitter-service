/**
 * SVGR 설정 파일
 *
 * SVG → React 컴포넌트 변환 규칙을 정의합니다.
 * 변경 후 npm run icons 를 실행하세요.
 *
 * [아이콘 추가 방법]
 * 1. SVG 파일을 src/design-system/icons/assets/ 에 넣는다
 *    - 파일명: PascalCase + Icon 접미사 (예: StarIcon.svg, BellIcon.svg)
 *    - stroke/fill 값은 "currentColor" 로 통일 (color prop이 적용됨)
 * 2. npm run icons 실행
 * 3. src/design-system/index.ts 에 새 아이콘 export 추가
 */

/** @type {import('@svgr/core').Config} */
const template = ({ componentName, jsx }, { tpl }) => {
  // SVGR 이 자동으로 붙이는 'Svg' 접두사 제거 (예: SvgCheckIcon → CheckIcon)
  const name = componentName.replace(/^Svg/, '');

  return tpl`
import type { IconProps } from '../types';

export function ${name}({ size = 24, color = 'currentColor', className, ...props }: IconProps) {
  return ${jsx};
}
`;
};

module.exports = {
  /** TypeScript .tsx 파일로 생성 */
  typescript: true,

  /** React 17+ automatic JSX transform (import React 불필요) */
  jsxRuntime: 'automatic',

  /**
   * SVG root 의 width/height 제거 → svgProps 에서 size 로 동적 주입
   * viewBox 는 유지됩니다
   */
  dimensions: false,

  /**
   * {…props} spread 위치: 'start' = svgProps 앞에 spread (size/color 가 우선순위를 가짐).
   * aria-label 등 접근성 props 를 컴포넌트에 전달할 수 있습니다.
   */
  expandProps: 'start',

  /**
   * components/ 디렉터리 자동 index.ts 생성 비활성화.
   * 대신 scripts/generate-icons.cjs 가 icons/index.ts 를 생성합니다.
   */
  index: false,

  /**
   * SVG root element 에 주입할 prop.
   * 값이 {} 로 감싸져 있으면 JSX expression 으로 처리됩니다.
   */
  svgProps: {
    width: '{size}',
    height: '{size}',
    className: '{className}',
  },

  /**
   * SVG attribute 값 치환.
   * "currentColor" → {color} 로 바꿔 color prop 이 stroke/fill 에 반영됩니다.
   * hardcoded 색상(예: #FB2C36)은 치환되지 않아 color prop 이 무시됩니다.
   */
  replaceAttrValues: {
    currentColor: '{color}',
  },

  /** 위에서 정의한 커스텀 컴포넌트 템플릿 */
  template,
};
