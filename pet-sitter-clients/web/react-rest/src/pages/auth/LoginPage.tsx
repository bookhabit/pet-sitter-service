import { useNavigate } from 'react-router-dom';

import type { User } from '@/store/useAuthStore';
import { useAuthStore } from '@/store/useAuthStore';

const MOCK_USERS: User[] = [
  { id: '1', name: '김철수 (PetOwner)', role: 'PetOwner' },
  { id: '2', name: '이영희 (PetSitter)', role: 'PetSitter' },
];

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = (user: User) => {
    login(user);
    navigate('/jobs', { replace: true });
  };

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
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.8rem' }}>로그인</h1>

      <p style={{ fontSize: '1.4rem', color: 'var(--grey500)', marginBottom: '1.6rem' }}>
        [Prototype] 아래 버튼으로 역할 선택 후 로그인
      </p>

      {MOCK_USERS.map((user) => (
        <button
          key={user.id}
          onClick={() => handleLogin(user)}
          style={{
            width: '100%',
            maxWidth: '36rem',
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
          {user.name} 으로 로그인
        </button>
      ))}

      <button
        onClick={() => navigate('/signup')}
        style={{
          marginTop: '0.8rem',
          background: 'none',
          border: 'none',
          color: 'var(--blue500)',
          fontSize: '1.4rem',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        회원가입
      </button>
    </div>
  );
}
