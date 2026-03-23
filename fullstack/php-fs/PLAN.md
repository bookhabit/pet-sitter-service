# PHP 펫시터 웹 구축 플랜

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| PHP 버전 | **8.2+** (Pure PHP) | 프레임워크 없이 API 연동 구조 명확히 학습 |
| HTTP 클라이언트 | **Guzzle 7** (Composer) | 멀티파트 업로드, 자동 재시도 처리 |
| 템플릿 | **Native PHP** (layout 상속) | 빌드 스텝 없음 |
| 세션 | **PHP 세션** (`$_SESSION`) | JWT 토큰을 서버사이드 세션에만 보관 (XSS 방어) |
| WebSocket | **Socket.io JS 클라이언트** (CDN) | PHP는 Socket.io 직접 연결 불가 → 브라우저 JS가 담당 |
| 에셋 | Plain CSS + Vanilla JS | 빌드 툴 불필요 |

---

## 2. 프로젝트 구조

```
pet-sitter-php/
├── public/                   ← 웹루트 (index.php 진입점)
│   ├── index.php             ← Front Controller
│   ├── .htaccess             ← 모든 요청 → index.php
│   └── assets/
│       ├── css/
│       └── js/
│           ├── chat.js       ← Socket.io 로직
│           ├── photo-preview.js
│           └── job-filter.js
│
├── src/
│   ├── Core/
│   │   ├── Router.php        ← 패턴 매칭 라우터
│   │   ├── Session.php       ← 세션 관리
│   │   ├── Auth.php          ← requireAuth(), hasRole()
│   │   └── View.php          ← render($template, $data)
│   │
│   ├── Api/
│   │   ├── ApiClient.php     ← Guzzle 래퍼 (모든 API 호출)
│   │   └── TokenRefresher.php← 401 시 자동 토큰 갱신
│   │
│   └── Controllers/
│       ├── AuthController.php
│       ├── JobController.php
│       ├── ApplicationController.php
│       ├── ProfileController.php
│       ├── ReviewController.php
│       ├── FavoriteController.php
│       └── ChatController.php
│
├── views/
│   ├── layout/
│   │   ├── base.php          ← DOCTYPE, head, nav, footer
│   │   ├── nav.php           ← 역할별 네비게이션
│   │   └── flash.php         ← 성공/에러 플래시 메시지
│   ├── auth/
│   │   ├── login.php
│   │   └── register.php
│   ├── jobs/
│   │   ├── index.php         ← 공고 목록 (필터/페이징)
│   │   ├── show.php          ← 공고 상세
│   │   ├── create.php        ← 공고 등록 폼
│   │   └── edit.php          ← 공고 수정 폼
│   ├── applications/
│   │   └── index.php         ← 지원자 목록 (PetOwner)
│   ├── profile/
│   │   ├── show.php
│   │   └── edit.php
│   ├── favorites/
│   │   └── index.php         ← 즐겨찾기 목록 (PetSitter)
│   ├── chat/
│   │   ├── index.php         ← 채팅방 목록
│   │   └── room.php          ← 실시간 채팅
│   ├── reviews/
│   │   └── user.php          ← 받은 리뷰 목록
│   ├── admin/
│   │   └── dashboard.php
│   └── errors/
│       ├── 403.php
│       ├── 404.php
│       └── 500.php
│
└── config/
    └── app.php               ← API_BASE_URL 등 상수
```

---

## 3. 전체 페이지 & 라우트

```
GET  /                        → /jobs 리다이렉트

# 인증
GET/POST /login               → AuthController::showLogin / login
GET/POST /register            → AuthController::showRegister / register
POST     /logout              → AuthController::logout

# 공고
GET  /jobs                    → JobController::index     (필터/페이징/검색)
GET  /jobs/create             → JobController::create    (PetOwner)
POST /jobs                    → JobController::store
GET  /jobs/:id                → JobController::show
GET  /jobs/:id/edit           → JobController::edit      (PetOwner/Admin)
POST /jobs/:id/edit           → JobController::update
POST /jobs/:id/delete         → JobController::destroy
POST /jobs/:id/apply          → ApplicationController::store   (PetSitter)
GET  /jobs/:id/applications   → ApplicationController::index   (PetOwner)
POST /jobs/:jobId/reviews     → ReviewController::store

# 지원 상태 변경
POST /job-applications/:id    → ApplicationController::update  (승인/거절)

# 프로필
GET/POST /profile             → ProfileController::show / update
POST     /profile/photo       → ProfileController::uploadPhoto
POST     /profile/delete      → ProfileController::destroy
GET  /users/:id               → ProfileController::showUser    (공개 프로필)
GET  /users/:id/reviews       → ReviewController::byUser

# 리뷰
POST /reviews/:id/delete      → ReviewController::destroy

# 즐겨찾기
GET  /favorites               → FavoriteController::index      (PetSitter)
POST /favorites               → FavoriteController::toggle

# 채팅
GET /chat                     → ChatController::index
GET /chat/:roomId             → ChatController::room

# 관리자
GET /admin                    → AdminController::dashboard
```

