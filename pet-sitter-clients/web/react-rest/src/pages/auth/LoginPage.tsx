import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { useLoginMutation } from '@/hooks/auth';

import type { LoginInput } from '@/schemas/auth.schema';

const s = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    padding: '2.4rem',
  },
  card: {
    width: '100%',
    maxWidth: '40rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  title: { fontSize: '2.8rem', fontWeight: 700, textAlign: 'center' as const },
  field: { display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' },
  label: { fontSize: '1.4rem', fontWeight: 500, color: 'var(--grey700)' },
  input: {
    padding: '1.2rem 1.6rem',
    border: '1px solid var(--grey300)',
    borderRadius: '1.0rem',
    fontSize: '1.6rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  submitBtn: {
    padding: '1.4rem',
    backgroundColor: 'var(--blue500)',
    color: 'white',
    border: 'none',
    borderRadius: '1.0rem',
    fontSize: '1.6rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.4rem',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--blue500)',
    fontSize: '1.4rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    alignSelf: 'center' as const,
  },
  error: {
    padding: '1.2rem 1.6rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.8rem',
    color: '#dc2626',
    fontSize: '1.4rem',
  },
  success: {
    padding: '1.2rem 1.6rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '0.8rem',
    color: '#16a34a',
    fontSize: '1.4rem',
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
  const { mutate, isPending, error } = useLoginMutation();

  const signupSuccess = (location.state as { signupSuccess?: boolean } | null)?.signupSuccess;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(form);
  };

  const errorMessage = (() => {
    if (!error) return null;
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    return '로그인 중 오류가 발생했습니다.';
  })();

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>로그인</h1>

        {signupSuccess && <p style={s.success}>회원가입이 완료되었습니다. 로그인해주세요.</p>}
        {errorMessage && <p style={s.error}>{errorMessage}</p>}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}
        >
          <div style={s.field}>
            <label htmlFor="email" style={s.label}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="owner1@test.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label htmlFor="password" style={s.label}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="비밀번호 입력"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              style={s.input}
            />
          </div>

          <button type="submit" disabled={isPending} style={s.submitBtn}>
            {isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <button onClick={() => navigate('/signup')} style={s.linkBtn}>
          계정이 없으신가요? 회원가입
        </button>
      </div>
    </div>
  );
}
