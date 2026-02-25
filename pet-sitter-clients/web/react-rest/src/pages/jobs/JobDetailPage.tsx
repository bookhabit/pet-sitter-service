import { useNavigate, useParams } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

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

      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.8rem' }}>
        구인공고 상세 #{jobId}
      </h1>

      <div
        style={{
          padding: '1.6rem',
          backgroundColor: 'white',
          borderRadius: '1.2rem',
          border: '1px solid var(--grey200)',
          marginBottom: '2.4rem',
        }}
      >
        <p style={{ fontSize: '1.4rem', color: 'var(--grey500)', marginBottom: '0.8rem' }}>
          현재 역할: <strong>{user?.role}</strong>
        </p>
        <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>
          [Prototype] 역할에 따라 다른 UI 표시 예정
        </p>
      </div>

      {user?.role === 'PetSitter' && (
        <button
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
          지원하기 (PetSitter)
        </button>
      )}

      {user?.role === 'PetOwner' && (
        <button
          style={{
            width: '100%',
            padding: '1.6rem',
            backgroundColor: 'var(--grey100)',
            color: 'var(--grey700)',
            border: '1px solid var(--grey300)',
            borderRadius: '1.2rem',
            fontSize: '1.6rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          공고 수정 (PetOwner)
        </button>
      )}
    </div>
  );
}
