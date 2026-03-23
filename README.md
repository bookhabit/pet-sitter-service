# Petsitter Master — 풀스택 학습 모노레포

> 하나의 펫시터 서비스를 **다양한 기술 스택**으로 직접 구현하며, 웹·앱·서버 개발의 동작 원리를 체득하는 학습 프로젝트.

---

## 프로젝트 목적

같은 서비스를 서로 다른 기술로 구현하면서 아래를 직접 경험한다.

- **기술 비교** — NestJS vs Go vs Spring, React vs Flutter vs Swift가 같은 문제를 어떻게 다르게 푸는지
- **패턴 이해** — MVC, MVVM, 레이어드 아키텍처가 각 언어에서 어떤 형태로 나타나는지
- **설계 능력** — 어떤 기술을 써도 적용되는 SRP, 에러 처리, 인증 흐름 등의 공통 원칙
- **실무 감각** — JWT 라이프사이클, WebSocket 채팅, 파일 업로드, 페이지네이션 등을 직접 구현

---

## 폴더 구조

```
Petsitter-Master/
│
├── servers/                    # API 서버 (Backend)
│   ├── nest-server/            # NestJS + TypeScript (기준 서버)
│   ├── go-server/              # Go + Gin
│   └── spring-server/          # Spring Boot 3 + Java 21
│
├── clients/                    # 화면을 보여주는 클라이언트 (Frontend)
│   ├── web/
│   │   ├── react-web/          # React + REST (기준 클라이언트)
│   │   ├── react-graphql/      # React + GraphQL
│   │   ├── next-web/           # Next.js + REST
│   │   └── next-graphql/       # Next.js + GraphQL
│   └── app/
│       ├── expo-app/           # Expo (React Native + TypeScript)
│       ├── flutter-app/        # Flutter + Dart
│       ├── android/            # Android + Jetpack Compose + Kotlin
│       └── ios/                # iOS + SwiftUI + Swift
│
├── fullstack/                  # 화면 + 서버 일체형 (Monolithic)
│   ├── php-fs/                 # PHP 8.2 (순수 PHP)
│   ├── flask-fs/               # Python + Flask
│   └── jsp-fs/                 # Java + JSP + Tomcat
│
├── docs/                       # API 명세 (Swagger), DB 설계 (ERD)
│
├── REQUIREMENTS.md             # 전체 요구사항 및 도메인 모델
├── STANDARDS.md                # 기술 독립적 설계 원칙 (모든 스택에 적용)
└── GUIDE.md                    # 개발 가이드라인 및 학습 로드맵
```

---

## 서비스 소개

**펫시터 매칭 플랫폼** — 반려동물 주인(PetOwner)이 돌봄 구인글을 등록하고, 펫시터(PetSitter)가 지원하여 매칭되는 서비스.

### 핵심 도메인

| 도메인             | 설명                                                |
| ------------------ | --------------------------------------------------- |
| **User**           | PetOwner / PetSitter / Admin 역할 기반 회원         |
| **Job**            | 구인글 (반려동물 정보 포함, 커서 기반 페이지네이션) |
| **JobApplication** | 지원 및 승인/거절 흐름                              |
| **Photo**          | Pre-upload 방식 사진 첨부                           |
| **Review**         | 양방향 리뷰 (PetOwner ↔ PetSitter)                  |
| **Chat**           | WebSocket 기반 1:1 실시간 채팅                      |
| **Favorite**       | 구인글 즐겨찾기 토글                                |

### 구현 기능 (Phase)

```
Phase 0: 환경 세팅 & 아키텍처 수립
Phase 1: 회원가입 / 로그인 / JWT 토큰 갱신 / 로그아웃
Phase 2: 구인글 목록(무한스크롤) / 상세 / 작성 / 수정 / 삭제
Phase 3: 지원하기 / 승인·거절
Phase 4: 사진 업로드 (MIME + 5MB 검증, Pre-upload 패턴)
Phase 5: 리뷰 작성 / 목록 조회
Phase 6: 실시간 채팅 (WebSocket)
Phase 7: 즐겨찾기 토글
```

---

## 기술 스택

### 서버

| 프로젝트        | 언어       | 프레임워크    | ORM             | WebSocket    |
| --------------- | ---------- | ------------- | --------------- | ------------ |
| `nest-server`   | TypeScript | NestJS        | Prisma          | Socket.IO    |
| `go-server`     | Go         | Gin           | GORM            | go-socket.io |
| `spring-server` | Java 21    | Spring Boot 3 | JPA + Hibernate | STOMP        |

> `spring-server`는 Socket.IO 대신 STOMP 프로토콜 사용 — 클라이언트에서 `@stomp/stompjs` 필요

### 웹 클라이언트

| 프로젝트        | 언어       | 렌더링                 | API     |
| --------------- | ---------- | ---------------------- | ------- |
| `react-web`     | TypeScript | CSR (Vite)             | REST    |
| `react-graphql` | TypeScript | CSR (Vite)             | GraphQL |
| `next-web`      | TypeScript | SSR / ISR (App Router) | REST    |
| `next-graphql`  | TypeScript | SSR / ISR (App Router) | GraphQL |

### 모바일 클라이언트

| 프로젝트      | 언어       | 플랫폼                       |
| ------------- | ---------- | ---------------------------- |
| `expo-app`    | TypeScript | iOS + Android (React Native) |
| `flutter-app` | Dart       | iOS + Android                |
| `android`     | Kotlin     | Android (Jetpack Compose)    |
| `ios`         | Swift      | iOS (SwiftUI)                |

### 풀스택 (서버사이드 렌더링)

| 프로젝트   | 언어        | 특징                                |
| ---------- | ----------- | ----------------------------------- |
| `php-fs`   | PHP 8.2     | 순수 PHP, Guzzle HTTP, PHP Sessions |
| `flask-fs` | Python 3.12 | Flask, Jinja2, Blueprint            |
| `jsp-fs`   | Java 21     | JSP, Servlet, Tomcat                |

---

## 시작하기

### 기준 서버 (NestJS) 실행

```bash
cd servers/nest-server
npm install
cp .env.example .env   # DB 연결 정보 입력
npm run start:dev
```

### 기준 웹 클라이언트 (React) 실행

```bash
cd clients/web/react-web
npm install
npm run dev
```

### 환경변수 공통 항목

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pet_sitter
JWT_SECRET=your_jwt_secret
API_BASE_URL=http://localhost:3000
```

---

## 문서

| 문서                                       | 설명                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `REQUIREMENTS.md`                          | 전체 기능 요구사항, 도메인 모델, API 엔드포인트 목록                        |
| `STANDARDS.md`                             | 모든 기술 스택에 공통 적용되는 설계 원칙 (SRP, 에러 처리, 디자인 시스템 등) |
| `GUIDE.md`                                 | 단계별 개발 방식, 기술별 학습 포인트, AI 협업 규칙                          |
| `servers/nest-server/prisma/schema.prisma` | DB 스키마 (모든 서버 구현의 기준)                                           |
| `clients/web/react-web/docs/`              | React 클라이언트 아키텍처 상세 문서                                         |
| `{프로젝트}/PLAN.md`                       | 각 기술 스택별 구현 계획                                                    |

---

> **Note**: 학습 목적의 프로젝트입니다. 각 구현체는 의도적으로 분리되어 있으며, 같은 기능을 다른 방식으로 풀어내는 과정 자체가 목적입니다.
