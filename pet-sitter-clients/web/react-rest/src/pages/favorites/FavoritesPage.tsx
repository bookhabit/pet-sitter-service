import { useNavigate } from 'react-router-dom';

export function FavoritesPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2.4rem', maxWidth: '60rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '2.4rem' }}>즐겨찾기</h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.6rem',
          paddingTop: '4rem',
          color: 'var(--grey400)',
        }}
      >
        <span style={{ fontSize: '4rem' }}>⭐</span>
        <p style={{ fontSize: '1.6rem' }}>즐겨찾기한 구인공고가 없습니다.</p>
        <button
          onClick={() => navigate('/jobs')}
          style={{
            padding: '1.2rem 2.4rem',
            backgroundColor: 'var(--blue500)',
            color: 'white',
            border: 'none',
            borderRadius: '1.2rem',
            fontSize: '1.4rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          구인공고 보러 가기
        </button>
      </div>
    </div>
  );
}
