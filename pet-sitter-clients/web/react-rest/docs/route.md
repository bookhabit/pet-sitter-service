# Route Specification (Prototype / Navigation Only)

> 목적
>
> - 테스트용 디자인 시스템은 개발용으로 `_ds` 유지 (전역 접근 가능)
> - **기능 구현 없이 버튼 클릭 → 페이지 이동만 가능한 수준**으로 구성
> - 실제 기능/정교한 UI는 추후 구현

---

## 1. Public Routes (미인증 사용자)

로그인하지 않은 상태에서 접근 가능한 페이지

| 페이지   | 경로      |
| -------- | --------- |
| 회원가입 | `/signup` |
| 로그인   | `/login`  |

---

## 2. Protected Routes (인증 사용자)

로그인 후 접근 가능
공통 **Header Layout (홈 / 채팅 / 즐겨찾기 / 프로필)** 적용

---

### 🏠 홈 탭

| 페이지               | 경로             |
| -------------------- | ---------------- |
| 구인공고 목록 (메인) | `/jobs` 또는 `/` |
| 구인공고 상세        | `/jobs/:jobId`   |
| 구인공고 등록        | `/jobs/write`    |

---

### 💬 채팅 탭

| 페이지      | 경로            |
| ----------- | --------------- |
| 채팅방 목록 | `/chat`         |
| 채팅방 상세 | `/chat/:roomId` |

---

### ⭐ 즐겨찾기 탭

| 페이지                 | 경로         |
| ---------------------- | ------------ |
| 구인공고 즐겨찾기 목록 | `/favorites` |

---

### 👤 프로필 탭

| 페이지        | 경로               |
| ------------- | ------------------ |
| 내 프로필     | `/profile/me`      |
| 사용자 프로필 | `/profile/:userId` |

---

## 3. Role Guard 정책

### ✔ 구인공고 등록

- 경로: `/jobs/write`
- 조건: `user.role === "PetOwner"`

---

### ✔ 구인공고 상세

- 경로: `/jobs/:jobId`
- 조건:
  - 로그인 사용자 role에 따라 **다른 UI 표시**
  - (예: PetOwner / PetSitter 화면 분기)

---

## 4. Routing 구조 설계 권장

### Layout 구조

```
PublicLayout
 ├─ /login
 └─ /signup

MainLayout (Authenticated)
 ├─ / (=jobs)
 ├─ /jobs/:jobId
 ├─ /jobs/write
 ├─ /chat
 ├─ /chat/:roomId
 ├─ /favorites
 └─ /profile/:userId (id가 자신인지 판단 후 ui 분리)
```

---

### Guard 정책

#### 인증 가드

- 미인증 사용자가 Protected Route 접근 시 → `/login`
- 로그인 사용자가 `/login`, `/signup` 접근 시 → `/jobs`

---

## 5. 개발 단계 규칙 (현재 단계)

- 모든 페이지는 **navigation만 구현**
- 페이지 이동 버튼만 존재하면 충분

---

## 7. 목표 상태 (현재 Sprint Definition)

✔ 모든 URL 직접 진입 가능
✔ 모든 페이지 간 버튼 이동 가능
✔ Guard 정상 동작
✔ Layout 정상 적용

❌ 실제 기능 없음
❌ 서버 연결 없음
❌ 실제 데이터 없음

---

**End of Document**
