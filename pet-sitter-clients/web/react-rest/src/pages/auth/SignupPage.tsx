import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useSignupMutation } from '@/hooks/auth';

import type { CreateUserInput } from '@/schemas/user.schema';
import type { UserRole } from '@/schemas/user.schema';

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
  roleGroup: {
    display: 'flex',
    gap: '1.2rem',
  },
  roleBtn: (active: boolean) => ({
    flex: 1,
    padding: '1.0rem',
    border: `2px solid ${active ? 'var(--blue500)' : 'var(--grey300)'}`,
    borderRadius: '0.8rem',
    backgroundColor: active ? '#eff6ff' : 'white',
    color: active ? 'var(--blue500)' : 'var(--grey600)',
    fontSize: '1.4rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
  }),
};

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Omit<CreateUserInput, 'roles'> & { role: UserRole }>({
    email: '',
    full_name: '',
    password: '',
    role: 'PetOwner',
  });

  const { mutate, isPending, error } = useSignupMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ email: form.email, full_name: form.full_name, password: form.password, roles: [form.role] });
  };

  const errorMessage = (() => {
    if (!error) return null;
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 409) return '이미 사용 중인 이메일입니다.';
    if (status === 400) return '입력 정보를 확인해주세요.';
    return '회원가입 중 오류가 발생했습니다.';
  })();

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>회원가입</h1>

        {errorMessage && <p style={s.error}>{errorMessage}</p>}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}
        >
          <div style={s.field}>
            <label style={s.label}>역할 선택</label>
            <div style={s.roleGroup}>
              {(['PetOwner', 'PetSitter'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role }))}
                  style={s.roleBtn(form.role === role)}
                >
                  {role === 'PetOwner' ? '🐾 펫 주인' : '🐶 펫시터'}
                </button>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <label htmlFor="full_name" style={s.label}>
              이름
            </label>
            <input
              id="full_name"
              type="text"
              required
              minLength={2}
              maxLength={50}
              placeholder="김주인"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              style={s.input}
            />
          </div>

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
              비밀번호 (8자 이상)
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="비밀번호 입력"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              style={s.input}
            />
          </div>

          <button type="submit" disabled={isPending} style={s.submitBtn}>
            {isPending ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <button onClick={() => navigate('/login')} style={s.linkBtn}>
          이미 계정이 있으신가요? 로그인
        </button>
      </div>
    </div>
  );
}
