# 웹 애플리케이션 구축 공통 표준 (기술 독립적)

> 이 문서는 React, Flutter, Android, iOS, PHP, Flask, JSP 등 **모든 기술 스택**에서 공통으로 적용되는 설계 원칙을 정의합니다.
> 특정 라이브러리나 프레임워크에 의존하지 않고, **어떤 기술로 구현하든 이 원칙을 지켜야 합니다.**

---

## 목차

1. [아키텍처 원칙 — 레이어 분리 (SRP)](#1-아키텍처-원칙--레이어-분리-srp)
2. [비동기 상태 처리 — 필수 3요소](#2-비동기-상태-처리--필수-3요소)
3. [에러 처리 계층 구조](#3-에러-처리-계층-구조)
4. [API 통신 규칙](#4-api-통신-규칙)
5. [디자인 시스템 — 하드코딩 금지](#5-디자인-시스템--하드코딩-금지)
6. [타입 안정성](#6-타입-안정성)
7. [상태 관리 우선순위](#7-상태-관리-우선순위)
8. [서버 계층형 아키텍처](#8-서버-계층형-아키텍처)
9. [보안 원칙](#9-보안-원칙)
10. [네이밍 컨벤션](#10-네이밍-컨벤션)
11. [코드 품질 규칙](#11-코드-품질-규칙)
12. [기술별 적용 가이드](#12-기술별-적용-가이드)

---

## 1. 아키텍처 원칙 — 레이어 분리 (SRP)

### 핵심 철학

> "UI는 보여주기만 한다. 로직은 처리만 한다. 서비스는 호출만 한다. 스키마는 검증만 한다."

### 클라이언트 레이어 구조

```
[스키마 / 타입 정의]
         ↓
[서비스 / API 호출]
         ↓
[데이터 훅 / 상태 관리]
         ↓
[로직 훅 / 비즈니스 처리]
         ↓
[컨테이너 / 상태 분기]
         ↓
[뷰 / UI 렌더링]
```

### 각 레이어의 책임

| 레이어          | 책임                                       | 해서는 안 되는 것                |
| --------------- | ------------------------------------------ | -------------------------------- |
| **스키마/타입** | 데이터 구조 정의 및 런타임 검증            | 네트워크 호출, UI 로직           |
| **서비스**      | 순수 API 호출만                            | UI 프레임워크 import, 상태 관리  |
| **데이터 훅**   | 서버 상태 캐싱/로딩/에러 관리              | 비즈니스 규칙, UI 구성           |
| **로직 훅**     | 데이터 변환, 조건 처리, 폼 상태            | 직접 API 호출, UI 렌더링         |
| **컨테이너**    | 상태 분기 (Loading/Error/Data) → 뷰에 전달 | 비즈니스 로직, 스타일            |
| **뷰**          | props를 받아 렌더링만                      | API 호출, 상태 관리, 데이터 가공 |

### 절대 금지 규칙

- **뷰/컴포넌트**에서 직접 API 호출 금지
- **서비스 레이어**에서 UI 프레임워크(React, Flutter Widget 등) import 금지
- **뷰**에 비즈니스 로직(조건 계산, 데이터 가공) 포함 금지
- **서버 응답**을 검증 없이 그대로 사용 금지

---

## 2. 비동기 상태 처리 — 필수 3요소

모든 API 요청은 반드시 아래 3가지 상태를 정의하고 UI에 반영해야 합니다.

```
[API 요청]
    │
    ├── Loading (로딩 중)  → 스피너, 스켈레톤 UI 표시
    ├── Error   (에러 발생) → 에러 메시지 + 재시도 버튼
    └── Data    (성공)     → 실제 데이터 렌더링
                              └── Empty (데이터 없음) → 빈 상태 안내 UI
```

**4가지 상태 (Loading / Error / Data / Empty)를 모두 처리해야 완성된 UI입니다.**

### 기술별 구현 방법

| 기술              | 구현 방식                                                           |
| ----------------- | ------------------------------------------------------------------- |
| React / Expo      | `useSuspenseQuery` + `Suspense` + `ErrorBoundary` + `EmptyBoundary` |
| Flutter           | `AsyncValue` switch (Riverpod) 또는 `FutureBuilder`                 |
| Android           | `UiState` sealed class (Loading / Error / Success)                  |
| iOS               | `LoadingState<T>` enum (idle / loading / success / failure)         |
| PHP / Flask / JSP | try/catch + 조건 분기 (뷰에서 상태 변수 확인)                       |

---

## 3. 에러 처리 계층 구조

에러는 발생 위치와 범위에 따라 4개 레벨로 나누어 처리합니다.

```
[Global 레벨]  → 앱 전체 크래시 방지 (최후 보루)
      │
[Page 레벨]   → 페이지 단위 에러 (Safety net)
      │
[Component 레벨] → 기능 단위 에러 (헤더/탭은 살아있음)
      │
[Empty 레벨]  → 정상 응답이지만 데이터 없음
```

### 레벨별 역할

| 레벨          | 발동 조건                           | UI 반응                                  |
| ------------- | ----------------------------------- | ---------------------------------------- |
| **Global**    | 모든 미처리 예외                    | 전체 화면 에러 페이지 (새로고침/홈 버튼) |
| **Page**      | 페이지 내 경계 없는 컴포넌트의 에러 | 페이지 에러 뷰 + 재시도/뒤로가기         |
| **Component** | 특정 기능 컴포넌트의 API 에러       | 해당 영역만 에러 뷰로 교체               |
| **Empty**     | API 성공이지만 빈 배열 반환         | 빈 상태 안내 문구                        |

### 에러 타입별 처리 위치

| 에러 종류                         | 처리 위치               | 방법                                   |
| --------------------------------- | ----------------------- | -------------------------------------- |
| 네트워크/API 에러 (GET)           | Component ErrorBoundary | 인라인 에러 뷰 + 재시도                |
| Mutation 에러 (POST/PATCH/DELETE) | 호출부 직접 처리        | 토스트 메시지 / 폼 에러 표시           |
| 401 인증 에러                     | HTTP 인터셉터           | 토큰 갱신 → 재시도 → 로그인 리다이렉트 |
| JS 런타임 예외                    | Global ErrorBoundary    | 전체화면 fallback                      |
| 서버 검증 에러 (422)              | 폼 에러 처리            | 필드별 에러 메시지                     |

---

## 4. API 통신 규칙

### 인증 토큰 흐름

```
요청 전: Authorization 헤더에 Access Token 자동 주입
           ↓
서버 응답 401:
    1. Refresh Token으로 재발급 요청
    2. 새 Access Token 수신
    3. 실패한 원래 요청 재시도
    4. Refresh도 실패 → 로그아웃 처리
```

### API 클라이언트 분리 원칙

| 종류           | 용도                        | 토큰                        |
| -------------- | --------------------------- | --------------------------- |
| **publicApi**  | 로그인, 회원가입, 토큰 갱신 | 없음                        |
| **privateApi** | 인증이 필요한 모든 요청     | Bearer 자동 주입 + 401 갱신 |

### 서버 응답 검증

서버 응답은 **반드시 타입/스키마 검증**을 거쳐야 합니다.

```
서버 응답 수신
    ↓
스키마 검증 (Zod / Dart Freezed / Java Record / Swift Codable)
    ↓
실패 시: 에러 throw (예상치 못한 서버 변경 즉시 감지)
성공 시: 타입이 보장된 데이터 반환
```

### 사진 업로드 패턴 (Pre-upload)

```
1. POST /photos/upload → { photo_ids: [uuid, ...] }
2. photo_ids를 메인 요청(구인글/프로필 등)에 포함
```

- MIME 타입 검증: `image/jpeg`, `image/png`, `image/webp`만 허용
- 파일 크기 제한: 5MB 초과 시 업로드 전에 클라이언트 차단

---

## 5. 디자인 시스템 — 하드코딩 금지

### 핵심 원칙

> 색상, 간격, 폰트 크기를 숫자로 직접 작성(하드코딩)하지 않는다.
> 사전에 정의된 **토큰/변수/테마**만 사용한다.

### 색상 토큰

| 이름           | 값        | 용도                      |
| -------------- | --------- | ------------------------- |
| primary        | `#3182F6` | 브랜드 주색, 버튼, 링크   |
| text-primary   | `#191F28` | 본문 텍스트               |
| text-secondary | `#4E5968` | 보조 텍스트, 플레이스홀더 |
| background     | `#F2F4F6` | 페이지 배경               |
| border         | `#E5E8EB` | 구분선, 비활성 테두리     |
| success        | `#12B76A` | 성공 상태                 |
| warning        | `#F79009` | 경고 상태                 |
| danger         | `#F04438` | 에러, 위험 상태           |

### 타이포그래피 스케일

| 단계    | 크기 | 용도              |
| ------- | ---- | ----------------- |
| t1      | 24px | 페이지 제목       |
| t2      | 20px | 섹션 제목         |
| b1      | 16px | 본문 (기본)       |
| b2      | 14px | 보조 본문         |
| caption | 12px | 캡션, 에러 메시지 |

### 간격 (8px Grid)

허용 값: `2, 4, 8, 12, 16, 24, 32, 48, 64` (px)

임의의 값(예: 7px, 13px, 9px) 사용 금지.

### 기술별 적용 방법

| 기술             | 적용 방식                                                       |
| ---------------- | --------------------------------------------------------------- |
| React/Expo (CSS) | CSS 변수 또는 Tailwind 커스텀 토큰                              |
| Flutter          | `ThemeData` + `ColorScheme` + `TextTheme`                       |
| Android          | `colors.xml` + `dimens.xml` + `MaterialTheme`                   |
| iOS              | `Asset Catalog` + `UIColor extension` + `SwiftUI Design Tokens` |
| PHP/Flask/JSP    | CSS 변수 (`--primary: #3182F6`) + 공통 CSS 파일                 |

### 컴포넌트 외부 margin 금지

컴포넌트는 스스로 외부 margin을 가지지 않는다.
간격은 **부모 컨테이너 또는 레이아웃 컴포넌트**가 담당한다.

```
❌ Button 컴포넌트 내부에 margin-top: 24px 설정
✅ Button을 감싸는 부모가 gap 또는 spacing으로 간격 설정
```

---

## 6. 타입 안정성

### 절대 규칙

| 규칙           | 금지                    | 권장                                 |
| -------------- | ----------------------- | ------------------------------------ |
| any 타입 금지  | `const data: any = ...` | 명시적 타입 선언                     |
| Null 방어      | `user.name.toUpper()`   | `user?.name?.toUpper() ?? 'Unknown'` |
| 서버 응답 검증 | 응답을 그대로 신뢰      | Zod/Codable/Serializable로 검증      |
| 타입 커버리지  | 함수 파라미터 타입 생략 | 모든 인자·반환값 타입 명시           |

### 컴파일 타임 에러 우선

런타임에 터지는 에러는 컴파일 단계에서 차단해야 합니다.

- TypeScript: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- Dart: sound null safety 활성화
- Kotlin: null-safe 타입 시스템 활용
- Swift: `Optional` 명시적 처리, force-unwrap(`!`) 금지
- Java: `@NonNull` / `Optional<T>` 활용

### 엔티티 vs DTO 분리

DB 엔티티(Entity)를 클라이언트에 직접 노출하지 않는다.
필요한 필드만 담은 **DTO(Data Transfer Object)**를 별도로 정의한다.

---

## 7. 상태 관리 우선순위

```
1순위: 로컬 상태 (useState, StatefulWidget, ViewModel)
         ↓ 필요할 때만 올린다
2순위: 서버 상태 (TanStack Query, Riverpod AsyncNotifier, Retrofit + ViewModel)
         ↓ 정말 필요할 때만
3순위: 전역 상태 (Zustand, Redux, Provider, AppState)
```

**전역 상태는 인증 정보, 세션, 테마에만 사용합니다.**

### 데이터 흐름 원칙

- 데이터 흐름은 **단방향**으로 유지한다 (하향 전달)
- Props drilling이 3단계를 초과하면 상태 구조를 재검토한다
- 컴포넌트가 직접 API를 호출하지 않는다

---

## 8. 서버 계층형 아키텍처

### 레이어 구조

```
[Controller / Router]
    → 요청 수신 + 응답 반환 + 입력값 검증
         ↓
[Service / UseCase]
    → 비즈니스 로직, 조건 처리, 계산
         ↓
[Repository / DAO]
    → DB 쿼리 실행, ORM 호출
```

### 레이어별 책임

| 레이어         | 책임                                      | 해서는 안 되는 것                 |
| -------------- | ----------------------------------------- | --------------------------------- |
| **Controller** | 라우팅, 인증/인가, DTO 변환, 응답 포맷    | 비즈니스 로직, DB 직접 접근       |
| **Service**    | 비즈니스 규칙, 계산, 여러 Repository 조합 | HTTP 요청/응답 처리, DB 직접 접근 |
| **Repository** | DB 쿼리, ORM 조작                         | 비즈니스 로직                     |

### API 응답 포맷 (구조화된 에러)

서버는 **항상 구조화된 응답**을 반환해야 합니다.
500 에러가 발생해도 민감한 내부 정보(스택 트레이스, SQL 등)는 절대 노출하지 않습니다.

```json
// 성공 응답
{ "data": { ... } }

// 에러 응답
{ "message": "이미 사용 중인 이메일입니다", "statusCode": 409 }
```

### SSOT (단일 진실 원천)

- 특정 데이터 수정은 **하나의 서비스 메서드**를 통해서만 처리한다
- 같은 로직을 여러 곳에 중복 작성하지 않는다
- 서버에서 계산 가능한 값은 서버에서 계산한다 (reviewee 자동 결정 등)

---

## 9. 보안 원칙

### 입력값 검증 (Defense in Depth)

- **클라이언트**: 폼 검증으로 UX 개선 (빠른 피드백)
- **서버**: 모든 입력값을 신뢰하지 않고 재검증 (실제 보안)
- 클라이언트 검증만으로는 충분하지 않습니다

### XSS 방지

- 사용자 입력을 HTML로 직접 렌더링하지 않는다
- 템플릿 엔진의 자동 이스케이프 기능을 활성화한다
- `innerHTML`, `dangerouslySetInnerHTML` 사용 시 반드시 검토한다

### SQL Injection 방지

- 원시 SQL 문자열 연결(concatenation) 금지
- ORM 파라미터 바인딩 또는 Prepared Statement 사용

### 인증/인가

- JWT(Access Token)는 클라이언트 메모리 또는 보안 저장소에 보관
  - 웹: `httpOnly Cookie` 또는 메모리 (localStorage 금지)
  - 모바일: Keychain(iOS), EncryptedSharedPreferences(Android), SecureStore(Expo), flutter_secure_storage(Flutter)
- API Key, 시크릿은 **환경변수(.env)**로만 관리, 소스코드에 하드코딩 금지
- 모든 보호 API는 역할(Role) 기반 접근 제어 (PetOwner, PetSitter, Admin)

### 파일 업로드 보안

- MIME 타입 검증 (확장자만으로 신뢰하지 않음)
- 파일 크기 제한 (5MB)
- 저장 경로에 원본 파일명 사용 금지 (UUID로 대체)

---

## 10. 네이밍 컨벤션

| 대상            | 규칙                      | 예시                                          |
| --------------- | ------------------------- | --------------------------------------------- |
| 컴포넌트/클래스 | PascalCase                | `UserProfileCard`, `JobListViewModel`         |
| 함수/메서드     | 동사로 시작               | `fetchUser`, `handleSubmit`, `calculateTotal` |
| 불리언 변수     | `is`, `has`, `can` 접두사 | `isLoading`, `hasPermission`, `canEdit`       |
| 상수            | UPPER_SNAKE_CASE          | `API_BASE_URL`, `MAX_FILE_SIZE`               |
| 훅(React/Expo)  | `use` + 도메인 + 행위     | `useJobList`, `useAuthForm`                   |
| 이벤트 핸들러   | `handle` + 이벤트         | `handleLogin`, `handleFileUpload`             |

---

## 11. 코드 품질 규칙

### 단일 책임 (SRP)

- 하나의 함수/클래스는 **하나의 일**만 수행한다
- 함수가 100줄을 초과하면 반드시 분리한다
- 조건문이 3개 이상이면 별도 함수나 로직으로 추출한다

### 주석 규칙

```
❌ // 사용자 데이터를 가져온다 (코드가 하는 일 — 코드를 읽으면 알 수 있음)
✅ // 레거시 API가 pagination 없이 전체를 반환하므로 클라이언트에서 슬라이싱
   (왜 이렇게 했는지 — 코드를 읽어도 알 수 없는 맥락)
```

### 성능 기초 원칙

- 불필요한 렌더링/리빌드 방지 (메모이제이션, const widget)
- API 호출 최소화: 캐싱 전략 적용 (staleTime, keepAlive)
- 이미지 최적화: 썸네일 사용, lazy loading, 적절한 포맷
- 커서 기반 페이지네이션 사용 (offset 방식 지양)

### 비동기 규칙

- `async/await`만 사용, `.then()` 체이닝 지양
- 사이드 이펙트는 hooks 또는 별도 effect 레이어에만
- 에러를 조용히 무시하지 않는다 (`console.log`는 에러 처리가 아님)

### 코드 중복 금지

- 같은 로직이 2번 이상 나타나면 공통 함수로 추출한다
- 다만 **너무 이른 추상화(premature abstraction)는 피한다**
- 지금 당장 필요하지 않은 유연성을 위해 복잡도를 올리지 않는다

---

## 12. 기술별 적용 가이드

### 공통: 레이어 → 기술 매핑

| 공통 레이어 | React/Expo          | Flutter                | Android                            | iOS                      | PHP/Flask/JSP            |
| ----------- | ------------------- | ---------------------- | ---------------------------------- | ------------------------ | ------------------------ |
| 스키마/타입 | Zod + TypeScript    | Freezed + Dart         | data class + kotlinx.serialization | Codable + Swift          | 클래스/배열              |
| 서비스      | axios 순수 함수     | Dio Repository         | Retrofit interface                 | URLSession + async/await | ApiClient.php / requests |
| 데이터 훅   | TanStack Query      | Riverpod AsyncNotifier | ViewModel + StateFlow              | @Observable ViewModel    | — (서버 사이드)          |
| 로직 훅     | Custom Hook         | UseCase / Provider     | ViewModel method                   | ViewModel method         | Controller method        |
| 컨테이너    | Container component | AsyncValue switch      | UiState sealed class               | LoadingState enum switch | 뷰 템플릿 조건 분기      |
| 뷰          | View component      | Widget                 | Composable                         | SwiftUI View             | HTML 템플릿              |

### 에러 처리 기술별 구현

| 기술          | 구현 방식                                           |
| ------------- | --------------------------------------------------- |
| React/Expo    | `ErrorBoundary` + `QueryErrorBoundary` + `Suspense` |
| Flutter       | `AsyncValue` when pattern (data/loading/error)      |
| Android       | `UiState` sealed class + `when` expression          |
| iOS           | `LoadingState<T>` enum + `switch`                   |
| PHP/Flask/JSP | try/catch + 뷰 조건 분기 (isset/None/null 체크)     |

### 인증 토큰 저장 기술별 구현

| 기술       | 저장 방식                                  |
| ---------- | ------------------------------------------ |
| React (웹) | httpOnly Cookie (권장) 또는 메모리 상태    |
| Expo       | `expo-secure-store`                        |
| Flutter    | `flutter_secure_storage`                   |
| Android    | `EncryptedSharedPreferences`               |
| iOS        | Keychain (`Security.framework`)            |
| PHP        | `$_SESSION` (서버 세션, 클라이언트 미저장) |
| Flask      | `flask.session` (서버 세션)                |
| JSP        | `HttpSession` (서버 세션)                  |

---

## 준수 체크리스트 (PR/코드 리뷰 기준)

### 클라이언트

- [ ] 뷰 컴포넌트에 비즈니스 로직이 없음
- [ ] 서비스 레이어가 UI 프레임워크에 의존하지 않음
- [ ] 모든 API 요청에 Loading / Error / Data 3가지 상태 처리 있음
- [ ] 빈 데이터(Empty) 상태 UI 처리 있음
- [ ] 401 에러 시 토큰 갱신 → 재시도 → 로그아웃 흐름 있음
- [ ] 색상/간격/폰트 크기 하드코딩 없음 (토큰/변수 사용)
- [ ] any 타입 사용 없음
- [ ] 토큰이 안전한 저장소에 보관됨

### 서버

- [ ] Controller가 비즈니스 로직을 직접 수행하지 않음
- [ ] Service가 DB에 직접 접근하지 않음
- [ ] 에러 응답에 내부 정보(스택 트레이스, SQL) 미포함
- [ ] 모든 입력값 서버 사이드 검증 존재
- [ ] 역할 기반 접근 제어(Role) 적용
- [ ] 민감한 정보(.env) 소스코드 미포함