---

## 4. 인증 플로우 (JWT + PHP 세션)

### 로그인 시퀀스

```
POST /login (email, password)
  └─ API: POST /sessions → { access_token, refresh_token }
  └─ API: GET /users/:id → { full_name, roles, photos }
  └─ $_SESSION에 저장:
       access_token, refresh_token
       user_id, user_roles, user_name
  └─ session_regenerate_id(true)
  └─ redirect('/jobs')
```

### 요청마다 자동 토큰 갱신 (ApiClient)

```
1. $_SESSION['access_token']으로 Bearer 헤더 설정
2. 401 응답 수신
3. POST /sessions/refresh → 새 토큰 세션에 저장
4. 원래 요청 1회 재시도
5. Refresh도 실패 → 세션 파기 → /login 리다이렉트
```

### 세션 보안 설정

```php
session_set_cookie_params([
    'lifetime' => 0,        // 브라우저 종료 시 소멸
    'secure'   => true,     // HTTPS only (운영)
    'httponly' => true,     // JS에서 쿠키 접근 불가
    'samesite' => 'Lax',
]);
```

> **핵심**: JWT는 서버사이드 `$_SESSION`에만 저장. 쿠키에는 PHPSESSID만 존재 → XSS로 토큰 탈취 불가.

### CSRF 보호

모든 POST 폼에 CSRF 토큰 포함:
```html
<input type="hidden" name="csrf_token" value="<?= Session::csrf() ?>">
```

---

## 5. 핵심 구현 상세

### 5.1 ApiClient.php (Guzzle 래퍼)

```
get(path, query)      → JSON 디코딩 반환, 4xx/5xx → ApiException
post(path, body)      → JSON POST
put(path, body)       → JSON PUT
delete(path)
upload(path, field, fileInfo) → multipart 파일 업로드
```

Guzzle 전역 옵션:
- `base_uri` = `http://localhost:8000`
- `http_errors` = false (예외 대신 응답 코드로 처리)
- `timeout` = 15초

### 5.2 파일 업로드 프록시

```
브라우저 → multipart POST → PHP
  └─ $_FILES 임시파일 → Guzzle 멀티파트 스트리밍 → NestJS
  └─ NestJS: POST /photos/upload → { photo_id, url } 반환
  └─ photo_id를 hidden input에 저장 → 공고 등록 폼 제출 시 포함
```

**공고 등록 사진 플로우**: 사진 선택 → AJAX로 선(先) 업로드 → `photo_ids` 확보 → 본 폼 제출

### 5.3 공고 목록 필터

`method="GET"` 폼으로 북마크 가능한 URL. JS로 fetch + replaceState 사용해 페이지 리로드 없이 필터 적용 (JS 없을 때도 일반 폼 제출로 동작).

쿼리 파라미터: `page`, `limit`, `animalType`, `size`, `activity`, `startDate`, `endDate`, `search`, `min_price`, `max_price`

### 5.4 공고 등록 — 다중 반려동물

JS로 동적으로 반려동물 섹션 추가/제거. PHP에서 `$_POST['pets']`를 중첩 배열로 읽어 API 바디 구성:

```php
$body = [
    'start_time' => $_POST['start_time'],  // datetime-local → ISO 8601
    'end_time'   => $_POST['end_time'],
    'activity'   => $_POST['activity'],
    'pets'       => array_values($_POST['pets']),
    'photo_ids'  => $_POST['photo_ids'] ?? [],
    'address'    => $_POST['address'] ?: null,
    'latitude'   => isset($_POST['latitude']) ? (float)$_POST['latitude'] : null,
    'longitude'  => isset($_POST['longitude']) ? (float)$_POST['longitude'] : null,
    'price'      => isset($_POST['price']) ? (int)$_POST['price'] : null,
    'price_type' => $_POST['price_type'] ?: null,
];
```

### 5.5 채팅 — Socket.io 구조

PHP가 서버사이드로 초기 메시지 히스토리를 렌더링 후 `access_token`과 `jobApplicationId`를 페이지에 주입:

```php
<!-- room.php -->
<script>
const __APP__ = {
    accessToken:      <?= json_encode($_SESSION['access_token']) ?>,
    currentUserId:    <?= json_encode($_SESSION['user_id']) ?>,
    jobApplicationId: <?= json_encode($jobApplicationId) ?>
};
</script>
```

```js
// chat.js (브라우저에서 실행)
const socket = io('ws://localhost:8000/chat', {
    auth: { token: __APP__.accessToken }
});

socket.emit('joinRoom', { jobApplicationId: __APP__.jobApplicationId });

socket.on('joinedRoom', ({ chatRoomId }) => { /* chatRoomId 저장 */ });
socket.on('receiveMessage', (msg) => { /* DOM에 말풍선 추가 */ });
socket.on('messagesRead', ({ userId, lastReadAt }) => { /* 읽음 표시 */ });
socket.on('newMessageNotification', ({ chatRoomId, message }) => { /* 뱃지 갱신 */ });

// 전송
document.querySelector('#send').addEventListener('click', () => {
    socket.emit('sendMessage', { chatRoomId, content });
});
```

