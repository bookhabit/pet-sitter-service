import { ComponentSection } from './sections/ComponentSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { LayoutSection } from './sections/LayoutSection';
import { TokenSection } from './sections/TokenSection';

/* ─── Nav Config ─────────────────────────────────────────────────── */

const NAV_GROUPS = [
  {
    group: 'Tokens',
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing-tokens', label: 'Spacing' },
      { id: 'radius', label: 'Border Radius' },
    ],
  },
  {
    group: 'Components',
    items: [
      { id: 'button', label: 'Button' },
      { id: 'textfield', label: 'TextField' },
      { id: 'checkbox', label: 'Checkbox' },
      { id: 'badge', label: 'Badge' },
    ],
  },
  {
    group: 'Feedback',
    items: [
      { id: 'overlay', label: 'Overlay / Modal' },
      { id: 'spinner', label: 'Spinner' },
      { id: 'skeleton', label: 'Skeleton' },
      { id: 'icons', label: 'Icons' },
    ],
  },
  {
    group: 'Layouts',
    items: [{ id: 'layouts', label: 'Flex / Grid / Spacing / Divider' }],
  },
] as const;

/* ─── Sidebar ────────────────────────────────────────────────────── */

function Sidebar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '22rem',
        height: '100vh',
        backgroundColor: 'var(--grey900)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '2.4rem 0',
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div style={{ padding: '0 2.0rem 2.4rem' }}>
        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
          Design System
        </p>
        <span
          style={{
            display: 'inline-block',
            marginTop: '0.6rem',
            fontSize: '1.0rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--orange400)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '0.4rem',
            padding: '0.2rem 0.6rem',
          }}
        >
          DEV ONLY
        </span>
      </div>

      <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '2.0rem 0' }}>
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group} style={{ marginBottom: '2.0rem' }}>
            <p
              style={{
                fontSize: '1.0rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--grey600)',
                padding: '0 2.0rem',
                marginBottom: '0.4rem',
              }}
            >
              {group}
            </p>
            {items.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.8rem 2.0rem',
                  fontSize: '1.4rem',
                  color: 'var(--grey200)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 0,
                  transition: 'color 0.15s, background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--grey200)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export function DesignSystemPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--grey100)' }}>
      <Sidebar />

      {/* Main content */}
      <main
        style={{
          marginLeft: '22rem',
          flex: 1,
          padding: '4.8rem 4.8rem 12rem',
          maxWidth: '96rem',
        }}
      >
        {/* Page title */}
        <div style={{ marginBottom: '5.6rem' }}>
          <h1
            style={{
              fontSize: '3.2rem',
              fontWeight: 700,
              color: 'var(--grey900)',
              lineHeight: 1.2,
              marginBottom: '1.2rem',
            }}
          >
            Design System
          </h1>
          <p style={{ fontSize: '1.6rem', color: 'var(--grey600)', lineHeight: 1.6 }}>
            펫시터 서비스의 UI 컴포넌트 라이브러리입니다. 개발 환경에서만 접근 가능합니다.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
          <TokenSection />
          <ComponentSection />
          <FeedbackSection />
          <LayoutSection />
        </div>
      </main>
    </div>
  );
}
