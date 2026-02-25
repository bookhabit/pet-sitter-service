import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';

export function JobsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div style={{ padding: '2.4rem', maxWidth: '60rem', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.4rem',
        }}
      >
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700 }}>구인공고 목록</h1>
        <button
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          style={{
            padding: '0.8rem 1.6rem',
            background: 'none',
            border: '1px solid var(--grey300)',
            borderRadius: '0.8rem',
            fontSize: '1.4rem',
            cursor: 'pointer',
            color: 'var(--grey600)',
          }}
        >
          로그아웃
        </button>
      </div>

      {user?.role === 'PetOwner' && (
        <button
          onClick={() => navigate('/jobs/write')}
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
            marginBottom: '1.6rem',
          }}
        >
          + 구인공고 등록
        </button>
      )}

      {/* Mock job cards */}
      {['공고 #1 — 골든리트리버 돌봄', '공고 #2 — 코카스파니엘 산책', '공고 #3 — 고양이 급식'].map(
        (title, i) => (
          <div
            key={i}
            onClick={() => navigate(`/jobs/${i + 1}`)}
            style={{
              padding: '1.6rem',
              backgroundColor: 'white',
              borderRadius: '1.2rem',
              border: '1px solid var(--grey200)',
              marginBottom: '1.2rem',
              cursor: 'pointer',
            }}
          >
            <p style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '0.4rem' }}>{title}</p>
            <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>클릭하여 상세 보기</p>
          </div>
        ),
      )}
    </div>
  );
}
