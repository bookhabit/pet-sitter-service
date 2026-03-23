# JSP 펫시터 웹 구축 플랜

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| Java 버전 | **Java 21** (LTS) | Records, 패턴 매칭, 가상 스레드 |
| 서블릿 컨테이너 | **Apache Tomcat 10.x** | Jakarta EE 10 기준, 표준 JSP 런타임 |
| 템플릿 | **JSP + JSTL 3.x** | 서블릿 표준, EL 표현식, 태그 라이브러리 |
| HTTP 클라이언트 | **Java 11+ HttpClient** (내장) | 외부 의존성 없이 API 호출 |
| JSON 파싱 | **Jackson 2.x** | Java 표준 JSON 라이브러리 |
| 빌드 도구 | **Maven** | WAR 패키징, 의존성 관리 |
| 세션 | **HttpSession** | 서버사이드 세션으로 JWT 보관 |
| 환경 변수 | `context.xml` or `.env` properties | Tomcat 컨텍스트 파라미터 |
| WebSocket | **Socket.io JS 클라이언트** (CDN) | Java에서 Socket.io 클라이언트 불가 → 브라우저 JS 담당 |
| 에셋 | Plain CSS + Vanilla JS | 빌드 툴 불필요 |

---

## 2. 프로젝트 구조

```
pet-sitter-jsp/
├── pom.xml                           ← Maven 빌드 설정
│
└── src/
    └── main/
        ├── java/
        │   └── com/petsitter/
        │       │
        │       ├── api/
        │       │   ├── ApiClient.java        ← HttpClient 래퍼 (모든 API 호출)
        │       │   ├── TokenRefresher.java   ← 401 시 자동 토큰 갱신
        │       │   └── ApiException.java     ← 상태코드별 예외
        │       │
        │       ├── auth/
        │       │   └── AuthFilter.java       ← 인증 필터 (서블릿 Filter)
        │       │
        │       ├── servlets/
        │       │   ├── auth/
        │       │   │   ├── LoginServlet.java
        │       │   │   ├── RegisterServlet.java
        │       │   │   └── LogoutServlet.java
        │       │   ├── jobs/
        │       │   │   ├── JobListServlet.java
        │       │   │   ├── JobDetailServlet.java
        │       │   │   ├── JobCreateServlet.java
        │       │   │   ├── JobEditServlet.java
        │       │   │   └── JobDeleteServlet.java
        │       │   ├── applications/
        │       │   │   ├── ApplicationListServlet.java
        │       │   │   ├── ApplicationCreateServlet.java
        │       │   │   └── ApplicationUpdateServlet.java
        │       │   ├── profile/
        │       │   │   ├── ProfileServlet.java
        │       │   │   └── UserProfileServlet.java
        │       │   ├── reviews/
        │       │   │   ├── ReviewCreateServlet.java
        │       │   │   ├── ReviewDeleteServlet.java
        │       │   │   └── UserReviewsServlet.java
        │       │   ├── favorites/
        │       │   │   ├── FavoriteListServlet.java
        │       │   │   └── FavoriteToggleServlet.java
        │       │   ├── chat/
        │       │   │   ├── ChatListServlet.java
        │       │   │   └── ChatRoomServlet.java
        │       │   └── admin/
        │       │       └── AdminDashboardServlet.java
        │       │
        │       ├── dto/
        │       │   ├── UserDto.java
        │       │   ├── JobDto.java
        │       │   ├── PetDto.java
        │       │   ├── JobApplicationDto.java
        │       │   ├── PhotoDto.java
        │       │   ├── ReviewDto.java
        │       │   ├── ChatRoomDto.java
        │       │   ├── MessageDto.java
        │       │   └── FavoriteDto.java
        │       │
        │       └── util/
        │           ├── SessionUtil.java      ← 세션 헬퍼
        │           ├── CsrfUtil.java         ← CSRF 토큰 생성/검증
        │           ├── DateUtil.java         ← ISO 8601 ↔ 한국 날짜 포맷
        │           └── PriceUtil.java        ← ₩ 포맷
        │
        ├── webapp/
        │   ├── WEB-INF/
        │   │   ├── web.xml                   ← 서블릿/필터 매핑
        │   │   └── views/
        │   │       ├── layout/
        │   │       │   ├── base.jsp          ← 공통 레이아웃 (include용)
        │   │       │   ├── nav.jsp           ← 역할별 네비게이션
        │   │       │   └── flash.jsp         ← 플래시 메시지
        │   │       ├── auth/
        │   │       │   ├── login.jsp
        │   │       │   └── register.jsp
        │   │       ├── jobs/
        │   │       │   ├── index.jsp         ← 공고 목록 (필터/페이징)
        │   │       │   ├── show.jsp          ← 공고 상세
        │   │       │   ├── create.jsp        ← 공고 등록 폼
        │   │       │   └── edit.jsp          ← 공고 수정 폼
        │   │       ├── applications/
        │   │       │   └── index.jsp         ← 지원자 목록 (PetOwner)
        │   │       ├── profile/
        │   │       │   ├── show.jsp
        │   │       │   └── edit.jsp
        │   │       ├── favorites/
        │   │       │   └── index.jsp
        │   │       ├── chat/
        │   │       │   ├── index.jsp         ← 채팅방 목록
        │   │       │   └── room.jsp          ← 실시간 채팅
        │   │       ├── reviews/
        │   │       │   └── user.jsp          ← 받은 리뷰 목록
        │   │       ├── admin/
        │   │       │   └── dashboard.jsp
        │   │       └── errors/
        │   │           ├── 403.jsp
        │   │           ├── 404.jsp
        │   │           └── 500.jsp
        │   │
        │   └── static/
        │       ├── css/
        │       │   ├── main.css
        │       │   └── chat.css
        │       └── js/
        │           ├── chat.js               ← Socket.io 로직
        │           ├── photo-preview.js
        │           └── job-filter.js
        │
        └── resources/
            └── app.properties                ← API_BASE_URL 등
```

