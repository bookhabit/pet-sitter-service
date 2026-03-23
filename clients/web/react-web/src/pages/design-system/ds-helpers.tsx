import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section
      id={id}
      style={{
        paddingBottom: '6.4rem',
        scrollMarginTop: '3.2rem',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--grey200)',
          paddingBottom: '1.6rem',
          marginBottom: '3.2rem',
        }}
      >
        <h2
          style={{
            fontSize: '2.0rem',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            fontWeight: 700,
            color: 'var(--grey900)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontSize: '1.4rem',
              color: 'var(--grey600)',
              marginTop: '0.8rem',
              marginBottom: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.4rem' }}>{children}</div>
    </section>
  );
}

interface PreviewBoxProps {
  label?: string;
  children: ReactNode;
  center?: boolean;
}

export function PreviewBox({ label, children, center = false }: PreviewBoxProps) {
  return (
    <div>
      {label && (
        <p
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--grey600)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            marginBottom: '1.2rem',
          }}
        >
          {label}
        </p>
      )}
      <div
        style={{
          backgroundColor: 'var(--grey100)',
          borderRadius: '1.6rem',
          padding: '2.4rem',
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: '1.2rem',
          alignItems: center ? 'center' : 'flex-start',
          justifyContent: center ? 'center' : 'flex-start',
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface RowProps {
  children: ReactNode;
  gap?: number;
  align?: 'start' | 'center' | 'end';
}

export function Row({ children, gap = 12, align = 'center' }: RowProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: `${gap / 10}rem`,
        alignItems: align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start',
        flexWrap: 'wrap' as const,
      }}
    >
      {children}
    </div>
  );
}
