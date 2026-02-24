import { useState } from 'react';

import { Button, Overlay, Skeleton, Spinner, Text } from '@/design-system';

import { useOpenModal } from '@/store/useModalStore';

import { PreviewBox, Row, Section } from '../ds-helpers';
import { CheckIcon, ChevronDownIcon, CloseIcon, HeartIcon } from '@/design-system/icons';
import { primitiveColors } from '@/design-system/tokens/colors';
import { Image } from '@/design-system/atoms/Image/Image';
import { ASSETS } from '@/design-system/images';

/* ─── Spinner ────────────────────────────────────────────────────── */

function SpinnerSection() {
  return (
    <Section
      id="spinner"
      title="Spinner"
      description="로딩 상태 표시. Button의 isLoading에서도 내부적으로 사용됩니다."
    >
      <PreviewBox label="Sizes">
        <Row align="center">
          {([16, 24, 32, 48] as const).map((size) => (
            <div
              key={size}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.8rem',
              }}
            >
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.8rem',
            }}
          >
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
              <IconComponent size={24} color={primitiveColors.blue500} />
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
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.8rem',
              }}
            >
              <HeartIcon size={size} color={primitiveColors.green500} />
              <span style={{ fontSize: '1.2rem', color: 'var(--grey600)' }}>{size}px</span>
            </div>
          ))}
        </Row>
      </PreviewBox>
    </Section>
  );
}

export function ImageSection() {
  return (
    <Section
      id="icons"
      title="Icons"
      description="SVG 기반 아이콘 컴포넌트. size / color / className 설정 가능합니다."
    >
      <Image src={ASSETS.DOG} />
      <Image src={'https://abcd'} />
    </Section>
  );
}

/* ─── Overlay ────────────────────────────────────────────────────── */

function OverlaySection() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [noCloseOpen, setNoCloseOpen] = useState(false);
  const openModal = useOpenModal();

  const handleGlobalConfirm = () => {
    openModal('confirm', {
      title: '예약을 취소하시겠어요?',
      message: '취소된 예약은 복구할 수 없습니다. 정말로 취소하시겠습니까?',
      confirmLabel: '예약 취소',
      cancelLabel: '돌아가기',
      variant: 'danger',
      onConfirm: () => {
        // 실제 앱에서는 API 호출 등의 작업 수행
      },
    });
  };

  return (
    <Section
      id="overlay"
      title="Overlay / Modal"
      description="Portal 기반 오버레이. ESC 키, 배경 클릭, 스크롤 잠금을 내장합니다. 전역 모달은 useOpenModal() 훅으로 어느 컴포넌트에서나 호출 가능합니다."
    >
      {/* 기본 Overlay */}
      <PreviewBox label="Overlay — 기본 (배경 클릭 · ESC 로 닫기)">
        <Button variant="primary" onClick={() => setBasicOpen(true)}>
          Overlay 열기
        </Button>
        <Overlay isOpen={basicOpen} onClose={() => setBasicOpen(false)}>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '1.6rem',
              padding: '3.2rem',
              width: '38rem',
              maxWidth: 'calc(100vw - 3.2rem)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <Text size="t2" as="h2">
              Overlay 예시
            </Text>
            <div style={{ marginTop: '1.2rem', marginBottom: '2.4rem' }}>
              <Text size="b1" color="secondary">
                배경을 클릭하거나 ESC 키를 누르면 닫힙니다.
              </Text>
            </div>
            <Button variant="primary" onClick={() => setBasicOpen(false)}>
              닫기
            </Button>
          </div>
        </Overlay>
      </PreviewBox>

      {/* closeOnOverlayClick 비활성화 */}
      <PreviewBox label="closeOnOverlayClick={false} — 버튼으로만 닫기">
        <Button variant="secondary" onClick={() => setNoCloseOpen(true)}>
          Overlay 열기
        </Button>
        <Overlay
          isOpen={noCloseOpen}
          onClose={() => setNoCloseOpen(false)}
          closeOnOverlayClick={false}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '1.6rem',
              padding: '3.2rem',
              width: '38rem',
              maxWidth: 'calc(100vw - 3.2rem)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <Text size="t2" as="h2">
              배경 클릭 비활성화
            </Text>
            <div style={{ marginTop: '1.2rem', marginBottom: '2.4rem' }}>
              <Text size="b1" color="secondary">
                배경을 클릭해도 닫히지 않습니다. 버튼으로만 닫을 수 있습니다.
              </Text>
            </div>
            <Button variant="primary" onClick={() => setNoCloseOpen(false)}>
              확인
            </Button>
          </div>
        </Overlay>
      </PreviewBox>

      {/* 전역 모달 — Zustand */}
      <PreviewBox label="전역 모달 (Zustand) — useOpenModal() 로 어디서든 호출">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <Text size="caption" color="secondary">
            open 액션만 셀렉터로 구독 → 모달 목록 변화에 이 컴포넌트는 리렌더링 없음
          </Text>
          <Button variant="danger" onClick={handleGlobalConfirm}>
            예약 취소 모달 열기
          </Button>
        </div>
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
      <ImageSection />
      <OverlaySection />
    </>
  );
}
