# PROJECT_RULE_SET.md

## 🛠 프로젝트 규칙 설정 (Linter & Formatter & TypeScript)

이 문서는 프로젝트의 코드 일관성을 유지하고, 런타임 에러를 방지하기 위한 정적 분석 및 빌드 전략을 정의합니다.
`/react-rest` 프로젝트의 초기 안정성을 책임질 Linter, Formatter, TypeScript 설정 가이드입니다.

---

## 1️⃣ ESLint 설정 (`.eslintrc.js`)

Airbnb 스타일 가이드를 기반으로 하며, 특히 **Import 순서 강제**와 **미사용 import 자동 제거**에 집중합니다.

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "airbnb",
    "airbnb-typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaFeatures: { jsx: true },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "import", "unused-imports"],
  rules: {
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
          {
            pattern: "@/design-system/**",
            group: "internal",
            position: "before",
          },
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "unused-imports/no-unused-imports": "error",
    "react/react-in-jsx-scope": "off",
    "react/jsx-props-no-spreading": "off",
    "import/prefer-default-export": "off",
  },
};
```

---

## 2️⃣ Prettier 설정 (`.prettierrc`)

코드 포맷팅과 함께 **Tailwind CSS 클래스 정렬을 자동화**합니다.

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindConfig": "./tailwind.config.js",
  "tailwindAttributes": ["className"]
}
```

**효과**

- `className` 내부 속성들이
  **레이아웃 → 모양 → 색상 → 내부 간격 순**으로 자동 재배치됩니다.

---

## 3️⃣ TypeScript 엄격 설정 (`tsconfig.json`)

컴파일 에러가 있을 경우 **빌드와 실행을 물리적으로 차단**하여 안정성을 확보합니다.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "Node",
    "jsx": "react-jsx",
    "allowJs": false,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,

    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    "isolatedModules": true,
    "noEmit": true,
    "noEmitOnError": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## 4️⃣ 빌드 스크립트 수정 (`package.json`)

빌드 전 `tsc`를 통한 **타입 검사를 강제**합니다.

```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

### 동작 원리

- `tsc`가 성공(에러 0개)해야만 `vite build`가 실행됩니다.
- `noEmitOnError` 설정 덕분에 타입 에러가 하나라도 있으면 빌드가 즉시 중단됩니다.

---

## ✅ 적용 목적 요약

- 코드 스타일 자동 통일 (Prettier)
- import 구조 및 unused 코드 강제 정리 (ESLint)
- 타입 안정성 최대 강화 (TypeScript strict mode)
- 타입 에러 발생 시 빌드 차단 (CI 안정성 확보)

---
