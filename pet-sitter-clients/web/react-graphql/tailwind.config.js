/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    /**
     * 8px Grid 시스템
     * spacing scale을 완전히 대체하여 m-7, p-9 같은
     * 임의의 수치 사용을 원천 차단합니다.
     */
    spacing: {
      0: '0',
      2: '0.2rem', // 2px
      4: '0.4rem', // 4px
      8: '0.8rem', // 8px
      12: '1.2rem', // 12px
      16: '1.6rem', // 16px
      24: '2.4rem', // 24px
      32: '3.2rem', // 32px
      48: '4.8rem', // 48px
      64: '6.4rem', // 64px
    },
    extend: {
      /**
       * Semantic Color Tokens
       * CSS 변수를 참조하여 테마 변경 시 한 곳에서 관리합니다.
       */
      colors: {
        // Semantic — 역할 기반
        primary: 'var(--blue500)',
        background: 'var(--grey100)',
        'text-primary': 'var(--grey900)',
        'text-secondary': 'var(--grey600)',
        // Status
        success: 'var(--green500)',
        warning: 'var(--orange400)',
        danger: 'var(--red500)',
        // Primitive — 직접 참조 필요 시
        grey100: 'var(--grey100)',
        grey200: 'var(--grey200)',
        grey600: 'var(--grey600)',
        grey900: 'var(--grey900)',
      },

      /**
       * Typography Scale
       * 폰트 크기 + 행간 + 자간을 세트로 정의합니다.
       * 피그마 수치와 1:1 대응 (1rem = 10px)
       */
      fontSize: {
        t1: ['2.4rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        t2: ['2.0rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        b1: ['1.6rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        b2: ['1.4rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        caption: ['1.2rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
      },

      /**
       * Border Radius Scale
       * 일관된 둥근 모서리를 강제합니다.
       */
      borderRadius: {
        none: '0',
        sm: '0.2rem', // 2px
        md: '0.4rem', // 4px
        lg: '0.8rem', // 8px
        xl: '1.2rem', // 12px
        '2xl': '1.6rem', // 16px
        '3xl': '2.0rem', // 20px
        full: '999.9rem',
      },

      /**
       * Overlay / Modal 전용 애니메이션
       */
      keyframes: {
        'overlay-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(-6px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'overlay-in': 'overlay-in 0.18s ease-out',
        'modal-in': 'modal-in 0.22s ease-out',
      },
    },
  },
  plugins: [],
}
