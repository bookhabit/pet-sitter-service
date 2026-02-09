# Frontend Development Rules
# 프론트엔드 개발 규칙

**이 규칙은 모든 클라이언트 프로젝트(web, mobile)에 동일하게 적용됩니다.**

---

## 📋 목차 / Table of Contents

1. [프로젝트 목적](#1-프로젝트-목적)
2. [AI 사용 규칙](#2-ai-사용-규칙)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [타입 안정성](#4-타입-안정성)
5. [에러 & 예외 처리](#5-에러--예외-처리)
6. [상태 관리](#6-상태-관리)
7. [컴포넌트 설계](#7-컴포넌트-설계)
8. [API 통합](#8-api-통합)
9. [디자인 시스템](#9-디자인-시스템)
10. [코드 작성 규칙](#10-코드-작성-규칙)
11. [유지보수 원칙](#11-유지보수-원칙)

---

## 1. 프로젝트 목적

### Purpose
This monorepo implements the same product across multiple platforms and tech stacks, comparing **REST and GraphQL** through production-level code.

### 목적
**하나의 서버를 기준으로** 여러 플랫폼과 기술 스택으로 동일한 제품을 구현하고, **REST와 GraphQL을 실제 코드로 비교**한다.

### Standards
- Learning project, but **all code must meet production standards**
- 학습 목적이지만 **모든 구현은 실무 수준**을 따른다

---

## 2. AI 사용 규칙

### Token Efficiency / 토큰 최소화

#### ❌ 금지 사항 / Do NOT
- 레포 전체 자동 탐색 금지 / No auto repository scanning
- 구조/패턴 추측 금지 / No guessing architecture or patterns
- 새로운 추상화/폴더 구조 발명 금지 / No inventing new abstractions

#### ✅ 필수 사항 / Must Do
- 사용자가 명시한 파일만 읽기 / Only read explicitly referenced files
- 기존 패턴은 의도적인 것으로 간주 / Assume existing patterns are intentional
- 기존 코드 복사/확장 우선 / Prefer copying existing patterns

#### 질문 규칙 / Question Rule
모호한 경우 **짧은 질문 1개만** 한다.
If unclear, **ask exactly one concise question**.

---

## 3. 프로젝트 구조

### Folder Rules / 폴더 규칙

#### 절대 규칙 / Absolute Rules
- ❌ 기존 폴더 구조 변경 금지 / Do NOT change existing folder structure
- ❌ 임의 폴더 생성 금지 / Do NOT create arbitrary folders

#### 프로젝트 구조 예시 / Structure Example
```
pet-sitter-clients/
├── web/
│   ├── nextjs-rest/        # Next.js + REST only
│   ├── nextjs-graphql/     # Next.js + GraphQL only
│   ├── react-rest/         # React + REST only
│   ├── react-graphql/      # React + GraphQL only
│   ├── vanilla-rest/       # Vanilla JS + REST only
│   └── vanilla-graphql/    # Vanilla JS + GraphQL only
└── mobile/
    ├── expo-rest/          # Expo + REST only
    ├── expo-graphql/       # Expo + GraphQL only
    ├── android-compose-rest/
    ├── android-compose-graphql/
    ├── ios-swiftui-rest/
    └── ios-swiftui-graphql/
```

**각 프로젝트는 하나의 기술 스택 + 하나의 API 방식만 사용한다.**

---

## 4. 타입 안정성

### Type Safety Rules / 절대 규칙 (위반 불가)

#### Rule 1: `any` 금지 / No `any`
```typescript
❌ const data: any = await fetch()
✅ const data: UserResponse = await fetch()
```

#### Rule 2: 완전한 타입 커버리지 / Full Type Coverage
- 모든 함수 인자, 반환값 타입 명시
- All function parameters and return types must be explicitly typed

#### Rule 3: Null/Undefined 방어 / Guard Nullables
```typescript
❌ user.name.toUpperCase()
✅ user?.name?.toUpperCase() ?? 'Unknown'
```

#### Rule 4: 컴파일 타임 에러 우선 / Compile-time Over Runtime
런타임 에러는 컴파일 단계에서 차단한다.
Prevent runtime errors at compile time.

---

## 5. 에러 & 예외 처리

### Error vs Exception

| Type | Description | Examples |
|------|-------------|----------|
| **Error** (에러) | 예상 가능한 복구 가능한 실패 | Network failure, 401/403, Validation errors |
| **Exception** (예외) | 불가능한 상태, 버그, 가정 위반 | Required data is null, Broken invariants |

### Rules / 규칙

#### 1. try/catch 필수 / Mandatory try/catch
```typescript
✅ async function fetchUser(id: string) {
  try {
    const response = await api.getUser(id);
    return response.data;
  } catch (error) {
    if (error instanceof NetworkError) {
      // 복구 가능 → 처리
      showErrorToast('Network error');
    } else {
      // 복구 불가능 → 재던짐
      throw error;
    }
  }
}
```

#### 2. Guard 규칙 / Guard Rules
```typescript
❌ if (!user) return;  // 조용히 무시
✅ if (!user) throw new Error('User must exist');
```

#### 3. 모든 비동기는 상태 처리 / Handle All Async States
- Loading
- Success
- Error

#### 4. 에러 표시 필수 / Errors Must Be Visible
- `console.log`는 에러 처리가 아님
- Errors must be shown to users

#### 5. Error Boundaries (React)
- 페이지 또는 주요 기능 단위 필수
- Fallback UI + 재시도/안전 네비게이션 제공

---

## 6. 상태 관리

### State Priority / 우선순위

```
1순위: Local State (useState, useReducer)
        ↓
2순위: Server State (TanStack Query, Apollo Cache)
        ↓
3순위: Global State (Context, Zustand, Redux)
```

**전역 상태는 최후의 수단이다.**
**Global state is the last resort.**

### Global State Usage / 전역 상태 사용 조건
Only for:
- Authentication (인증)
- Session (세션)
- Theme (테마)

### Data Flow Rules / 데이터 흐름 규칙
- ✅ 데이터 흐름은 예측 가능하고 단방향
- ❌ 컴포넌트가 직접 API 호출 금지
- ❌ Props drilling 3단계 초과 금지

---

## 7. 컴포넌트 설계

### Principles / 원칙
- **Single Responsibility Principle** (단일 책임)
- **Clear Separation of Concerns** (명확한 관심사 분리)

### Component Types / 컴포넌트 분류

| Type | Purpose | Example |
|------|---------|---------|
| **UI Components** | 순수 렌더링만, 비즈니스 로직 없음 | `Button`, `Card`, `Input` |
| **Feature Components** | 도메인 로직 + 상태 관리 | `UserProfile`, `JobList` |
| **Composition Components** | 조립만, 로직 없음 | `DashboardLayout` |

### Anti-Pattern / 금지 패턴
```typescript
❌ 한 파일에 API + 상태 + UI 모두 포함
❌ API + state + UI in a single file
```

### Form State / 폼 상태 관리
모든 폼은 반드시 처리:
- Loading
- Disabled
- Error
- Validation

---

## 8. API 통합

### REST 구조 규칙

#### 파일 구조 / File Structure
```typescript
// api/users.ts
export interface CreateUserRequest { ... }
export interface UserResponse { ... }

export const userAPI = {
  getUser: (id: string) => fetch<UserResponse>(...),
  createUser: (data: CreateUserRequest) => fetch<UserResponse>(...)
}

// hooks/useUser.ts
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userAPI.getUser(id)
  })
}
```

#### 규칙 / Rules
- 기능당 1개 파일 / One file per feature
- 파일 구성: API 호출 + 요청/응답 타입 + TanStack Query 훅

---

### GraphQL 구조 규칙

#### 파일 구조 / File Structure
```typescript
// graphql/queries/user.ts
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
`

// hooks/useUser.ts
export const useUser = (id: string) => {
  return useQuery(GET_USER, { variables: { id } })
}
```

#### 규칙 / Rules
- 명시적 queries, mutations, fragments
- ❌ Over-fetching 금지
- 캐시 동작은 의도적으로 설계

---

## 9. 디자인 시스템

### Shared Design Tokens
모든 UI는 공통 디자인 시스템을 따른다.
All UI must follow a shared design system.

```typescript
const theme = {
  fonts: { ... },
  colors: { ... },
  spacing: { ... },
  radius: { ... },
  shadows: { ... }
}
```

### Asset Management
- 이미지와 아이콘은 중앙 관리
- Images and icons must be centrally managed

---

## 10. 코드 작성 규칙

### File Responsibility / 파일 책임
- **1 파일 = 1 책임** / One file = one responsibility
- UI 파일은 뷰 로직만 / UI files contain view logic only
- API 파일은 네트워크 로직만 / API files contain network logic only

### Naming Conventions / 네이밍 규칙

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `UserProfileCard` |
| Hook | `use` + Domain + Action | `usePetSitterList` |
| Boolean | `is`, `has`, `can` | `isLoading`, `hasPermission` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL` |

### Data Flow / 데이터 흐름
```
API → hook → component
```

- ❌ Props drilling 3단계 초과 금지

### Async Rules / 비동기 규칙
- ✅ `async/await` 만 사용
- ❌ `.then()` 체이닝 금지
- Side effect는 hooks 또는 effect layer에만

### UI vs Domain Logic
- UI 컴포넌트는 선언적으로 유지
- 복잡한 로직은 반드시 추출
- 조건문이 3개 이상이면 로직 분리

### Comments / 주석 규칙
```typescript
❌ // Fetch user data (코드가 하는 일)
✅ // Legacy API requires manual retry logic (왜 존재하는지)
```

---

## 11. 유지보수 원칙

### Priorities / 우선순위
1. **Readability** (가독성)
2. **Predictable data flow** (예측 가능한 데이터 흐름)
3. **Explicit error handling** (명시적 에러 처리)
4. **Scalable structure** (확장 가능한 구조)
5. **Easy onboarding** (쉬운 온보딩)

### Decision Rule / 의사결정 규칙
여러 해결책이 있다면, **인지 부하가 가장 낮은 것**을 선택한다.
If multiple solutions exist, choose the one with **lowest cognitive load**.

---

## 🚨 규칙 위반 알림 정책

### When to Report / 언제 알릴 것인가
사용자 코드가 이 문서를 위반하면 명시적으로 지적한다.

### Focus Areas / 중점 영역
- Architecture (구조)
- Data flow (데이터 흐름)
- Error/Exception handling (에러/예외 처리)
- Type safety (타입 안정성)

### What NOT to Report / 지적하지 않을 것
- 포맷팅, 사소한 스타일 선호도

### How to Report / 어떻게 알릴 것인가
- **왜** 규칙을 위반했는지 설명
- 준수 방향을 제안

---

## 🎯 Claude에게 주는 최종 지침

You are a frontend engineer contributing to a long-lived production codebase.

### Optimize for / 최적화 대상:
- ✅ **Stability** (안정성)
- ✅ **Predictability** (예측 가능성)
- ✅ **Maintainability** (유지보수성)
- ✅ **Clarity** (명확함)

### Do NOT optimize for / 최적화 금지:
- ❌ Cleverness (영리함)
- ❌ Brevity at the cost of readability (가독성을 해치는 간결함)
- ❌ Premature abstraction (조기 추상화)

---

**이 규칙들은 모든 클라이언트 프로젝트(web, mobile)에 동일하게 적용된다.**
**These rules apply equally to all client projects (web, mobile).**