---

## 3. pom.xml 주요 의존성

```xml
<!-- Jakarta Servlet + JSP + JSTL -->
<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>6.0.0</version>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>jakarta.servlet.jsp</groupId>
    <artifactId>jakarta.servlet.jsp-api</artifactId>
    <version>3.1.0</version>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>jakarta.servlet.jsp.jstl</groupId>
    <artifactId>jakarta.servlet.jsp.jstl-api</artifactId>
    <version>3.0.0</version>
</dependency>
<dependency>
    <groupId>org.glassfish.web</groupId>
    <artifactId>jakarta.servlet.jsp.jstl</artifactId>
    <version>3.0.1</version>
</dependency>

<!-- JSON -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version>
</dependency>
```

> Java 11+ `HttpClient`는 JDK 내장 → 별도 HTTP 라이브러리 의존성 없음.

---

## 4. 전체 URL 매핑 (web.xml)

```
GET/POST /login                   → LoginServlet
GET/POST /register                → RegisterServlet
POST     /logout                  → LogoutServlet

GET  /jobs                        → JobListServlet       (필터/페이징/검색)
GET  /jobs/create                 → JobCreateServlet     (PetOwner)
POST /jobs/create                 → JobCreateServlet
GET  /jobs/{id}                   → JobDetailServlet
GET  /jobs/{id}/edit              → JobEditServlet       (PetOwner/Admin)
POST /jobs/{id}/edit              → JobEditServlet
POST /jobs/{id}/delete            → JobDeleteServlet
POST /jobs/{id}/apply             → ApplicationCreateServlet  (PetSitter)
GET  /jobs/{id}/applications      → ApplicationListServlet    (PetOwner)
POST /jobs/{jobId}/reviews        → ReviewCreateServlet

POST /job-applications/{id}       → ApplicationUpdateServlet  (승인/거절)

GET/POST /profile                 → ProfileServlet
POST     /profile/photo           → ProfileServlet (action=uploadPhoto)
POST     /profile/delete          → ProfileServlet (action=delete)
GET  /users/{id}                  → UserProfileServlet         (공개 프로필)
GET  /users/{id}/reviews          → UserReviewsServlet

POST /reviews/{id}/delete         → ReviewDeleteServlet

GET  /favorites                   → FavoriteListServlet        (PetSitter)
POST /favorites                   → FavoriteToggleServlet

GET  /chat                        → ChatListServlet
GET  /chat/{roomId}               → ChatRoomServlet

GET  /admin                       → AdminDashboardServlet
```

