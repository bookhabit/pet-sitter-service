# Flask 펫시터 웹 구축 플랜

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| Python 버전 | **3.12+** | match문, 타입힌트 강화 |
| 웹 프레임워크 | **Flask 3.x** | 경량, 구조 명확, 학습에 적합 |
| HTTP 클라이언트 | **httpx** | 동기/비동기 모두 지원, requests보다 현대적 |
| 템플릿 | **Jinja2** (Flask 내장) | 상속, 매크로, 자동 이스케이프 |
| 세션 | **Flask 세션** (`flask.session`) | 서버사이드 세션으로 JWT 보관 |
| 환경 변수 | **python-dotenv** | `.env` 파일 관리 |
| WebSocket | **Socket.io JS 클라이언트** (CDN) | Python에서 Socket.io 클라이언트 불가 → 브라우저 JS 담당 |
| 에셋 | Plain CSS + Vanilla JS | 빌드 툴 불필요 |
| 패키지 관리 | **pip + requirements.txt** | 표준 |

---

## 2. 프로젝트 구조

```
pet-sitter-flask/
├── requirements.txt
├── .env                          ← API_BASE_URL, SECRET_KEY 등
├── .env.example
├── run.py                        ← 개발 서버 진입점 (app.run)
│
├── app/
│   ├── __init__.py               ← create_app() 팩토리
│   ├── config.py                 ← Config 클래스 (env 로드)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── client.py             ← httpx 래퍼 (모든 API 호출)
│   │   └── exceptions.py         ← ApiException 정의
│   │
│   ├── auth/
│   │   ├── __init__.py
│   │   └── helpers.py            ← login_required, role_required 데코레이터
│   │
│   ├── blueprints/
│   │   ├── auth.py               ← /login, /register, /logout
│   │   ├── jobs.py               ← /jobs CRUD
│   │   ├── applications.py       ← /job-applications
│   │   ├── profile.py            ← /profile, /users/:id
│   │   ├── reviews.py            ← /reviews
│   │   ├── favorites.py          ← /favorites
│   │   ├── chat.py               ← /chat
│   │   └── admin.py              ← /admin
│   │
│   ├── templates/
│   │   ├── layout/
│   │   │   ├── base.html         ← DOCTYPE, head, nav, footer 블록
│   │   │   ├── nav.html          ← 역할별 네비게이션 (include)
│   │   │   └── flash.html        ← 플래시 메시지 (include)
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   ├── jobs/
│   │   │   ├── index.html        ← 공고 목록 (필터/페이징)
│   │   │   ├── show.html         ← 공고 상세
│   │   │   ├── create.html       ← 공고 등록 폼
│   │   │   └── edit.html         ← 공고 수정 폼
│   │   ├── applications/
│   │   │   └── index.html        ← 지원자 목록 (PetOwner)
│   │   ├── profile/
│   │   │   ├── show.html
│   │   │   └── edit.html
│   │   ├── favorites/
│   │   │   └── index.html
│   │   ├── chat/
│   │   │   ├── index.html        ← 채팅방 목록
│   │   │   └── room.html         ← 실시간 채팅
│   │   ├── reviews/
│   │   │   └── user.html         ← 받은 리뷰 목록
│   │   ├── admin/
│   │   │   └── dashboard.html
│   │   └── errors/
│   │       ├── 403.html
│   │       ├── 404.html
│   │       └── 500.html
│   │
│   └── static/
│       ├── css/
│       │   ├── main.css
│       │   └── chat.css
│       └── js/
│           ├── chat.js           ← Socket.io 로직
│           ├── photo-preview.js
│           └── job-filter.js
│
└── tests/
    └── test_api_client.py
```

---

## 3. 앱 팩토리 패턴 (`app/__init__.py`)

```python
# 개념적 구조 (실제 코드 아님)
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 세션: 서버사이드 (flask-session + 파일/메모리 스토어)
    # 또는 서명된 쿠키 세션에 JWT 저장 (개발 단계)
    Session(app)

    # Blueprint 등록
    app.register_blueprint(auth_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(applications_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(admin_bp)

    # 에러 핸들러
    app.register_error_handler(403, handle_403)
    app.register_error_handler(404, handle_404)
    app.register_error_handler(500, handle_500)

    # Jinja2 전역 헬퍼
    app.jinja_env.globals.update(
        current_user=get_current_user,
        is_pet_owner=is_pet_owner,
        is_pet_sitter=is_pet_sitter,
        format_price=format_price,
        format_date=format_date,
    )

    return app
```

