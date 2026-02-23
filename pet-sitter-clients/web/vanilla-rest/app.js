const API_BASE = 'http://localhost:3000';

// ── 상태 ──
let selectedRole = 'sitter'; // 'sitter' | 'owner'

// ── DOM 요소 ──
const roleBtns = document.querySelectorAll('.role-btn');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.querySelector('.login-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// ── 역할 선택 ──
roleBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    roleBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedRole = btn.dataset.role;
  });
});

// ── 로그인 제출 ──
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('이메일과 비밀번호를 입력해주세요.');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = '로그인 중...';

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: selectedRole }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || '로그인에 실패했습니다.');
    }

    const data = await response.json();

    // 토큰 저장
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('role', selectedRole);

    // 역할에 따라 페이지 이동
    if (selectedRole === 'sitter') {
      window.location.href = 'sitter-dashboard.html';
    } else {
      window.location.href = 'owner-dashboard.html';
    }
  } catch (err) {
    alert(err.message);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = '로그인';
  }
});
