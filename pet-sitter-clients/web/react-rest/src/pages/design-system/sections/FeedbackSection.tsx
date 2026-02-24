import { CheckIcon, ChevronDownIcon, CloseIcon, Skeleton, Spinner } from '@/design-system';

import { PreviewBox, Row, Section } from '../ds-helpers';

/* ─── Spinner ────────────────────────────────────────────────────── */

function SpinnerSection() {
  return (
    <Section id="spinner" title="Spinner" description="로딩 상태 표시. Button의 isLoading에서도 내부적으로 사용됩니다.">
      <PreviewBox label="Sizes">
        <Row align="center">
          {([16, 24, 32, 48] as const).map((size) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
              <Spinner size={size} color="primary" />
              <span style={{ fontSize: '1.2rem', color: 'var(--grey600)' }}>{size}px</span>
            </div>
          ))}
        </Row>
      </PreviewBox>

      <PreviewBox label="Colors">
        <Row>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <Spinner size={24} color="primary" />
            <span style={{ fontSize: '1.4rem', color: 'var(--grey600)' }}>primary</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.2rem',
              backgroundColor: 'var(--grey900)',
              borderRadius: '0.8rem',
              padding: '1.2rem 1.6rem',
            }}
          >
            <Spinner size={24} color="white" />
            <span style={{ fontSize: '1.4rem', color: 'white' }}>white (dark bg)</span>
          </div>
        </Row>
      </PreviewBox>
    </Section>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────── */

function SkeletonSection() {
  return (
    <Section
      id="skeleton"
      title="Skeleton"
      description="데이터 로딩 중 레이아웃 자리를 차지하는 플레이스홀더입니다."
    >
      <PreviewBox label="Shapes">
        <Row align="start">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            <Skeleton width={48} height={48} rounded="full" />
            <span style={{ fontSize: '1.2rem', color: 'var(--grey600)' }}>Avatar</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <Skeleton width={200} height={16} />
            <Skeleton width={160} height={16} />
            <Skeleton width={120} height={16} />
            <span style={{ fontSize: '1.2rem', color: 'var(--grey600)' }}>Text Lines</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <Skeleton width={180} height={120} rounded="2xl" />
            <span style={{ fontSize: '1.2rem', color: 'var(--grey600)' }}>Card</span>
          </div>
        </Row>
      </PreviewBox>

      <PreviewBox label="펫시터 카드 로딩 예시">
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '1.6rem',
            padding: '2.0rem',
            border: '1px solid var(--grey200)',
            display: 'flex',
            gap: '1.6rem',
            alignItems: 'flex-start',
            maxWidth: '400px',
          }}
        >
          <Skeleton width={56} height={56} rounded="full" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <Skeleton width="70%" height={20} />
            <Skeleton width="50%" height={16} />
            <Skeleton width="90%" height={16} />
          </div>
        </div>
      </PreviewBox>
    </Section>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────── */

const ICONS = [
  { name: 'CheckIcon', component: CheckIcon },
  { name: 'CloseIcon', component: CloseIcon },
  { name: 'ChevronDownIcon', component: ChevronDownIcon },
] as const;

function IconSection() {
  return (
    <Section
      id="icons"
      title="Icons"
      description="SVG 기반 아이콘 컴포넌트. size / color / className 설정 가능합니다."
    >
      <PreviewBox label="Available Icons">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1.6rem',
            width: '100%',
          }}
        >
          {ICONS.map(({ name, component: IconComponent }) => (
            <div
              key={name}
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--grey200)',
                borderRadius: '1.2rem',
                padding: '2.0rem 1.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.2rem',
              }}
            >
              <IconComponent size={24} color="var(--grey900)" />
              <span style={{ fontSize: '1.2rem', color: 'var(--grey600)', textAlign: 'center' }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </PreviewBox>

      <PreviewBox label="Sizes">
        <Row align="center">
          {([12, 16, 20, 24, 32] as const).map((size) => (
            <div
              key={size}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}
            >
              <CheckIcon size={size} color="var(--blue500)" />
              <span style={{ fontSize: '1.2rem', color: 'var(--grey600)' }}>{size}px</span>
            </div>
          ))}
        </Row>
      </PreviewBox>
    </Section>
  );
}

/* ─── Export ─────────────────────────────────────────────────────── */

export function FeedbackSection() {
  return (
    <>
      <SpinnerSection />
      <SkeletonSection />
      <IconSection />
    </>
  );
}
