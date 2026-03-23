'use client';

import { Text } from '@/design-system';

import { PreviewBox, Section } from '../ds-helpers';

/* ─── Color Tokens ─────────────────────────────────────────────── */

const COLOR_TOKENS = [
  { label: 'primary', cssVar: '--blue500', hex: '#3182f6', usage: 'bg-primary · text-primary', dark: true },
  {
    label: 'background',
    cssVar: '--grey100',
    hex: '#f2f4f6',
    usage: 'bg-background',
    dark: false,
  },
  {
    label: 'text-primary',
    cssVar: '--grey900',
    hex: '#191f28',
    usage: 'text-text-primary · bg-grey900',
    dark: true,
  },
  {
    label: 'text-secondary',
    cssVar: '--grey600',
    hex: '#4e5968',
    usage: 'text-text-secondary · bg-grey600',
    dark: true,
  },
  {
    label: 'grey200',
    cssVar: '--grey200',
    hex: '#e5e8eb',
    usage: 'bg-grey200 · border-grey200',
    dark: false,
  },
  { label: 'success', cssVar: '--green500', hex: '#12b76a', usage: 'bg-success', dark: true },
  { label: 'warning', cssVar: '--orange400', hex: '#f79009', usage: 'bg-warning', dark: false },
  {
    label: 'danger',
    cssVar: '--red500',
    hex: '#f04438',
    usage: 'bg-danger · text-danger',
    dark: true,
  },
] as const;

function ColorSection() {
  return (
    <Section
      id="colors"
      title="Colors"
      description="CSS 변수 기반 색상 토큰. 브랜드 컬러 변경 시 :root 변수 하나만 수정하면 전체 반영됩니다."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.6rem',
        }}
      >
        {COLOR_TOKENS.map((token) => (
          <div
            key={token.label}
            style={{
              borderRadius: '1.2rem',
              overflow: 'hidden',
              border: '1px solid var(--grey200)',
            }}
          >
            <div
              style={{
                height: '88px',
                backgroundColor: `var(${token.cssVar})`,
                display: 'flex',
                alignItems: 'flex-end',
                padding: '0.8rem',
              }}
            >
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: token.dark ? 'rgba(255,255,255,0.9)' : 'var(--grey900)',
                  fontFamily: 'monospace',
                }}
              >
                {token.hex}
              </span>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.2rem' }}>
              <p
                style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--grey900)', margin: 0 }}
              >
                {token.label}
              </p>
              <p style={{ fontSize: '1.2rem', color: 'var(--grey600)', margin: '0.4rem 0 0', fontFamily: 'monospace' }}>
                var({token.cssVar})
              </p>
              <p style={{ fontSize: '1.1rem', color: 'var(--grey600)', margin: '0.4rem 0 0' }}>
                {token.usage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── Typography ────────────────────────────────────────────────── */

type TypographySize = 't1' | 't2' | 'b1' | 'b2' | 'caption';

const TYPOGRAPHY_SCALE: Array<{
  size: TypographySize;
  label: string;
  meta: string;
  sample: string;
}> = [
  { size: 't1', label: 'T1 — Heading', meta: '24px · Bold · lh 1.3', sample: '펫시터를 찾는 가장 편리한 방법' },
  { size: 't2', label: 'T2 — Sub Heading', meta: '20px · Bold · lh 1.3', sample: '내 주변 펫시터 찾기' },
  {
    size: 'b1',
    label: 'B1 — Body',
    meta: '16px · Regular · lh 1.5',
    sample: '전문 펫시터가 소중한 반려동물을 돌봐드립니다.',
  },
  {
    size: 'b2',
    label: 'B2 — Body Small',
    meta: '14px · Regular · lh 1.5',
    sample: '128개의 리뷰 · 평점 4.8',
  },
  {
    size: 'caption',
    label: 'Caption',
    meta: '12px · Regular · lh 1.5',
    sample: '최근 30일 기준 통계입니다.',
  },
];

function TypographySection() {
  return (
    <Section
      id="typography"
      title="Typography"
      description="폰트 크기 + 행간 + 자간을 하나의 클래스로 관리합니다. 1rem = 10px (피그마 수치 1:1 대응)"
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid var(--grey200)',
          borderRadius: '1.6rem',
          overflow: 'hidden',
        }}
      >
        {TYPOGRAPHY_SCALE.map((item, idx) => (
          <div
            key={item.size}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2.0rem 2.4rem',
              borderBottom:
                idx < TYPOGRAPHY_SCALE.length - 1 ? '1px solid var(--grey100)' : 'none',
            }}
          >
            <Text size={item.size}>{item.sample}</Text>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '2.4rem' }}>
              <p
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--blue500)',
                  fontFamily: 'monospace',
                  margin: 0,
                }}
              >
                text-{item.size}
              </p>
              <p style={{ fontSize: '1.2rem', color: 'var(--grey600)', margin: '0.4rem 0 0' }}>
                {item.meta}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── Spacing & Border Radius ────────────────────────────────────── */

