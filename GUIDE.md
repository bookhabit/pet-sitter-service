# 펫시터 프로젝트 — 개발 가이드라인

> 하나의 서비스를 **모든 기술 스택**으로 구현하며 웹/앱/서버 개발의 동작 원리를 체득한다.
> 단순히 코드를 생성하는 것이 아니라, **각 기술이 왜 이렇게 동작하는지**를 이해하는 것이 목표다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [핵심 개발 철학](#2-핵심-개발-철학)
3. [전체 기술 스택 지도](#3-전체-기술-스택-지도)
4. [공통 참고 문서](#4-공통-참고-문서)
5. [단계별 개발 방식 (Phase)](#5-단계별-개발-방식-phase)
6. [각 기술 스택 구축 순서](#6-각-기술-스택-구축-순서)
7. [학습 포인트 — 기술별 핵심 개념](#7-학습-포인트--기술별-핵심-개념)
8. [AI 협업 규칙](#8-ai-협업-규칙)
9. [일관성 유지 체크리스트](#9-일관성-유지-체크리스트)

---

## 1. 프로젝트 개요

### 무엇을 만드는가

**펫시터 매칭 플랫폼** — 반려동물 주인(PetOwner)이 구인글을 올리고, 펫시터(PetSitter)가 지원하여 매칭되는 서비스.

### 왜 여러 기술 스택으로 만드는가

| 목적          | 설명                                                                         |
| ------------- | ---------------------------------------------------------------------------- |
| **비교 학습** | 같은 기능을 다른 방식으로 구현하며 각 기술의 철학과 장단점을 체감            |
| **패턴 이해** | MVC, MVVM, 레이어드 아키텍처가 각 언어/프레임워크에서 어떻게 표현되는지 확인 |
| **실무 감각** | 하나의 기능을 다양한 맥락에서 구현하면 어떤 기술을 쓰든 설계 능력이 이전됨   |

### 단 하나의 진실 원천 (SSOT)

```
모든 비즈니스 로직과 API 명세의 기준 = pet-sitter-server/ (NestJS)
모든 요구사항의 기준               = REQUIREMENTS.md
모든 설계 원칙의 기준              = STANDARDS.md
```

새 기술 스택으로 구현할 때 "이게 맞나?" 싶으면 항상 NestJS 서버와 REQUIREMENTS.md를 먼저 확인한다.

---

## 2. 핵심 개발 철학

### 원칙 1: 이해 우선 (Understanding First)

코드를 복사·붙여넣기하는 것이 아니라, **왜 이렇게 동작하는지**를 먼저 이해한다.

```
❌ "코드가 돌아가면 됐어"
✅ "이 코드가 왜 이렇게 동작하는지 설명할 수 있다"
```

### 원칙 2: 점진적 구축 (Step-by-Step)

기능 하나를 완전히 이해하고 테스트한 뒤 다음으로 넘어간다.

```
환경 세팅 → 아키텍처 수립 → 예시 페이지 → 기능 단위 구현 (1개씩)
```

한 단계가 끝날 때마다 **직접 로컬에서 실행하고 확인**한다.

### 원칙 3: 일관성 유지 (Consistency)

기술은 달라도 **설계 원칙은 같다.** STANDARDS.md의 규칙은 모든 기술 스택에 동일하게 적용된다.

```
React의 usePetSitterList() ↔ Flutter의 PetSitterNotifier ↔ Android의 PetSitterViewModel
→ 이름은 달라도 역할과 책임은 동일하다
```

### 원칙 4: 실무 수준 코드 (Production Quality)

학습 프로젝트지만 아래 항목은 타협하지 않는다.

- 에러 처리 (Loading / Error / Empty 상태 필수)
- 타입 안정성 (any 금지, null 방어)
- 보안 (토큰 안전 저장, 입력값 검증)
- 관심사 분리 (View ↔ Logic ↔ Service 분리)

---

## 3. 전체 기술 스택 지도

```
pet-sitter-server/                    ← NestJS (기준 서버, 이미 완성)
│
├── [대안 서버]
│   ├── pet-sitter-go-server/         ← Go + Gin
│   └── pet-sitter-spring-server/     ← Spring Boot 3 + Java 21
│
├── [웹 클라이언트 — SPA]
│   └── pet-sitter-clients/web/
│       ├── react-rest/               ← React + REST (기준 클라이언트, 이미 완성)
│       ├── react-graphql/            ← React + GraphQL
│       ├── nextjs-rest/              ← Next.js + REST
│       └── nextjs-graphql/           ← Next.js + GraphQL
│
├── [웹 클라이언트 — 서버사이드]
│   ├── pet-sitter-php/               ← PHP 8.2 (순수 PHP)
│   ├── pet-sitter-flask/             ← Python + Flask
│   └── pet-sitter-jsp/               ← Java + JSP + Tomcat
│
└── [모바일 클라이언트]
    └── pet-sitter-clients/mobile/
        ├── expo/                     ← Expo (React Native + TypeScript)
        ├── flutter/                  ← Flutter + Dart
        ├── android/                  ← Android + Jetpack Compose + Kotlin
        └── ios/                      ← iOS + SwiftUI + Swift
```

### 각 스택의 위치

| 카테고리          | 기준 구현체         | 학습 대상                       |
| ----------------- | ------------------- | ------------------------------- |
| 서버              | NestJS (완성)       | Go, Spring Boot                 |
| 웹 SPA 클라이언트 | React + REST (완성) | React GraphQL, Next.js, Vanilla |
| 서버사이드 웹     | —                   | PHP, Flask, JSP                 |
| 모바일            | —                   | Expo, Flutter, Android, iOS     |

---

## 4. 공통 참고 문서

새 기술 스택 구현을 시작하기 전에 반드시 읽는다.

| 문서                | 위치                                      | 용도                                                     |
| ------------------- | ----------------------------------------- | -------------------------------------------------------- |
| **REQUIREMENTS.md** | `/REQUIREMENTS.md`                        | 전체 요구사항, 도메인 모델, API 엔드포인트 목록          |
| **STANDARDS.md**    | `/STANDARDS.md`                           | 기술 독립적 설계 원칙 (SRP, 에러 처리, 디자인 시스템 등) |
| **NestJS 레퍼런스** | `/pet-sitter-server/`                     | API 구현 방식, JWT 흐름, Socket.IO 채팅, DTO 구조        |
| **DB 스키마**       | `/pet-sitter-server/prisma/schema.prisma` | 테이블 구조, 유니크 제약, Enum 정의                      |
| **React 레퍼런스**  | `/pet-sitter-clients/web/react-rest/`     | SRP 아키텍처, API 컨벤션, 에러 처리 패턴                 |
| **각 스택 PLAN.md** | `{프로젝트}/PLAN.md`                      | 해당 기술 스택의 상세 구현 계획                          |

---

## 5. 단계별 개발 방식 (Phase)

모든 기술 스택은 아래 순서를 따른다. **단계를 건너뛰지 않는다.**

### Phase 0: 환경 세팅 & 아키텍처 수립

```
1. 개발 환경 설치 (런타임, 패키지 매니저, IDE 플러그인)
2. 프로젝트 생성 + 폴더 구조 확정
3. Linter / Formatter 설정 (코드 스타일 자동화)
4. 환경변수 설정 (.env, API_BASE_URL 등)
5. 기본 라우팅 / 네비게이션 연결
6. "Hello World" 수준의 예시 페이지로 구조 검증
```

**이 단계의 목표**: 빈 화면이라도 앱이 실행되고 라우팅이 동작하는 것을 확인한다.

### Phase 1: 인증 (Auth)

```
1. 회원가입 화면 + POST /users
2. 로그인 화면 + POST /sessions → Access Token / Refresh Token 저장
3. 토큰 자동 갱신 (401 → POST /sessions/refresh → 재시도)
4. 로그아웃 + DELETE /sessions
5. 인증 상태에 따른 화면 분기 (로그인/비로그인)
```

**이 단계의 목표**: JWT 흐름 전체를 직접 구현하며 토큰 라이프사이클을 이해한다.

### Phase 2: 구인글 (Jobs)

```
1. 구인글 목록 GET /jobs (커서 기반 페이지네이션 + 무한 스크롤)
2. 구인글 상세 GET /jobs/:id
3. 구인글 작성 POST /jobs (PetOwner 전용)
4. 구인글 수정 PATCH /jobs/:id
5. 구인글 삭제 DELETE /jobs/:id
```

**이 단계의 목표**: CRUD + 커서 페이지네이션 패턴을 익힌다.

### Phase 3: 지원 (Applications)

```
1. 지원 목록 GET /jobs/:id/applications
2. 지원하기 POST /jobs/:id/applications (PetSitter 전용)
3. 지원 승인/거절 PATCH /applications/:id (PetOwner 전용)
```

**이 단계의 목표**: 역할(Role) 기반 접근 제어 흐름을 이해한다.

### Phase 4: 사진 업로드 (Photos)

```
1. 사진 선택 (파일 피커 / 카메라)
2. MIME 타입 + 5MB 크기 검증 (클라이언트 측)
3. Pre-upload: POST /photos/upload → photo_ids 수신
4. 메인 요청에 photo_ids 포함하여 전송
```

**이 단계의 목표**: Pre-upload 패턴과 파일 처리 방식을 이해한다.

### Phase 5: 리뷰 (Reviews)

```
1. 리뷰 작성 POST /reviews (job_application_id 기반)
2. 사용자 리뷰 목록 GET /reviews/user/:userId
```

**이 단계의 목표**: 양방향 리뷰 로직과 서버 사이드 비즈니스 규칙을 이해한다.

### Phase 6: 채팅 (Chat)

```
1. 채팅방 목록 GET /chat/rooms
2. 메시지 목록 GET /chat/rooms/:id/messages
3. WebSocket 연결 (JWT 인증)
4. 실시간 메시지 송수신
5. 읽음 처리 + 새 메시지 알림
```

**이 단계의 목표**: WebSocket 프로토콜과 실시간 통신 패턴을 이해한다.

> 주의: NestJS/Go 서버는 **Socket.IO**, Spring Boot 서버는 **STOMP** 프로토콜을 사용한다.
> 서버에 맞는 클라이언트 라이브러리를 사용해야 한다.

### Phase 7: 즐겨찾기 (Favorites)

```
1. 즐겨찾기 토글 POST /favorites → { added: boolean }
2. 즐겨찾기 목록 GET /favorites
```

**이 단계의 목표**: 토글 패턴과 낙관적 업데이트(Optimistic Update)를 이해한다.

---

## 6. 각 기술 스택 구축 순서

### 서버 (Backend)

#### NestJS — 기준 서버 (이미 완성)

참고: `pet-sitter-server/`

- TypeScript, Prisma ORM, PostgreSQL, JWT, Socket.IO

#### Go + Gin

참고: `pet-sitter-go-server/PLAN.md`

- 학습 포인트: Go의 명시적 에러 반환, goroutine, 단일 바이너리 빌드
- NestJS 대비: 의존성 주입 없음 → 직접 구조체 조합

#### Spring Boot 3

참고: `pet-sitter-spring-server/PLAN.md`

- 학습 포인트: Spring IoC/DI 컨테이너, JPA 연관관계, Flyway 마이그레이션
- NestJS 대비: STOMP WebSocket (Socket.IO 불가), Bean Validation, @PreAuthorize
- **채팅 클라이언트에서 `@stomp/stompjs` 사용 필수**

---

### 웹 클라이언트 — SPA

#### React + REST — 기준 클라이언트 (이미 완성)

참고: `pet-sitter-clients/web/react-rest/`

- SRP 아키텍처: Schema → Service → Query Hook → Logic Hook → Container → View
- TanStack Query, Zod, React Hook Form, design-system

#### React + GraphQL

참고: `pet-sitter-clients/web/react-graphql/`

- 학습 포인트: REST와 GraphQL의 차이, Apollo Client 캐시, N+1 문제

#### Next.js + REST / GraphQL

참고: `pet-sitter-clients/web/nextjs-rest/`, `nextjs-graphql/`

- 학습 포인트: SSR vs CSR vs ISR, Server Component vs Client Component, App Router

---

### 웹 클라이언트 — 서버사이드

#### PHP 8.2

참고: `pet-sitter-php/PLAN.md`

- 학습 포인트: PHP 라이프사이클, $\_SESSION, Guzzle HTTP, 템플릿 렌더링
- 채팅: PHP는 WebSocket 서버 역할 불가 → JS에서 socket.io-client 직접 사용

#### Flask (Python)

참고: `pet-sitter-flask/PLAN.md`

- 학습 포인트: WSGI, Blueprint, Jinja2 템플릿, 데코레이터 패턴
- Python의 @login_required 데코레이터가 NestJS Guard와 같은 역할

#### JSP + Servlet (Java)

참고: `pet-sitter-jsp/PLAN.md`

- 학습 포인트: Servlet 라이프사이클, Filter Chain, JSTL, HttpSession
- Java 21 HttpClient (내장 라이브러리, 외부 의존성 불필요)

---

### 모바일 클라이언트

#### Expo (React Native + TypeScript)

참고: `pet-sitter-clients/mobile/expo/PLAN.md`

- 학습 포인트: React 웹과 모바일의 차이, expo-secure-store, 네이티브 모듈
- react-rest와 같은 SRP 아키텍처 그대로 적용 (가장 이식성 높음)

#### Flutter (Dart)

참고: `pet-sitter-clients/mobile/flutter/PLAN.md`

- 학습 포인트: Widget 트리, Dart null-safety, Riverpod AsyncValue, build_runner
- 학습 난이도: Dart 언어 + Flutter 위젯 시스템 동시 학습 필요

#### Android (Jetpack Compose + Kotlin)

참고: `pet-sitter-clients/mobile/android/PLAN.md`

- 학습 포인트: Compose의 선언적 UI, Hilt DI, Coroutines + Flow, Paging 3
- 학습 난이도: Android 플랫폼 이해 필요 (Activity/Fragment 개념)

#### iOS (SwiftUI + Swift)

참고: `pet-sitter-clients/mobile/ios/PLAN.md`

- 학습 포인트: Swift Actor (thread-safety), @Observable, URLSession async/await
- 학습 난이도: Swift 언어 + Apple 생태계 이해 필요

---

## 7. 학습 포인트 — 기술별 핵심 개념

### 모든 기술 스택에서 이해해야 하는 공통 개념

| 개념                       | 설명                                                      | 왜 중요한가                 |
| -------------------------- | --------------------------------------------------------- | --------------------------- |
| **JWT 라이프사이클**       | Access(15분) + Refresh(7일) 발급 → 저장 → 갱신 → 로그아웃 | 모든 인증 시스템의 기반     |
| **커서 기반 페이지네이션** | offset 대신 마지막 항목의 createdAt을 cursor로 사용       | 대용량 데이터에서 성능 보장 |
| **Pre-upload 패턴**        | 파일 먼저 업로드 → photo_id → 메인 요청에 포함            | 첨부파일 처리의 표준 패턴   |
| **역할 기반 접근 제어**    | PetOwner / PetSitter / Admin에 따른 API 접근 제한         | 보안의 기초                 |
| **WebSocket 실시간 통신**  | 양방향 통신, 이벤트 기반, 연결 유지                       | 채팅/알림 구현의 핵심       |

### 서버 구현 시 이해해야 하는 개념

| 개념                | NestJS              | Go               | Spring                 |
| ------------------- | ------------------- | ---------------- | ---------------------- |
| **DI 컨테이너**     | Module + Injectable | 직접 구조체 연결 | ApplicationContext     |
| **미들웨어/필터**   | Guard + Filter      | Gin Middleware   | Filter + @PreAuthorize |
| **ORM 동작**        | Prisma (타입 생성)  | GORM (리플렉션)  | JPA (프록시 객체)      |
| **DB 마이그레이션** | prisma migrate      | golang-migrate   | Flyway                 |
| **WebSocket**       | Socket.IO Gateway   | go-socket.io     | STOMP over WebSocket   |

### 클라이언트 구현 시 이해해야 하는 개념

| 개념            | React                     | Flutter                | Android               | iOS                       |
| --------------- | ------------------------- | ---------------------- | --------------------- | ------------------------- |
| **렌더링 모델** | Virtual DOM diffing       | Widget 트리 리빌드     | Compose 재구성        | SwiftUI View 재계산       |
| **상태 관리**   | useState + TanStack Query | Riverpod AsyncNotifier | StateFlow + ViewModel | @Observable + async/await |
| **네비게이션**  | React Router              | GoRouter               | NavController         | NavigationStack           |
| **비동기 처리** | Promise + async/await     | Future + async/await   | Coroutines + suspend  | async/await + Actor       |
| **토큰 저장**   | SecureStore / Cookie      | flutter_secure_storage | EncryptedSharedPrefs  | Keychain                  |

---

## 8. AI 협업 규칙

### 코드 생성 전 확인 원칙

구현을 시작하기 전에 아키텍처 방향을 먼저 확인한다.

```
AI가 코드를 제안하기 전에 물어볼 것:
1. "이 레이어 구조로 진행해도 될까요?"
2. "NestJS의 이 패턴을 {기술}에서는 이렇게 구현하려고 합니다. 맞나요?"
```

### 주석 & 설명 규칙

```
❌ // 사용자 데이터를 가져온다
✅ // useEffect의 cleanup 함수가 실행되는 시점:
   // 컴포넌트 언마운트 시 + 다음 effect 실행 전 (deps 변경 시)
   // → 이 cleanup이 없으면 언마운트된 컴포넌트에 setState가 호출되어 경고 발생
```

처음 등장하는 라이브러리나 문법은 **"왜 이렇게 동작하는가"**를 설명한다.

### 단계 완료 시 가이드

각 Phase가 완료되면 반드시 아래를 제공한다.

```
✅ 완료된 기능 요약
✅ 로컬 실행 명령어 (복사·붙여넣기 가능한 형태)
✅ 테스트 방법 (어떤 시나리오를 직접 확인할 것인가)
✅ 이 단계에서 배운 핵심 개념 1~2개
```

### 파일 참조 규칙

```
- 구현 전 반드시 해당 기술 스택의 PLAN.md 먼저 읽기
- NestJS 레퍼런스 서버의 동일 기능 파일 확인 후 동일한 로직 적용
- 기존 패턴은 의도적인 것으로 간주하고 변경하지 않음
- 모호한 경우 짧은 질문 1개만 한다
```

---

## 9. 일관성 유지 체크리스트

각 기술 스택에서 같은 기능을 구현할 때 아래 항목이 일치하는지 확인한다.

### API 엔드포인트 일치 여부

| 확인 항목      | 기준                                                   |
| -------------- | ------------------------------------------------------ |
| URL 경로       | NestJS와 동일 (`/jobs`, `/sessions`, `/photos/upload`) |
| HTTP 메서드    | NestJS와 동일                                          |
| 요청 바디 구조 | REQUIREMENTS.md와 동일                                 |
| 응답 구조      | NestJS 응답과 동일                                     |

### 비즈니스 로직 일치 여부

| 확인 항목          | 기준                                 |
| ------------------ | ------------------------------------ |
| 리뷰 reviewee 결정 | 서버가 자동 결정 (클라이언트 미전송) |
| 즐겨찾기 토글 응답 | `{ added: boolean }`                 |
| 토큰 갱신 응답     | `{ accessToken, newRefreshToken }`   |
| 사진 업로드 방식   | Pre-upload → photo_ids 포함          |

### 보안 일치 여부

| 확인 항목 | 기준                                          |
| --------- | --------------------------------------------- |
| 토큰 저장 | 각 플랫폼 보안 저장소 사용 (STANDARDS.md 9장) |
| 401 처리  | 자동 갱신 → 재시도 → 로그아웃                 |
| 파일 검증 | MIME + 5MB 클라이언트 사전 차단               |
| 역할 제어 | PetOwner/PetSitter 전용 기능 분리             |

### 아키텍처 일치 여부

| 확인 항목                    | 기준             |
| ---------------------------- | ---------------- |
| View/UI에 비즈니스 로직 없음 | STANDARDS.md 1장 |
| 서비스 레이어 분리           | STANDARDS.md 1장 |
| 비동기 3상태 처리            | STANDARDS.md 2장 |
| 에러 계층 구조               | STANDARDS.md 3장 |

---