> HTML 폼은 GET/POST만 지원하므로 수정/삭제는 POST + 경로 규칙(`/edit`, `/delete`)으로 처리.

---

## 5. 서블릿 패턴

모든 서블릿은 `HttpServlet`을 상속하고 `doGet` / `doPost`를 오버라이드:

```java
// 개념적 구조 (실제 코드 아님)
@WebServlet("/jobs/create")
public class JobCreateServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        AuthFilter.requireLogin(req, resp);         // 미인증 → /login 리다이렉트
        AuthFilter.requireRole(req, resp, "PetOwner");
        req.getRequestDispatcher("/WEB-INF/views/jobs/create.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        AuthFilter.requireLogin(req, resp);
        CsrfUtil.verify(req);                       // CSRF 검증

        ApiClient api = new ApiClient(req.getSession());
        // 폼 데이터 파싱 → Map 구성 → api.post("/jobs", body)
        // 성공 → redirect("/jobs/{id}")
        // 실패 → flash 에러 + redirect back
    }
}
```

---

## 6. 인증 플로우 (JWT + HttpSession)

### 로그인 시퀀스

```java
// POST /login
// 1. API: POST /sessions → { access_token, refresh_token }
// 2. API: GET /users/:id → { full_name, roles, photos }
// 3. HttpSession에 저장
HttpSession session = req.getSession(true);
session.setAttribute("access_token",  accessToken);
session.setAttribute("refresh_token", refreshToken);
session.setAttribute("user_id",       userId);
session.setAttribute("user_roles",    roles);    // List<String>
session.setAttribute("user_name",     fullName);
// 4. resp.sendRedirect("/jobs")
```

### 자동 토큰 갱신 (`ApiClient.java`)

```java
// 모든 API 요청 흐름
public Object request(String method, String path, Object body) {
    String token = (String) session.getAttribute("access_token");
    HttpRequest httpReq = buildRequest(method, path, body, token);
    HttpResponse<String> resp = httpClient.send(httpReq, ...);

    if (resp.statusCode() == 401) {
        String newToken = tokenRefresher.refresh(session);
        if (newToken != null) {
            httpReq = buildRequest(method, path, body, newToken);
            resp = httpClient.send(httpReq, ...);
        } else {
            session.invalidate();
            throw new RedirectException("/login");
        }
    }

    if (resp.statusCode() >= 400) {
        throw new ApiException(resp.statusCode(), resp.body());
    }

    return objectMapper.readValue(resp.body(), Object.class);
}
```

### 인증 필터 (`AuthFilter.java`)

Jakarta Servlet Filter로 구현 — 인증이 필요한 URL 패턴에 일괄 적용:

```java
@WebFilter(urlPatterns = {"/jobs/create", "/profile/*", "/favorites/*", "/chat/*", "/admin/*"})
public class AuthFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) {
        HttpSession session = ((HttpServletRequest) req).getSession(false);
        if (session == null || session.getAttribute("access_token") == null) {
            ((HttpServletResponse) resp).sendRedirect("/login");
            return;
        }
        chain.doFilter(req, resp);
    }
}
```

역할 체크는 각 서블릿 내에서 `SessionUtil.hasRole(session, "PetOwner")`로 수행.

### 세션 보안 설정 (`web.xml`)

```xml
<session-config>
  <session-timeout>60</session-timeout>
  <cookie-config>
    <http-only>true</http-only>
    <secure>true</secure>       <!-- HTTPS only (운영) -->
  </cookie-config>
  <tracking-mode>COOKIE</tracking-mode>
</session-config>
```

