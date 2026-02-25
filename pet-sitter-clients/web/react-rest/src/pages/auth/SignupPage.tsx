import { useNavigate } from 'react-router-dom';

export function SignupPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '2.4rem',
        gap: '1.6rem',
      }}
    >
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.8rem' }}>회원가입</h1>

      <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>[Prototype] 회원가입 페이지</p>

      <button
        onClick={() => navigate('/login')}
        style={{
          width: '100%',
          maxWidth: '36rem',
          padding: '1.6rem',
          backgroundColor: 'white',
          color: 'var(--grey700)',
          border: '1px solid var(--grey300)',
          borderRadius: '1.2rem',
          fontSize: '1.6rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        로그인으로 이동
      </button>
    </div>
  );
}
