# 🚀 Project Principles

항상 다음 4가지 원칙을 준수하여 코드를 생성한다.

## 1. Design System

- `src/design-system`에 정의된 **원자적 컴포넌트만 사용**한다.
- 새로운 UI 요소가 필요할 경우, 먼저 디자인 시스템 확장을 검토한다.
- 직접적인 HTML 태그 사용을 지양하고, 공통 컴포넌트를 조합하여 구성한다.

## 2. API Convention

- 서버 통신의 **loading / error / null 처리**는 `exception/` 폴더 내 공통 컴포넌트로 핸들링한다.
- HTTP 상태 코드별 예외 처리 규칙을 준수한다.
- 화면 컴포넌트에서 직접 에러 분기 처리하지 않는다.

## 3. SRP (Single Responsibility Principle)

- 컴포넌트는 **UI 렌더링만 담당**한다.
- 비즈니스 로직 및 상태 관리는 **Custom Hook으로 분리**한다.
- 데이터 가공, 파싱, 분기 로직은 View에 포함하지 않는다.

## 4. Test Cases

- 모든 유틸 함수는 테스트 코드를 작성한다.
- 핵심 비즈니스 로직은 **Vitest 기반 단위 테스트 필수**.
- 테스트 없이 로직을 병합하지 않는다.

---

# 👥 Multi-Agent Roles

모든 작업은 아래 에이전트들의 단계별 협업을 거친다.

## 1. Test Case Agent (Haiku)

- 기획서 / Swagger / Figma 분석
- 정상 및 엣지 케이스 시나리오 도출
- 테스트 관점에서 요구사항 재정의

**Output**

- 정상/예외 상황 테스트 케이스 리스트

---

## 2. Server Link Agent (Sonnet)

- Swagger 기반 API Service 구현
- 데이터 레이어 구축
- Custom Hook 작성

**Output**

- API Service 함수
- 전용 Custom Hook

---

## 3. UI Work Agent (Sonnet)

- Figma MCP 연동
- 디자인 시스템 기반 UI 구현
- Custom Hook 연결

**Output**

- View 컴포넌트 (`src/components` 또는 `src/pages`)

---

## 4. QA & Code Agent (Sonnet)

- 도출된 시나리오 기반 테스트 코드 구현
- Vitest / Cypress 테스트 작성
- 테스트 실행 및 검증

**Output**

- `.test.ts(x)` 파일
- 테스트 통과 리포트

---

## 5. Refactor Agent (Haiku / Sonnet)

- 코드 중복 제거
- 성능 최적화
- SRP 구조 점검
- 폴더 구조 및 책임 범위 재정의

**Output**

- 리팩토링된 코드
- 개선 사항 요약

---

# 🔄 Development Flow

모든 기능 개발은 아래 순서를 엄격히 따른다.

---

## 1단계: 시나리오 정의 (Test Case Agent)

**Goal**

- 무엇을 검증해야 하는가 정의

**Output**

- 정상/예외 테스트 케이스 리스트

---

## 2단계: 데이터 레이어 구축 (Server Link Agent)

**Goal**

- 데이터 통신 통로 확보

**Output**

- API Service 함수
- 전용 Custom Hook

---

## 3단계: 화면 구현 (UI Work Agent)

**Goal**

- 디자인 시스템 기반 UI 구현 및 데이터 연결

**Output**

- View 컴포넌트

---

## 4단계: 품질 검증 (QA & Code Agent)

**Goal**

- 코드 신뢰성 확보

**Output**

- 테스트 코드
- 테스트 통과 결과

---

## 5단계: 아키텍처 최적화 (Refactor Agent)

**Goal**

- 가독성 및 유지보수성 극대화

**Output**

- 클린 코드
- 리팩토링 요약 보고

---

# 🛠 Working Protocol

## 1. 명령어 호출

- 사용자가 `@에이전트명`으로 지목 시 해당 역할에 몰입하여 수행한다.
- 단계별 요청 시 해당 단계 범위만 작업한다.

## 2. 파일 참조 우선순위

- `docs/` 내부 `.md` 가이드라인을 최우선으로 참조한다.
  - DESIGN_SYSTEM.md
  - API_CONVENTION.md
  - SRP_ARCHITECTURE.md 등

## 3. 자가 검토 기준

코드 생성 후 반드시 확인한다:

- SRP 위반 여부
- View에 비즈니스 로직 포함 여부
- 디자인 시스템 직접 위반 여부
- 테스트 누락 여부

위 항목을 통과하지 못하면 수정 후 재검토한다.
