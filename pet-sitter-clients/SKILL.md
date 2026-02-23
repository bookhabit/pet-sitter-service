# Pet Sitter Client Skills

---

## scaffold-feature

새로운 피처를 CLAUDE.md 규칙에 맞게 파일 구조까지 스캐폴딩한다.

<instructions>
사용자가 피처 이름(예: "job-list", "profile")을 제공하면 다음 순서로 진행한다.

### 1. 프로젝트 스택 확인
현재 작업 중인 프로젝트 폴더가 어떤 스택인지 확인한다.
- `vanilla-rest` / `vanilla-graphql` → 순수 HTML/CSS/JS
- `react-rest` / `react-graphql` → React + TypeScript
- `nextjs-rest` / `nextjs-graphql` → Next.js + TypeScript

### 2. REST 스택이면 다음 3개 파일을 생성한다

**api/{feature}.js (또는 .ts)**
```
// 요청/응답 타입 (TypeScript 스택)
// API 호출 함수만 포함 — 비즈니스 로직 없음
// fetch는 async/await만 사용, .then() 금지
// 에러는 throw로 전파
const API_BASE_URL = 'http://localhost:3000';

export const {feature}API = {
  list: async () => { ... },
  getById: async (id) => { ... },
  create: async (data) => { ... },
};
```

**hooks/use{Feature}.js (또는 .ts)** (React/Next.js 스택만)
```
// API 호출 + 상태 관리 (loading / error / data)
// 컴포넌트는 이 훅을 통해서만 API 접근
```

**{feature}.html 또는 components/{Feature}.jsx**
```
// 뷰 로직만 포함
// API 직접 호출 금지 — 반드시 api 파일 또는 훅을 통해 호출
// 폼이 있으면 loading / error / disabled 상태 모두 처리
```

### 3. GraphQL 스택이면

**graphql/queries/{feature}.js**와 **hooks/use{Feature}.js** 생성

### 4. 생성 후 체크리스트

- [ ] API 파일에 뷰 로직 없음
- [ ] 컴포넌트에 직접 fetch 없음
- [ ] 모든 비동기에 try/catch 있음
- [ ] loading / error / success 상태 처리됨
- [ ] console.log로 에러 처리 안 함 (사용자에게 에러 표시)
</instructions>

---

## review

현재 파일 또는 선택한 코드를 CLAUDE.md 규칙에 따라 검토하고 위반 사항을 보고한다.

<instructions>
사용자가 파일 경로 또는 코드를 제공하면 다음 항목을 순서대로 검토한다.

### 검토 항목

**[구조]** 파일 책임 분리
- API 파일에 UI 로직 포함 여부
- 컴포넌트 파일에 직접 fetch 포함 여부
- 1 파일 = 1 책임 위반 여부

**[비동기]** async/await 규칙
- `.then()` 체이닝 사용 여부 → async/await로 교체 필요
- try/catch 없는 async 함수 여부

**[에러 처리]** 에러 가시성
- `console.log`로만 에러 처리하는 경우 → 사용자에게 에러 표시 필요
- `if (!x) return;` 조용히 무시하는 경우 → throw 또는 명시적 처리 필요
- 비동기 함수에 loading / error / success 상태 처리 없는 경우

**[타입 안정성]** (TypeScript 스택)
- `any` 타입 사용 여부
- 함수 인자/반환값 타입 누락 여부
- Null 방어 없는 체이닝 (`.name.toUpperCase()` 등)

**[폼]** 폼 상태
- loading 상태 없는 submit 버튼
- disabled 처리 없는 중복 제출 가능 폼
- 에러 메시지 미표시

### 보고 형식
위반 항목마다:
- **[위반 분류]** 무엇이 위반됐는가
- **왜** 규칙이 존재하는가 (1문장)
- **수정 방향** 코드 스니펫 포함

포맷팅, 스타일 선호도는 지적하지 않는다.
</instructions>

---

## create-api-file

REST API 파일을 CLAUDE.md 구조 규칙에 맞게 생성한다.

<instructions>
사용자가 도메인명(예: "auth", "jobs", "users")을 제공하면 해당 도메인의 API 파일을 생성한다.

### 생성 규칙

1. 파일 위치: `api/{domain}.js` (또는 `.ts`)
2. 파일에는 다음만 포함:
   - 요청/응답 타입 정의 (TypeScript 스택)
   - API 엔드포인트 호출 함수들
   - 에러 throw (처리는 호출자가)
3. 금지 사항:
   - 상태 관리 코드 (`useState`, `loading` 변수 등)
   - DOM 조작 또는 UI 로직
   - `.then()` 체이닝

### 바닐라 JS 템플릿
```js
const API_BASE_URL = 'http://localhost:3000';

export const {domain}API = {
  list: async () => {
    const res = await fetch(`${API_BASE_URL}/{domain}s`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res));
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/{domain}s/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res));
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE_URL}/{domain}s`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await extractErrorMessage(res));
    return res.json();
  },
};

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function extractErrorMessage(res) {
  const body = await res.json().catch(() => ({}));
  return body.message ?? `HTTP ${res.status}`;
}
```

생성 후 사용자에게 훅 파일(React) 또는 UI 연동 파일이 필요한지 물어본다.
</instructions>

---

## create-page

새 HTML 페이지 또는 컴포넌트를 Figma 디자인 또는 설명을 기반으로 CLAUDE.md 규칙에 맞게 생성한다.

<instructions>
사용자가 Figma URL, 스크린샷, 또는 페이지 설명을 제공하면:

### 1. 디자인 파악
- Figma URL이 있으면 `get_design_context`와 `get_screenshot` 도구로 디자인 컨텍스트 확인
- 스크린샷이 있으면 이미지를 분석해 레이아웃, 색상, 컴포넌트 파악

### 2. 스택 확인
현재 프로젝트 폴더 확인 후 스택에 맞는 파일 생성:
- `vanilla-*` → `{page}.html` + `{page}.css` + `{page}.js`
- `react-*` → `pages/{Page}.tsx` + `components/` 분리
- `nextjs-*` → `app/{page}/page.tsx`

### 3. 바닐라 JS 페이지 생성 원칙
- HTML: 마크업과 구조만, 인라인 스타일 금지
- CSS: 디자인 토큰(색상, 간격, radius) CSS 변수로 관리
- JS: DOM 이벤트 + API 호출 분리, API는 반드시 `api/` 파일 import

### 4. 폼이 있는 경우 필수 처리
```js
submitBtn.disabled = true;          // loading 시작
submitBtn.textContent = '처리 중...';
try {
  const data = await someAPI.action(payload);
  // 성공 처리
} catch (err) {
  showError(err.message);           // 사용자에게 에러 표시 (alert 또는 에러 메시지 DOM)
} finally {
  submitBtn.disabled = false;       // loading 종료
  submitBtn.textContent = '원래 텍스트';
}
```

### 5. 인증이 필요한 페이지
- 페이지 로드 시 `localStorage.getItem('accessToken')` 확인
- 없으면 `window.location.href = 'index.html'`로 리다이렉트
</instructions>