---

## 4. 전체 페이지 & 라우트

```
GET  /                            → /jobs 리다이렉트

# 인증 (auth Blueprint, prefix: 없음)
GET/POST /login                   → auth.login
GET/POST /register                → auth.register
POST     /logout                  → auth.logout

# 공고 (jobs Blueprint, prefix: /jobs)
GET  /jobs                        → jobs.index       (필터/페이징/검색)
GET  /jobs/create                 → jobs.create      (PetOwner)
POST /jobs/create                 → jobs.store
GET  /jobs/<id>                   → jobs.show
GET  /jobs/<id>/edit              → jobs.edit        (PetOwner/Admin)
POST /jobs/<id>/edit              → jobs.update
POST /jobs/<id>/delete            → jobs.destroy
POST /jobs/<id>/apply             → applications.store  (PetSitter)
GET  /jobs/<id>/applications      → applications.index  (PetOwner)
POST /jobs/<job_id>/reviews       → reviews.store

# 지원 상태 변경
POST /job-applications/<id>       → applications.update  (승인/거절)

# 프로필
GET/POST /profile                 → profile.show / update
POST     /profile/photo           → profile.upload_photo
POST     /profile/delete          → profile.destroy
GET  /users/<id>                  → profile.show_user    (공개 프로필)
GET  /users/<id>/reviews          → reviews.by_user

# 리뷰
POST /reviews/<id>/delete         → reviews.destroy

# 즐겨찾기
GET  /favorites                   → favorites.index      (PetSitter)
POST /favorites                   → favorites.toggle

# 채팅
GET /chat                         → chat.index
GET /chat/<room_id>               → chat.room

# 관리자
GET /admin                        → admin.dashboard
```

---

## 5. 인증 플로우 (JWT + Flask 세션)

### 로그인 시퀀스

```python
# POST /login
# 1. API: POST /sessions → { access_token, refresh_token }
# 2. API: GET /users/:id → { full_name, roles, photos }
# 3. 세션에 저장
session['access_token']  = access_token
session['refresh_token'] = refresh_token
session['user_id']       = user_id
session['user_roles']    = roles       # list
session['user_name']     = full_name
# 4. redirect('/jobs')
```

### 자동 토큰 갱신 (`api/client.py`)

```python
# 모든 API 요청 흐름
def request(method, path, **kwargs):
    token = session.get('access_token')
    headers = {'Authorization': f'Bearer {token}'}

    resp = httpx.request(method, BASE_URL + path, headers=headers, **kwargs)

    if resp.status_code == 401:
        # 토큰 갱신 시도
        new_tokens = refresh_tokens()
        if new_tokens:
            headers['Authorization'] = f'Bearer {new_tokens["access_token"]}'
            resp = httpx.request(method, BASE_URL + path, headers=headers, **kwargs)
        else:
            session.clear()
            abort(redirect(url_for('auth.login')))

    if resp.status_code >= 400:
        raise ApiException(resp.status_code, resp.json())

    return resp.json()
```

### 인증 데코레이터 (`auth/helpers.py`)

```python
from functools import wraps
from flask import session, redirect, url_for, abort

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'access_token' not in session:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user_roles = session.get('user_roles', [])
            if not any(r in user_roles for r in roles):
                abort(403)
            return f(*args, **kwargs)
        return decorated
    return decorator
```

사용 예시:
```python
@jobs_bp.route('/create', methods=['GET', 'POST'])
@login_required
@role_required('PetOwner')
def create():
    ...
```

### 세션 보안 설정 (`config.py`)

```python
SECRET_KEY          = os.environ['SECRET_KEY']   # 강력한 랜덤 키
SESSION_COOKIE_HTTPONLY  = True   # JS 접근 불가
SESSION_COOKIE_SECURE    = True   # HTTPS only (운영)
SESSION_COOKIE_SAMESITE  = 'Lax'
PERMANENT_SESSION_LIFETIME = timedelta(days=7)
```

> **핵심**: JWT는 서버사이드 Flask 세션에만 저장. 쿠키에는 세션 ID만 존재 → XSS로 토큰 탈취 불가.

### CSRF 보호

**Flask-WTF** 또는 수동 구현:
```python
# 수동 CSRF 토큰 생성/검증
def generate_csrf():
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']

def verify_csrf(token):
    return hmac.compare_digest(session.get('csrf_token', ''), token)
```