> **핵심**: JWT는 서버사이드 `HttpSession`에만 저장. 쿠키에는 JSESSIONID만 존재 → XSS로 토큰 탈취 불가.

### CSRF 보호 (`CsrfUtil.java`)

```java
// 토큰 생성 (세션에 저장)
public static String generate(HttpSession session) {
    String token = UUID.randomUUID().toString();
    session.setAttribute("csrf_token", token);
    return token;
}

// 검증
public static void verify(HttpServletRequest req) {
    String sessionToken = (String) req.getSession().getAttribute("csrf_token");
    String formToken    = req.getParameter("csrf_token");
    if (!MessageDigest.isEqual(sessionToken.getBytes(), formToken.getBytes())) {
        throw new SecurityException("CSRF token mismatch");
    }
}
```

```html
<!-- JSP 폼 -->
<input type="hidden" name="csrf_token" value="${csrfToken}">
```

---

## 7. JSP 레이아웃 패턴

JSP는 템플릿 상속이 없으므로 `jsp:include` + 공통 헤더/푸터 방식 사용:

```jsp
<%-- WEB-INF/views/jobs/index.jsp --%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>

<jsp:include page="/WEB-INF/views/layout/base.jsp">
    <jsp:param name="title" value="공고 목록"/>
</jsp:include>

<jsp:include page="/WEB-INF/views/layout/flash.jsp"/>

<main>
    <%-- 공고 목록 콘텐츠 --%>
    <c:forEach var="job" items="${jobs}">
        <div class="job-card">
            <h3>${job.activity}</h3>
            <p>₩<fmt:formatNumber value="${job.price}"/></p>
        </div>
    </c:forEach>
</main>

<jsp:include page="/WEB-INF/views/layout/footer.jsp"/>
```

JSTL 주요 태그:
- `<c:forEach>` — 반복
- `<c:if>`, `<c:choose>` — 조건
- `<c:url>` — URL 생성
- `<fmt:formatDate>`, `<fmt:formatNumber>` — 날짜/숫자 포맷
- `<c:out>` — XSS 방어 출력 (EL은 기본 이스케이프)

---

## 8. DTO 클래스 패턴 (Java Records)

Java 21 Record로 불변 DTO 정의:

```java
// JobDto.java
public record JobDto(
    String id,
    String activity,
    String startTime,
    String endTime,
    String address,
    Double latitude,
    Double longitude,
    Integer price,
    String priceType,
    String creatorUserId,
    List<PetDto> pets,
    List<PhotoDto> photos
) {}

// PetDto.java
public record PetDto(
    String id,
    String name,
    int age,
    String species,
    String breed,
    String size
) {}
```

Jackson의 `ObjectMapper`로 API 응답 JSON → DTO 역직렬화:

```java
JobDto job = objectMapper.readValue(responseBody, JobDto.class);
```

---

## 9. 핵심 구현 상세

### 9.1 ApiClient.java

```java
// 메서드 시그니처 (개념)
public <T> T get(String path, Map<String, String> params, Class<T> type)
public <T> T post(String path, Object body, Class<T> type)
public <T> T put(String path, Object body, Class<T> type)
public void delete(String path)
public <T> T upload(String path, String fieldName, InputStream file, String filename, Class<T> type)
```

### 9.2 파일 업로드 프록시

```java
// multipart/form-data 파싱 (Jakarta Servlet 6.0 내장)
Part filePart = req.getPart("file");
InputStream fileStream = filePart.getInputStream();

// HttpClient multipart 빌더로 NestJS에 스트리밍
// → POST /photos/upload → { photo_id, url } 반환
```

**공고 등록 사진 플로우**: JS AJAX로 선(先) 업로드 → `photo_ids` hidden input 저장 → 본 폼 제출 시 포함

### 9.3 공고 등록 — 다중 반려동물

서블릿에서 인덱스 기반 파라미터 파싱:

