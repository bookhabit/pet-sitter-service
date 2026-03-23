'use client';

import { useState } from 'react';

import { Badge, Button, Checkbox, Text, TextField } from '@/design-system';

import { PreviewBox, Row, Section } from '../ds-helpers';

/* ─── Button ─────────────────────────────────────────────────────── */

function ButtonSection() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const triggerLoading = (id: string) => {
    setLoadingId(id);
    setTimeout(() => setLoadingId(null), 2000);
  };

  return (
    <Section
      id="button"
      title="Button"
      description="variant / size / isLoading / disabled 조합으로 모든 버튼 상태를 표현합니다."
    >
      <PreviewBox label="Variants — 클릭하면 Loading 상태 체험">
        <Row>
          <Button
            variant="primary"
            isLoading={loadingId === 'primary'}
            onClick={() => triggerLoading('primary')}
          >
            Primary
          </Button>
          <Button
            variant="secondary"
            isLoading={loadingId === 'secondary'}
            onClick={() => triggerLoading('secondary')}
          >
            Secondary
          </Button>
          <Button
            variant="danger"
            isLoading={loadingId === 'danger'}
            onClick={() => triggerLoading('danger')}
          >
            Danger
          </Button>
          <Button
            variant="ghost"
            isLoading={loadingId === 'ghost'}
            onClick={() => triggerLoading('ghost')}
          >
            Ghost
          </Button>
        </Row>
      </PreviewBox>

      <PreviewBox label="Sizes">
        <Row align="center">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
      </PreviewBox>

      <PreviewBox label="States">
        <Row>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>
            Secondary Disabled
          </Button>
        </Row>
      </PreviewBox>
    </Section>
  );
}

/* ─── TextField ──────────────────────────────────────────────────── */

function TextFieldSection() {
  const [value, setValue] = useState('');

  return (
    <Section
      id="textfield"
      title="TextField"
      description="forwardRef로 구현되어 react-hook-form의 Controller 패턴과 호환됩니다."
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2.4rem',
        }}
      >
        <PreviewBox label="Default">
          <TextField placeholder="입력해주세요" value={value} onChange={(e) => setValue(e.target.value)} />
        </PreviewBox>

        <PreviewBox label="Label + Hint">
          <TextField label="이메일" hint="예: user@example.com" type="email" placeholder="이메일을 입력해주세요" />
        </PreviewBox>

        <PreviewBox label="Error State">
          <TextField
            label="비밀번호"
            type="password"
            defaultValue="1234"
            error="비밀번호는 8자 이상이어야 합니다."
          />
        </PreviewBox>

        <PreviewBox label="Disabled">
          <TextField label="이름" defaultValue="홍길동" disabled />
        </PreviewBox>
      </div>
    </Section>
  );
}

/* ─── Checkbox ───────────────────────────────────────────────────── */

function CheckboxSection() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [agree, setAgree] = useState(false);

  return (
    <Section id="checkbox" title="Checkbox" description="커스텀 체크박스 UI. forwardRef로 구현됩니다.">
      <PreviewBox label="States">
        <Row gap={24}>
          <Checkbox checked={checked1} onChange={(e) => setChecked1(e.target.checked)} label="Unchecked" />
          <Checkbox checked={checked2} onChange={(e) => setChecked2(e.target.checked)} label="Checked" />
          <Checkbox checked={false} disabled label="Disabled" />
          <Checkbox checked={true} disabled label="Disabled Checked" />
        </Row>
      </PreviewBox>

      <PreviewBox label="실제 사용 예시">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <Text size="b2" color="secondary">
            약관 동의
          </Text>
          <Checkbox
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            label="[필수] 서비스 이용약관에 동의합니다."
          />
          <Checkbox checked={false} label="[선택] 마케팅 정보 수신에 동의합니다." />
          {agree && (
            <Text size="caption" color="secondary">
              필수 약관에 동의하셨습니다.
            </Text>
          )}
        </div>
      </PreviewBox>
    </Section>
  );
}

/* ─── Badge ──────────────────────────────────────────────────────── */

function BadgeSection() {
  return (
    <Section id="badge" title="Badge" description="상태, 카테고리, 태그 표시에 사용합니다.">
      <PreviewBox label="Variants">
        <Row>
          <Badge variant="primary">펫시터</Badge>
          <Badge variant="success">예약 완료</Badge>
          <Badge variant="warning">검토 중</Badge>
          <Badge variant="danger">예약 불가</Badge>
          <Badge variant="neutral">일반</Badge>
        </Row>
      </PreviewBox>

      <PreviewBox label="Sizes">
        <Row align="center">
          <Badge size="sm" variant="primary">Small</Badge>
          <Badge size="md" variant="primary">Medium</Badge>
        </Row>
      </PreviewBox>

      <PreviewBox label="실제 사용 예시">
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '1.6rem',
            padding: '2.0rem',
            border: '1px solid var(--grey200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
              <Text size="t2" as="h3">
                김민수
              </Text>
              <Badge variant="primary" size="sm">
                펫시터
              </Badge>
            </div>
            <Text size="b2" color="secondary">
              강남구 · 평점 4.9 · 리뷰 128개
            </Text>
          </div>
          <Badge variant="success">예약 가능</Badge>
        </div>
      </PreviewBox>
    </Section>
  );
}

/* ─── Export ─────────────────────────────────────────────────────── */

export function ComponentSection() {
  return (
    <>
      <ButtonSection />
      <TextFieldSection />
      <CheckboxSection />
      <BadgeSection />
    </>
  );
}