const SPACING_TOKENS = [2, 4, 8, 12, 16, 24, 32, 48, 64] as const;

const RADIUS_TOKENS = [
  { name: 'sm', px: '2px', rem: '0.2rem' },
  { name: 'md', px: '4px', rem: '0.4rem' },
  { name: 'lg', px: '8px', rem: '0.8rem' },
  { name: 'xl', px: '12px', rem: '1.2rem' },
  { name: '2xl', px: '16px', rem: '1.6rem' },
  { name: '3xl', px: '20px', rem: '2.0rem' },
  { name: 'full', px: '∞', rem: '999.9rem' },
] as const;

function SpacingSection() {
  return (
    <Section
      id="spacing"
      title="Spacing & Border Radius"
      description="8px Grid 시스템. 허용된 값 외 임의의 수치(m-7, p-9 등)는 사용할 수 없습니다."
    >
      {/* Spacing Bars */}
      <PreviewBox label="Spacing Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.0rem', width: '100%' }}>
          {SPACING_TOKENS.map((size) => (
            <div
              key={size}
              style={{ display: 'flex', alignItems: 'center', gap: '1.6rem', width: '100%' }}
            >
              <span
                style={{
                  width: '4.8rem',
                  fontSize: '1.2rem',
                  color: 'var(--grey600)',
                  textAlign: 'right',
                  flexShrink: 0,
                  fontFamily: 'monospace',
                }}
              >
                {size}px
              </span>
              <div
                style={{
                  width: `${size / 10}rem`,
                  height: '2.4rem',
                  backgroundColor: 'var(--blue500)',
                  borderRadius: '0.4rem',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '1.2rem',
                  color: 'var(--grey600)',
                  fontFamily: 'monospace',
                }}
              >
                p-{size} · m-{size} · gap-{size}
              </span>
            </div>
          ))}
        </div>
      </PreviewBox>

      {/* Border Radius */}
      <PreviewBox label="Border Radius">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2.4rem',
            alignItems: 'flex-end',
          }}
        >
          {RADIUS_TOKENS.map((item) => (
            <div
              key={item.name}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.0rem' }}
            >
              <div
                style={{
                  width: item.name === 'full' ? '5.6rem' : '5.6rem',
                  height: item.name === 'full' ? '5.6rem' : '5.6rem',
                  backgroundColor: 'var(--blue500)',
                  borderRadius: item.rem,
                }}
              />
              <p
                style={{
                  fontSize: '1.2rem',
                  fontFamily: 'monospace',
                  color: 'var(--blue500)',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                rounded-{item.name}
              </p>
              <p style={{ fontSize: '1.1rem', color: 'var(--grey600)', margin: 0 }}>{item.px}</p>
            </div>
          ))}
        </div>
      </PreviewBox>
    </Section>
  );
}

/* ─── Export ─────────────────────────────────────────────────────── */

export function TokenSection() {
  return (
    <>
      <ColorSection />
      <TypographySection />
      <SpacingSection />
    </>
  );
}