```java
List<Map<String, Object>> pets = new ArrayList<>();
int i = 0;
while (req.getParameter("pets[" + i + "][name]") != null) {
    Map<String, Object> pet = new HashMap<>();
    pet.put("name",    req.getParameter("pets[" + i + "][name]"));
    pet.put("age",     Integer.parseInt(req.getParameter("pets[" + i + "][age]")));
    pet.put("species", req.getParameter("pets[" + i + "][species]"));
    pet.put("breed",   req.getParameter("pets[" + i + "][breed]"));
    pet.put("size",    req.getParameter("pets[" + i + "][size]"));
    pets.add(pet);
    i++;
}

Map<String, Object> body = new HashMap<>();
body.put("start_time", req.getParameter("start_time"));
body.put("end_time",   req.getParameter("end_time"));
body.put("activity",   req.getParameter("activity"));
body.put("pets",       pets);
body.put("photo_ids",  Arrays.asList(req.getParameterValues("photo_ids")));
// 선택 필드 null 처리
String address = req.getParameter("address");
if (address != null && !address.isBlank()) body.put("address", address);
```

### 9.4 채팅 — Socket.io 구조

JSP가 서버사이드로 초기 히스토리를 렌더링 후 `access_token`을 페이지에 주입:

```jsp
<%-- chat/room.jsp --%>
<script>
const __APP__ = {
    accessToken:      ${sessionScope.access_token != null ?
                        '"'.concat(sessionScope.access_token).concat('"') : 'null'},
    currentUserId:    "${sessionScope.user_id}",
    jobApplicationId: "${jobApplicationId}"
};
</script>
<script src="https://cdn.socket.io/4.x/socket.io.min.js"></script>
<script src="${pageContext.request.contextPath}/static/js/chat.js"></script>
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

채팅방 진입 시: 서블릿이 `GET /chat-rooms/{id}/messages?limit=30`으로 히스토리를 DTO로 변환해 request attribute에 담아 JSP에 전달 → 이후 신규 메시지는 Socket.io JS가 추가.

### 9.5 서블릿에서 JSP로 데이터 전달

```java
// 서블릿
List<JobDto> jobs = api.get("/jobs", params, JobListResponse.class).getData();
req.setAttribute("jobs", jobs);
req.setAttribute("csrfToken", CsrfUtil.generate(req.getSession()));
req.getRequestDispatcher("/WEB-INF/views/jobs/index.jsp").forward(req, resp);
```

```jsp
<%-- JSP에서 EL로 접근 --%>
<c:forEach var="job" items="${jobs}">
    <p>${job.activity}</p>
</c:forEach>
```

### 9.6 플래시 메시지

```java
// 서블릿 (리다이렉트 전)
req.getSession().setAttribute("flash_message", "공고가 등록되었습니다.");
req.getSession().setAttribute("flash_type", "success");
resp.sendRedirect("/jobs/" + jobId);

// 다음 요청 서블릿 (또는 필터)에서 request attribute로 옮기고 세션에서 제거
String msg = (String) session.getAttribute("flash_message");
if (msg != null) {
    req.setAttribute("flash_message", msg);
    req.setAttribute("flash_type", session.getAttribute("flash_type"));
    session.removeAttribute("flash_message");
    session.removeAttribute("flash_type");
}
```

```jsp
<%-- layout/flash.jsp --%>
<c:if test="${not empty flash_message}">
    <div class="alert alert-${flash_type}">${flash_message}</div>
</c:if>
```

---

## 10. 페이지별 API 호출 목록

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

## 11. 에러 처리 전략

```java
// 서블릿 내 ApiException 처리
try {
    JobDto job = api.get("/jobs/" + id, null, JobDto.class);
    req.setAttribute("job", job);
    req.getRequestDispatcher("/WEB-INF/views/jobs/show.jsp").forward(req, resp);

} catch (ApiException e) {
    switch (e.getStatusCode()) {
        case 400 -> {
            req.getSession().setAttribute("flash_message", e.getMessage());
            req.getSession().setAttribute("flash_type", "error");
            resp.sendRedirect(req.getHeader("Referer"));
        }
        case 403 -> req.getRequestDispatcher("/WEB-INF/views/errors/403.jsp").forward(req, resp);
        case 404 -> req.getRequestDispatcher("/WEB-INF/views/errors/404.jsp").forward(req, resp);
        case 409 -> {
            req.getSession().setAttribute("flash_message", "이미 지원한 공고입니다.");
            resp.sendRedirect("/jobs/" + id);
        }
        default  -> req.getRequestDispatcher("/WEB-INF/views/errors/500.jsp").forward(req, resp);
    }
}
```

전역 에러 페이지는 `web.xml`에 등록:

```xml
<error-page>
    <error-code>403</error-code>
    <location>/WEB-INF/views/errors/403.jsp</location>
