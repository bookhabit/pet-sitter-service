import { Divider, Flex, Grid, Spacing, Text } from '@/design-system';

import { PreviewBox, Section } from '../ds-helpers';

const BOX_COLORS = ['var(--blue500)', 'var(--green500)', 'var(--orange400)', 'var(--red500)'];

function DemoBox({ color, label }: { color: string; label?: string }) {
  return (
    <div
      style={{
        width: '6.4rem',
        height: '4.8rem',
        backgroundColor: color,
        borderRadius: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {label && (
        <span style={{ fontSize: '1.1rem', color: 'white', fontWeight: 700 }}>{label}</span>
      )}
    </div>
  );
}

/* ─── Flex ───────────────────────────────────────────────────────── */

function FlexSection() {
  return (
    <Section
      id="layouts"
      title="Layouts"
      description="컴포넌트 배치를 담당하는 레이아웃 컴포넌트들입니다."
    >
      {/* Flex */}
      <div>
        <p
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--grey900)',
            marginBottom: '1.6rem',
          }}
        >
          Flex
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          <PreviewBox label="direction=row (기본) · gap={16}">
            <Flex gap={16}>
              {BOX_COLORS.map((c, i) => (
                <DemoBox key={c} color={c} label={String(i + 1)} />
              ))}
            </Flex>
          </PreviewBox>

          <PreviewBox label="direction=column · gap={12}">
            <Flex direction="column" gap={12}>
              {BOX_COLORS.slice(0, 3).map((c, i) => (
                <DemoBox key={c} color={c} label={String(i + 1)} />
              ))}
            </Flex>
          </PreviewBox>

          <PreviewBox label="justify=between · align=center">
            <Flex justify="between" align="center" style={{ width: '100%' }}>
              <DemoBox color="var(--blue500)" label="A" />
              <DemoBox color="var(--green500)" label="B" />
              <DemoBox color="var(--orange400)" label="C" />
            </Flex>
          </PreviewBox>

          <PreviewBox label="justify=center · wrap=true · gap={8}">
            <Flex justify="center" wrap gap={8} style={{ width: '100%' }}>
              {BOX_COLORS.concat(BOX_COLORS).map((c, i) => (
                <DemoBox key={i} color={c} label={String(i + 1)} />
              ))}
            </Flex>
          </PreviewBox>
        </div>
      </div>

      {/* Grid */}
      <div>
        <p
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--grey900)',
            marginBottom: '1.6rem',
          }}
        >
          Grid
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          <PreviewBox label="cols={2} · gap={16}">
            <Grid cols={2} gap={16} style={{ width: '100%' }}>
              {BOX_COLORS.map((c, i) => (
                <DemoBox key={c} color={c} label={String(i + 1)} />
              ))}
            </Grid>
          </PreviewBox>

          <PreviewBox label="cols={3} · gap={12}">
            <Grid cols={3} gap={12} style={{ width: '100%' }}>
              {[...BOX_COLORS, ...BOX_COLORS.slice(0, 2)].map((c, i) => (
                <DemoBox key={i} color={c} label={String(i + 1)} />
              ))}
            </Grid>
          </PreviewBox>
        </div>
      </div>

      {/* Spacing */}
      <div>
        <p
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--grey900)',
            marginBottom: '1.6rem',
          }}
        >
          Spacing
        </p>
        <PreviewBox label="컴포넌트는 외부 margin을 갖지 않습니다 — Spacing이 간격을 담당합니다">
          <Flex direction="column">
            <div
              style={{
                backgroundColor: 'var(--blue500)',
                borderRadius: '0.8rem',
                padding: '1.2rem 1.6rem',
              }}
            >
              <Text size="b2" color="white">
                Item A
              </Text>
            </div>
            <Spacing size={8} />
            <div
              style={{
                backgroundColor: 'var(--green500)',
                borderRadius: '0.8rem',
                padding: '1.2rem 1.6rem',
              }}
            >
              <Text size="b2" color="white">
                Item B — Spacing size=8 (8px)
              </Text>
            </div>
            <Spacing size={32} />
            <div
              style={{
                backgroundColor: 'var(--orange400)',
                borderRadius: '0.8rem',
                padding: '1.2rem 1.6rem',
              }}
            >
              <Text size="b2" color="white">
                Item C — Spacing size=32 (32px)
              </Text>
            </div>
          </Flex>
        </PreviewBox>
      </div>

      {/* Divider */}
      <div>
        <p
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--grey900)',
            marginBottom: '1.6rem',
          }}
        >
          Divider
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
          <PreviewBox label="Horizontal (기본)">
            <Flex direction="column" gap={16} style={{ width: '100%' }}>
              <Text size="b1">위 영역</Text>
              <Divider />
              <Text size="b1">아래 영역</Text>
            </Flex>
          </PreviewBox>

          <PreviewBox label="Vertical (Flex 내부)">
            <Flex gap={24} align="center" style={{ height: '4.8rem' }}>
              <Text size="b1">Left</Text>
              <Divider direction="vertical" />
              <Text size="b1">Center</Text>
              <Divider direction="vertical" />
              <Text size="b1">Right</Text>
            </Flex>
          </PreviewBox>
        </div>
      </div>
    </Section>
  );
}

export function LayoutSection() {
  return <FlexSection />;
}