채팅방 진입 시: PHP가 REST `GET /chat-rooms/{id}/messages?limit=30`으로 히스토리 서버사이드 렌더링 → Socket.io 연결 후 신규 메시지는 JS가 추가.

---

## 6. 페이지별 API 호출 목록

| 페이지 | API 호출 |
|---|---|
| 로그인 | `POST /sessions` → `GET /users/:id` |
| 회원가입 | `POST /users` → `POST /sessions` |
| 공고 목록 | `GET /jobs?page&limit&filters...` |
| 공고 상세 | `GET /jobs/:id`, `GET /favorites` (PetSitter 즐겨찾기 상태) |
| 공고 등록 | `POST /photos/upload` (사진 선업로드), `POST /jobs` |
| 공고 수정 | `GET /jobs/:id`, `PUT /jobs/:id` |
| 지원자 목록 | `GET /jobs/:id`, `GET /jobs/:id/job-applications` |
| 지원 상태 변경 | `PUT /job-applications/:id` |
| 프로필 | `GET /users/:id`, `GET /users/:id/jobs`, `GET /users/:id/reviews` |
| 프로필 수정 | `PUT /users/:id` |
| 프로필 사진 | `POST /users/:id/photos` |
| 즐겨찾기 목록 | `GET /favorites` |
| 즐겨찾기 토글 | `POST /favorites` → `{ added: bool }` |
| 채팅 목록 | `GET /chat-rooms` |
| 채팅방 | `GET /chat-rooms/:id/messages?limit=30`, Socket.io |
| 리뷰 작성 | `POST /jobs/:jobId/reviews` |
| 리뷰 삭제 | `DELETE /reviews/:id` |
| 받은 리뷰 | `GET /users/:userId/reviews?sort=createdAt:desc` |

---

## 7. 에러 처리 전략

```
ApiException (Guzzle 래핑)
  ├── 400 → 폼으로 유효성 에러 플래시 후 리다이렉트
  ├── 401 → 토큰 갱신 시도 → 실패 시 세션 파기, /login
  ├── 403 → views/errors/403.php 렌더링
  ├── 404 → views/errors/404.php 렌더링
  ├── 409 → 충돌 메시지 플래시 (예: "이미 지원한 공고입니다")
  └── 5xx → views/errors/500.php 렌더링
```

모든 컨트롤러는 `public/index.php`의 전역 try/catch로 감싸짐.

---

## 8. 보안 체크리스트

| 위협 | 대응 |
|---|---|
| XSS | 모든 출력에 `htmlspecialchars()`, CSP 헤더 |
| CSRF | 모든 POST 폼에 CSRF 토큰 검증 |
| JWT 탈취 | 서버사이드 세션 보관, JS 접근 불가 쿠키 |
| 세션 고정 | 로그인 시 `session_regenerate_id(true)` |
| 파일 업로드 악용 | MIME + 크기 검증 후 NestJS로 프록시 |
| SQL 인젝션 | 직접 DB 없음 — 모든 데이터는 NestJS API 경유 |
| IDOR | API에서 소유권 검증, PHP는 버튼 렌더링 전 역할 확인 |

---

## 9. 구현 순서

1. **스켈레톤** — `composer.json`, `public/index.php`, `Core/Router.php`
2. **기반 레이어** — `Core/Session.php`, `Core/Auth.php`, `Core/View.php`
3. **API 클라이언트** — `Api/ApiClient.php`, `Api/TokenRefresher.php`
4. **인증** — `AuthController` + `views/auth/` (로그인/회원가입/로그아웃)
5. **공고 목록/상세** — 가장 핵심 기능
6. **공고 CRUD** + 사진 업로드 플로우
7. **지원 관리** — 지원/승인/거절
8. **프로필** + 프로필 사진 업로드
9. **리뷰** 작성/삭제
10. **즐겨찾기** 토글/목록
11. **채팅** — Socket.io (가장 복잡, 마지막)
12. **관리자** 페이지

---

## 10. 참고 서버 파일

| 파일 | 용도 |
|---|---|
| `src/chat/chat.gateway.ts` | Socket.io 이벤트명 및 auth 핸드셰이크 패턴 확인 |
| `src/jobs/dto/create-job-dto.ts` | 공고 생성 바디 구조 (중첩 `pets[]`, `photo_ids[]`) |
| `src/jobs/dto/search-job-query.dto.ts` | 공고 필터 쿼리 파라미터 전체 목록 |
| `src/sessions/sessions.controller.ts` | 로그인/갱신/로그아웃 요청/응답 형식 |
| `src/photos/photos.controller.ts` | 파일 업로드 엔드포인트 및 필드명 확인 |

---

**문서 버전**: 1.0
**최종 수정일**: 2026-03-23