</error-page>
<error-page>
    <error-code>404</error-code>
    <location>/WEB-INF/views/errors/404.jsp</location>
</error-page>
<error-page>
    <error-code>500</error-code>
    <location>/WEB-INF/views/errors/500.jsp</location>
</error-page>
```

---

## 12. 보안 체크리스트

| 위협 | 대응 |
|---|---|
| XSS | JSTL `<c:out>` 또는 EL 자동 이스케이프, CSP 헤더 |
| CSRF | 모든 POST 폼에 CSRF 토큰 (`UUID.randomUUID()`) |
| JWT 탈취 | 서버사이드 `HttpSession` 보관, httponly 쿠키로 JSESSIONID만 노출 |
| 세션 고정 | 로그인 시 `session.invalidate()` 후 새 세션 생성 |
| 파일 업로드 악용 | MIME + 크기 검증 후 NestJS로 프록시 |
| SQL 인젝션 | 직접 DB 없음 — 모든 데이터는 NestJS API 경유 |
| IDOR | API에서 소유권 검증, 서블릿에서 역할 확인 후 JSP 분기 |
| Path Traversal | `req.getPathInfo()` 사용 시 정규화 검증 |

---

## 13. 구현 순서

1. **Maven 프로젝트 셋업** — `pom.xml`, Tomcat 연동, 폴더 구조 생성
2. **API 클라이언트** — `ApiClient.java`, `TokenRefresher.java`, `ApiException.java`
3. **유틸리티** — `SessionUtil`, `CsrfUtil`, `DateUtil`, DTO Record 클래스
4. **인증 필터** — `AuthFilter.java` + `web.xml` 매핑
5. **인증 서블릿** — 로그인/회원가입/로그아웃 + JSP
6. **공고 목록/상세** — 가장 핵심 기능
7. **공고 CRUD** + 사진 업로드 플로우
8. **지원 관리** — 지원/승인/거절
9. **프로필** + 프로필 사진 업로드
10. **리뷰** 작성/삭제
11. **즐겨찾기** 토글/목록
12. **채팅** — Socket.io (가장 복잡, 마지막)
13. **관리자** 페이지

---

## 14. PHP / Flask / JSP 비교

| 항목 | PHP | Flask | JSP |
|---|---|---|---|
| 언어 | PHP 8.2 | Python 3.12 | Java 21 |
| 라우팅 | 커스텀 `Router.php` | Blueprint 내장 라우팅 | `web.xml` + `@WebServlet` |
| 템플릿 | Native PHP | Jinja2 (상속 가능) | JSP + JSTL (include 방식) |
| 인증 미들웨어 | 없음 (컨트롤러 내 수동) | `@login_required` 데코레이터 | `Filter` (서블릿 필터 체인) |
| 세션 | `$_SESSION` | `flask.session` | `HttpSession` |
| HTTP 클라이언트 | Guzzle | httpx | Java 내장 `HttpClient` |
| JSON | 내장 `json_encode/decode` | 내장 `json` 모듈 | Jackson `ObjectMapper` |
| 타입 안전성 | 없음 | 타입힌트 (선택) | 강타입 (DTO Records) |
| 에러 핸들러 | 전역 try/catch | `@app.errorhandler` | `web.xml` error-page |
| 빌드 도구 | Composer | pip | Maven |
| 패키징 | 파일 직접 배포 | WSGI 서버 | WAR → Tomcat |

---

## 15. 참고 서버 파일

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
