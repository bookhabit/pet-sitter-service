import { useNavigate } from 'react-router-dom';

export function JobWritePage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2.4rem', maxWidth: '60rem', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/jobs')}
        style={{
          marginBottom: '1.6rem',
          background: 'none',
          border: 'none',
          color: 'var(--blue500)',
          fontSize: '1.4rem',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        ← 목록으로
      </button>

      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.8rem' }}>구인공고 등록</h1>

      <p style={{ fontSize: '1.4rem', color: 'var(--grey500)', marginBottom: '2.4rem' }}>
        [Prototype] PetOwner 전용 페이지
      </p>

      <button
        onClick={() => navigate('/jobs')}
        style={{
          width: '100%',
          padding: '1.6rem',
          backgroundColor: 'var(--blue500)',
          color: 'white',
          border: 'none',
          borderRadius: '1.2rem',
          fontSize: '1.6rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        등록 완료 (목록으로)
      </button>
    </div>
  );
}