```html
<!-- Jinja2 템플릿 -->
<input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
```

---

## 6. 핵심 구현 상세

### 6.1 api/client.py (httpx 래퍼)

```python
# ApiClient 메서드 시그니처
get(path, params=None)          → dict
post(path, json=None)           → dict
put(path, json=None)            → dict
delete(path)                    → dict
upload(path, field, file_obj)   → dict  # multipart 업로드
```

httpx 전역 설정:
- `base_url` = `http://localhost:8000`
- `timeout` = `httpx.Timeout(15.0, connect=5.0)`
- 4xx/5xx → `ApiException` 발생

### 6.2 파일 업로드 프록시

```python
# Flask가 브라우저로부터 파일 수신 → httpx로 NestJS에 스트리밍
file = request.files['file']
resp = api.upload('/photos/upload', 'file', file)
# → { photo_id, url } 반환
```

**공고 등록 사진 플로우**: JS AJAX로 선(先) 업로드 → `photo_ids` hidden input 저장 → 본 폼 제출 시 포함

### 6.3 Jinja2 템플릿 상속

```html
<!-- layout/base.html -->
<!DOCTYPE html>
<html>
<head>
  <title>{% block title %}펫시터{% endblock %}</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
  {% block extra_css %}{% endblock %}
</head>
<body>
  {% include 'layout/nav.html' %}
  {% include 'layout/flash.html' %}
  <main>{% block content %}{% endblock %}</main>
  {% block extra_js %}{% endblock %}
</body>
</html>

<!-- jobs/index.html -->
{% extends 'layout/base.html' %}
{% block title %}공고 목록{% endblock %}
{% block content %}
  ...
{% endblock %}
```

### 6.4 플래시 메시지

```python
# 컨트롤러에서
flash('공고가 등록되었습니다.', 'success')
flash('권한이 없습니다.', 'error')

# layout/flash.html에서
{% for category, message in get_flashed_messages(with_categories=True) %}
  <div class="alert alert-{{ category }}">{{ message }}</div>
{% endfor %}
```

### 6.5 공고 등록 — 다중 반려동물

JS로 동적으로 반려동물 섹션 추가/제거. Flask에서 `request.form.getlist` 또는 중첩 키로 파싱:

```python
# request.form 파싱
pets = []
i = 0
while f'pets[{i}][name]' in request.form:
    pets.append({
        'name':    request.form[f'pets[{i}][name]'],
        'age':     int(request.form[f'pets[{i}][age]']),
        'species': request.form[f'pets[{i}][species]'],
        'breed':   request.form[f'pets[{i}][breed]'],
        'size':    request.form.get(f'pets[{i}][size]'),
    })
    i += 1

body = {
    'start_time': request.form['start_time'],  # ISO 8601 변환
    'end_time':   request.form['end_time'],
    'activity':   request.form['activity'],
    'pets':       pets,
    'photo_ids':  request.form.getlist('photo_ids'),
    'address':    request.form.get('address') or None,
    'latitude':   float(request.form['latitude']) if request.form.get('latitude') else None,
    'longitude':  float(request.form['longitude']) if request.form.get('longitude') else None,
    'price':      int(request.form['price']) if request.form.get('price') else None,
    'price_type': request.form.get('price_type') or None,
}
```

### 6.6 채팅 — Socket.io 구조

Flask가 서버사이드로 초기 히스토리를 렌더링 후 `access_token`을 페이지에 주입:

```html
<!-- chat/room.html -->
<script>
const __APP__ = {
    accessToken:      {{ session['access_token'] | tojson }},
    currentUserId:    {{ session['user_id'] | tojson }},
    jobApplicationId: {{ job_application_id | tojson }}
};
</script>
<script src="https://cdn.socket.io/4.x/socket.io.min.js"></script>
<script src="{{ url_for('static', filename='js/chat.js') }}"></script>
```

```js
// static/js/chat.js
const socket = io('ws://localhost:8000/chat', {
    auth: { token: __APP__.accessToken }
});

socket.emit('joinRoom', { jobApplicationId: __APP__.jobApplicationId });

socket.on('joinedRoom', ({ chatRoomId }) => { /* chatRoomId 저장 */ });
socket.on('receiveMessage', (msg) => { /* 말풍선 DOM 추가 */ });
socket.on('messagesRead', ({ userId }) => { /* 읽음 표시 */ });
socket.on('newMessageNotification', ({ chatRoomId, message }) => { /* 뱃지 갱신 */ });

document.querySelector('#send').addEventListener('click', () => {
    socket.emit('sendMessage', { chatRoomId, content });
});
```

