# Design System 규칙서

이 문서는 `src/design-system/`에 구현된 디자인 시스템의 사용 규칙과 설계 원칙을 정의합니다.
새 기능을 개발하기 전에 반드시 읽어주세요.

---

## 목차

1. [핵심 원칙](#1-핵심-원칙)
2. [폴더 구조](#2-폴더-구조)
3. [Import 규칙](#3-import-규칙)
4. [Design Tokens](#4-design-tokens)
5. [컴포넌트 사용법](#5-컴포넌트-사용법)
6. [레이아웃 규칙](#6-레이아웃-규칙)
7. [컴포넌트 작성 규칙](#7-컴포넌트-작성-규칙)
8. [아이콘 추가 방법](#8-아이콘-추가-방법)

---

## 1. 핵심 원칙

### "한 번 만든 UI는 다시 만들지 않는다"

| 원칙                 | 설명                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **매직 넘버 제거**   | `bg-[#3182f6]` 대신 `bg-primary` 사용. 브랜드 컬러 변경 시 CSS 변수 하나만 수정하면 전체 반영 |
| **8px Grid 강제**    | `m-7`, `p-9` 같은 임의의 spacing은 사용 불가. 허용값: `0 2 4 8 12 16 24 32 48 64`             |
| **Typography 세트**  | 폰트 크기만 독립적으로 쓰지 않는다. 행간(line-height)이 항상 세트로 따라온다                  |
| **외부 margin 금지** | 컴포넌트는 스스로 외부 margin을 가지지 않는다. 간격은 `Spacing` 컴포넌트가 담당               |
| **단일 import 경로** | 모든 컴포넌트는 `@/design-system`에서만 import한다                                            |

---

## 2. 폴더 구조

```
src/design-system/
├── tokens/              # 디자인의 기초 수치 (참고용 상수)
│   ├── colors.ts        # Primitive / Semantic 색상 토큰
│   ├── typography.ts    # 타이포그래피 스케일
│   └── spacing.ts       # 8px grid 간격 토큰
│
├── atoms/               # 최소 단위 컴포넌트
│   ├── Badge/
│   ├── Button/
│   ├── Checkbox/
│   ├── Skeleton/
│   ├── Spinner/
│   ├── Text/
│   └── TextField/
│
├── layouts/             # 배치 전용 컴포넌트 (비즈니스 로직 없음)
│   ├── Divider.tsx
│   ├── Flex.tsx
│   ├── Grid.tsx
│   └── Spacing.tsx
│
├── icons/               # 아이콘 컴포넌트
│   ├── CheckIcon.tsx
│   ├── CloseIcon.tsx
│   ├── ChevronDownIcon.tsx
│   └── index.ts         # re-export
│
├── utils/
│   └── cn.ts            # Tailwind 클래스 병합 유틸
│
└── index.ts             # 통합 내보내기 (유일한 public API)
```

---

## 3. Import 규칙

```tsx
// ✅ 올바른 사용 — 항상 @/design-system에서 import
import { Button, Flex, Spacing, Text } from '@/design-system';

// ❌ 잘못된 사용 — 내부 경로 직접 import 금지
import { Button } from '@/design-system/atoms/Button/Button';
```

---

## 4. Design Tokens

### 4-1. 색상 (Colors)

색상은 CSS 변수로 관리됩니다. `src/index.css`에 정의되어 있습니다.

| CSS 변수      | 값        | Tailwind 클래스                | 사용 목적                   |
| ------------- | --------- | ------------------------------ | --------------------------- |
| `--blue500`   | `#3182f6` | `bg-primary`, `text-primary`   | 브랜드 주색, 버튼, 링크     |
| `--grey900`   | `#191f28` | `text-text-primary`            | 본문 텍스트                 |
| `--grey600`   | `#4e5968` | `text-text-secondary`          | 보조 텍스트, 플레이스홀더   |
| `--grey200`   | `#e5e8eb` | `bg-grey200`, `border-grey200` | 구분선, 비활성 테두리       |
| `--grey100`   | `#f2f4f6` | `bg-background`                | 페이지 배경, secondary 버튼 |
| `--green500`  | `#12b76a` | `bg-success`                   | 성공 상태                   |
| `--orange400` | `#f79009` | `bg-warning`                   | 경고 상태                   |
| `--red500`    | `#f04438` | `bg-danger`, `text-danger`     | 에러, 위험 상태             |

```tsx
// ✅ 올바른 색상 사용
<div className="bg-primary text-white" />
<p className="text-text-primary" />
<p className="text-text-secondary" />

// ❌ 매직 넘버 사용 금지
<div className="bg-[#3182f6]" />
<p className="text-[#191f28]" />
```

### 4-2. 타이포그래피 (Typography)

**`1rem = 10px`** 규칙으로 피그마 수치와 1:1 대응합니다.

| 클래스         | 크기 | 행간 | 자간    | 자중 | 사용처            |
| -------------- | ---- | ---- | ------- | ---- | ----------------- |
| `text-t1`      | 24px | 1.3  | -0.02em | 700  | 페이지 제목       |
| `text-t2`      | 20px | 1.3  | -0.01em | 700  | 섹션 제목         |
| `text-b1`      | 16px | 1.5  | 0       | 400  | 본문 (기본값)     |
| `text-b2`      | 14px | 1.5  | 0       | 400  | 보조 본문         |
| `text-caption` | 12px | 1.5  | 0       | 400  | 캡션, 에러 메시지 |

```tsx
// ✅ Typography 스케일 사용
<Text size="t1">페이지 제목</Text>
<Text size="b1" color="secondary">설명 텍스트</Text>

// ❌ 임의의 폰트 크기 사용 금지
<p className="text-xl font-bold">제목</p>
<p className="text-[15px]">내용</p>
```

### 4-3. 간격 (Spacing — 8px Grid)

허용된 간격 값만 사용합니다. **피그마 수치 ÷ 10 = rem 값 = Tailwind 클래스**

| px   | Tailwind       | rem    |
| ---- | -------------- | ------ |
| 2px  | `p-2`, `m-2`   | 0.2rem |
| 4px  | `p-4`, `m-4`   | 0.4rem |
| 8px  | `p-8`, `m-8`   | 0.8rem |
| 12px | `p-12`, `m-12` | 1.2rem |
| 16px | `p-16`, `m-16` | 1.6rem |
| 24px | `p-24`, `m-24` | 2.4rem |
| 32px | `p-32`, `m-32` | 3.2rem |
| 48px | `p-48`, `m-48` | 4.8rem |
| 64px | `p-64`, `m-64` | 6.4rem |

### 4-4. Border Radius

| Tailwind       | 값       | 사용처                  |
| -------------- | -------- | ----------------------- |
| `rounded-sm`   | 2px      | 뱃지, 태그              |
| `rounded-md`   | 4px      | 소형 요소               |
| `rounded-lg`   | 8px      | 카드, 기본              |
| `rounded-xl`   | 12px     | 버튼 (md/lg), 입력 필드 |
| `rounded-2xl`  | 16px     | 카드, 모달              |
| `rounded-3xl`  | 20px     | 큰 카드                 |
| `rounded-full` | 999.9rem | 아바타, 원형 버튼       |

---

## 5. 컴포넌트 사용법

### Text

```tsx
import { Text } from '@/design-system';

// size: t1 | t2 | b1 | b2 | caption (기본: b1)
// color: primary | secondary | white (기본: primary)
// as: h1 | h2 | h3 | h4 | p | span | div | label (기본: p)

<Text size="t1" as="h1">페이지 제목</Text>
<Text size="b2" color="secondary">보조 텍스트</Text>
<Text size="caption" color="secondary" as="span">캡션</Text>
```

### Button

```tsx
import { Button } from '@/design-system';

// variant: primary | secondary | danger | ghost (기본: primary)
// size: sm | md | lg (기본: md)
// isLoading: true일 때 Spinner 표시 및 disabled 처리

<Button onClick={handleSubmit}>제출</Button>
<Button variant="secondary" size="sm">취소</Button>
<Button variant="danger">삭제</Button>
<Button isLoading={isSubmitting}>저장 중...</Button>
```

### TextField

```tsx
import { TextField } from '@/design-system';
// Controller 패턴과 함께 사용 (react-hook-form)
import { Controller } from 'react-hook-form';

<Controller
  name="email"
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      label="이메일"
      hint="예: user@example.com"
      error={errors.email?.message}
    />
  )}
/>
```

### Checkbox

```tsx
import { Checkbox } from '@/design-system';

// controlled
<Checkbox
  label="이용약관에 동의합니다"
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
/>

// react-hook-form
<Controller
  name="agree"
  control={control}
  render={({ field }) => (
    <Checkbox label="동의" checked={field.value} onChange={field.onChange} />
  )}
/>
```

### Badge

```tsx
import { Badge } from '@/design-system';

// variant: primary | success | warning | danger | neutral (기본: neutral)
// size: sm | md (기본: md)

<Badge variant="success">승인됨</Badge>
<Badge variant="danger" size="sm">거절됨</Badge>
<Badge variant="primary">펫시터</Badge>
```

### Skeleton

```tsx
import { Skeleton } from '@/design-system';

// width, height: px 단위 숫자 또는 CSS 문자열
// rounded: none | sm | md | lg | xl | 2xl | full

<Skeleton width={200} height={20} />
<Skeleton width="100%" height={160} rounded="2xl" />
<Skeleton width={48} height={48} rounded="full" />
```

---

## 6. 레이아웃 규칙

### 핵심 원칙: 컴포넌트는 외부 margin을 가지지 않는다

```tsx
// ❌ 잘못된 방법 — 컴포넌트 스스로 margin을 설정
function WorkerCard() {
  return <div className="mt-24">...</div>;
}

// ✅ 올바른 방법 — 부모가 Spacing으로 간격 제어
function WorkerList() {
  return (
    <Flex direction="column">
      <WorkerCard />
      <Spacing size={24} />
      <WorkerCard />
    </Flex>
  );
}
```

### Flex

```tsx
import { Flex } from '@/design-system';

// direction: row | column (기본: row)
// justify: start | center | end | between | around | evenly (기본: start)
// align: start | center | end | stretch | baseline (기본: center)
// gap: px 단위 숫자 (inline style로 적용)
// as: div | section | ul | li 등

<Flex direction="column" gap={16}>
  <Text size="t1">제목</Text>
  <Text size="b1">내용</Text>
</Flex>

<Flex justify="between" align="center">
  <Text>왼쪽</Text>
  <Button>오른쪽</Button>
</Flex>
```

### Spacing

```tsx
import { Spacing } from '@/design-system';

// size: 2 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64
// direction: vertical | horizontal (기본: vertical)

<Text>제목</Text>
<Spacing size={16} />
<Text size="b1">내용</Text>

// 가로 간격 (인라인 요소 사이)
<Flex>
  <Button>확인</Button>
  <Spacing size={8} direction="horizontal" />
  <Button variant="secondary">취소</Button>
</Flex>
```

### Grid

```tsx
import { Grid } from '@/design-system';

// cols: 1 | 2 | 3 | 4 | 6 | 12 (기본: 1)
// gap: px 단위 숫자

<Grid cols={3} gap={16}>
  <WorkerCard />
  <WorkerCard />
  <WorkerCard />
</Grid>
```

### Divider

```tsx
import { Divider } from '@/design-system';

// 가로 구분선 (기본)
<Divider />

// 세로 구분선 (Flex 내부)
<Flex align="center" gap={16}>
  <Text>메뉴 A</Text>
  <Divider direction="vertical" />
  <Text>메뉴 B</Text>
</Flex>
```

---

## 7. 컴포넌트 작성 규칙

### UI 컴포넌트 (Design System)

- 비즈니스 로직에 의존하지 않는다
- `react-hook-form`, `zustand` 등 상태 관리 라이브러리를 직접 import하지 않는다
- 표준 HTML 인터페이스(`value`, `onChange`, `disabled` 등)만 Props로 받는다
- `cn()` 유틸로 className을 병합한다

```tsx
// ✅ UI 컴포넌트 — 어디서든 재사용 가능
function TextField({ label, error, ...props }: TextFieldProps) {
  return <input {...props} />;
}

// ❌ 비즈니스 로직 주입 금지
function TextField({ register, ...props }: { register: UseFormRegister<...> }) {
  return <input {...register('email')} />;
}
```

### 비즈니스 컴포넌트 (Feature)

- 디자인 시스템 컴포넌트를 조합해 실제 기능을 만든다
- `Controller` 패턴으로 form 라이브러리와 연결한다

```tsx
// src/pages/login/LoginForm.tsx (비즈니스 레이어)
import { Button, Flex, Spacing, Text, TextField } from '@/design-system';
import { Controller, useForm } from 'react-hook-form';

export function LoginForm() {
  const { control, handleSubmit } = useForm();

  return (
    <Flex direction="column" gap={24}>
      <Text size="t1" as="h1">로그인</Text>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="이메일" type="email" />
        )}
      />
      <Button type="submit">로그인</Button>
    </Flex>
  );
}
```

### `cn()` 유틸 사용

```tsx
import { cn } from '@/design-system';

// 조건부 클래스
<div className={cn('rounded-xl p-16', isActive && 'bg-primary text-white', className)} />

// 충돌 클래스 자동 해소 (tailwind-merge)
cn('px-16 px-24')  // → 'px-24' (나중 것이 우선)
```

---

## 8. 아이콘 추가 방법

1. svg 파일 추가 (design-system/icons/assets/...Icon.svg)
2. npm run icons 스크립트 실행
3. 아이콘 컴포넌트 파일 생성 (design-system/icons/components)
4. index.ts에서 export
   export \* from './components/HeartIcon';
5. 사용 예시
   import { CheckIcon, ChevronDownIcon, CloseIcon } from '@/design-system/icons';

```

---

## 내가 추가한 것 (원본 대비 개선 사항)

| 항목 | 이유 |
|---|---|
| `cn()` 유틸 (`clsx` + `tailwind-merge`) | 조건부 클래스와 충돌 해소를 한 번에 처리. shadcn/ui 표준 패턴 |
| `Spinner` 독립 컴포넌트 | Button의 isLoading 외에도 페이지 로딩 등 재사용 가능 |
| `Divider` 레이아웃 | 수평/수직 구분선 표준화. HR 태그를 직접 쓰면 스타일 불일치 발생 |
| Status Colors (`success`, `warning`, `danger`) | Badge, TextField 에러, 알림 등에 필요한 시맨틱 컬러 추가 |
| `grey200` Primitive Token | Skeleton, 비활성 테두리 등에 grey100과 grey600 사이 값이 필요 |
| `TextField`에 `hint` prop 추가 | 에러가 없을 때 사용자 가이드 문구를 표시하는 UX 패턴 |
| `Button`에 `ghost` variant 추가 | 테두리만 있는 버튼이 실무에서 자주 필요 |
| 아이콘별 개별 파일 분리 | 트리 셰이킹 최적화. 쓰지 않는 아이콘은 번들에 포함되지 않음 |
| `aria-*` 접근성 속성 | 스크린 리더 지원. 처음부터 접근성을 챙기는 것이 리팩터링 비용을 줄임 |
```
