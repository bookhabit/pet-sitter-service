import { useNavigate, useParams } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const isMe = userId === 'me' || userId === user?.id;

  return (
    <div style={{ padding: '2.4rem', maxWidth: '60rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.8rem' }}>
        {isMe ? '내 프로필' : `사용자 프로필 #${userId}`}
      </h1>

      <div
        style={{
          padding: '2.0rem',
          backgroundColor: 'white',
          borderRadius: '1.2rem',
          border: '1px solid var(--grey200)',
          marginBottom: '2.4rem',
        }}
      >
        {isMe && user ? (
          <>
            <p style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {user.full_name}
            </p>
            <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>
              역할: {user.roles.join(', ')}
            </p>
          </>
        ) : (
          <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>
            [Prototype] 사용자 프로필 미구현
          </p>
        )}
      </div>

      {isMe && (
        <button
          onClick={() => {
            clearAuth();
            navigate('/login', { replace: true });
          }}
          style={{
            width: '100%',
            padding: '1.6rem',
            backgroundColor: 'white',
            color: 'var(--red500, #ef4444)',
            border: '1px solid var(--red500, #ef4444)',
            borderRadius: '1.2rem',
            fontSize: '1.6rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      )}
    </div>
  );
}