채팅방 진입 시: Flask가 `GET /chat-rooms/{id}/messages?limit=30`으로 히스토리 서버사이드 렌더링 → 이후 신규 메시지는 Socket.io JS가 추가.

---

## 7. 페이지별 API 호출 목록

| 페이지 | API 호출 |
|---|---|
| 로그인 | `POST /sessions` → `GET /users/:id` |
| 회원가입 | `POST /users` → `POST /sessions` |
| 공고 목록 | `GET /jobs?page&limit&filters...` |
| 공고 상세 | `GET /jobs/:id`, `GET /favorites` (PetSitter) |
| 공고 등록 | `POST /photos/upload` (선업로드), `POST /jobs` |
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

## 8. 에러 처리 전략

```python
# ApiException 처리
try:
    job = api.get(f'/jobs/{id}')
except ApiException as e:
    if e.status_code == 400:
        flash(e.message, 'error')
        return redirect(request.referrer)
    elif e.status_code == 403:
        abort(403)
    elif e.status_code == 404:
        abort(404)
    elif e.status_code == 409:
        flash('이미 지원한 공고입니다.', 'error')
        return redirect(url_for('jobs.show', id=id))
    else:
        abort(500)

# 전역 에러 핸들러 (create_app에 등록)
@app.errorhandler(403)
def handle_403(e): return render_template('errors/403.html'), 403

@app.errorhandler(404)
def handle_404(e): return render_template('errors/404.html'), 404

@app.errorhandler(500)
def handle_500(e): return render_template('errors/500.html'), 500
```

---

## 9. 보안 체크리스트

| 위협 | 대응 |
|---|---|
| XSS | Jinja2 자동 이스케이프 (`autoescape=True`), CSP 헤더 |
| CSRF | 모든 POST 폼에 CSRF 토큰 (`secrets.token_hex`) |
| JWT 탈취 | Flask 서버사이드 세션 보관, JS 접근 불가 httponly 쿠키 |
| 세션 고정 | 로그인 시 `session.clear()` 후 재생성 |
| 파일 업로드 악용 | MIME + 크기 검증 후 NestJS로 프록시 |
| SQL 인젝션 | 직접 DB 없음 — 모든 데이터는 NestJS API 경유 |
| IDOR | API에서 소유권 검증, Flask는 버튼 렌더링 전 역할 확인 |

---

## 10. requirements.txt

```
flask>=3.0
httpx>=0.27
python-dotenv>=1.0
flask-session>=0.8      # 서버사이드 세션 (선택)
```

---

## 11. 구현 순서

1. **스켈레톤** — `run.py`, `app/__init__.py`, `config.py`, Blueprint 등록
2. **API 클라이언트** — `api/client.py`, `api/exceptions.py`
3. **인증 데코레이터** — `auth/helpers.py` (`login_required`, `role_required`)
4. **인증** — `blueprints/auth.py` + `templates/auth/` (로그인/회원가입/로그아웃)
5. **공고 목록/상세** — 가장 핵심 기능
6. **공고 CRUD** + 사진 업로드 플로우
7. **지원 관리** — 지원/승인/거절
8. **프로필** + 프로필 사진 업로드
9. **리뷰** 작성/삭제
10. **즐겨찾기** 토글/목록
11. **채팅** — Socket.io (가장 복잡, 마지막)
12. **관리자** 페이지

---

## 12. PHP 플랜과의 주요 차이점

| 항목 | PHP | Flask |
|---|---|---|
| 라우터 | 직접 구현 (`Router.php`) | Blueprint + Flask 라우팅 내장 |
| 템플릿 | Native PHP (`<?= ?>`) | Jinja2 (`{{ }}`, `{% %}`) |
| 데코레이터 | 없음 (컨트롤러 내 수동 체크) | `@login_required`, `@role_required` |
| 에러 핸들러 | 전역 try/catch | `@app.errorhandler(코드)` |
| 자동 이스케이프 | 수동 `htmlspecialchars()` | Jinja2 자동 (`autoescape=True`) |
| 패키지 관리 | Composer | pip + requirements.txt |
| HTTP 클라이언트 | Guzzle | httpx |

---

## 13. 참고 서버 파일

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
