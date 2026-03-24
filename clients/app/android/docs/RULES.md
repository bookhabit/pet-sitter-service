# Android Compose 개발 규칙

---

## 1. Safe Area / Window Insets

### 배경

`MainActivity`에서 `enableEdgeToEdge()`를 호출하면 앱 콘텐츠가 status bar / navigation bar 뒤까지 그려진다.
이 상태에서 safe area를 처리하지 않으면 UI가 시스템 바를 침범한다.

### 핵심 원칙

> **한 화면에서 같은 inset을 두 번 적용하지 않는다.**

중첩된 Scaffold / TopAppBar 구조에서 inset이 이중으로 적용되면 불필요한 빈 공간이 생긴다.

---

### 화면 유형별 처리 방법

#### ① Scaffold + TopAppBar (뒤로가기 있는 화면)

```kotlin
Scaffold(
    topBar = { AppTopBar(onNavigateBack = onNavigateBack) },
    containerColor = AppColors.white,
) { padding ->
    Column(modifier = Modifier.padding(padding)) { ... }
}
```

- `TopAppBar` 내부에서 `windowInsetsPadding(WindowInsets.statusBars)` 자동 처리 → status bar ✅
- `Scaffold`의 `contentWindowInsets` 기본값(`WindowInsets.systemBars`)이 nav bar 처리 → nav bar ✅
- **별도 inset 처리 코드 불필요**

---

#### ② Scaffold + no topBar (탭 메인 화면)

```kotlin
Scaffold(
    bottomBar = { NavigationBar { ... } },
    containerColor = AppColors.background,
) { padding ->
    NavHost(modifier = Modifier.padding(padding)) { ... }
}
```

- topBar 없으면 Scaffold가 status bar inset을 `contentPadding`에 직접 포함 → status bar ✅
- `NavigationBar`가 내부에서 `windowInsetsPadding(NavigationBarDefaults.windowInsets)` 처리 → nav bar ✅
- **별도 inset 처리 코드 불필요**

---

#### ③ Scaffold 없는 bare 화면 (LoginScreen 등)

```kotlin
Column(
    modifier = Modifier
        .fillMaxSize()
        .windowInsetsPadding(WindowInsets.systemBars) // ← 반드시 명시
        .verticalScroll(rememberScrollState())
        .padding(horizontal = 24.dp, vertical = 32.dp),
) { ... }
```

- Scaffold 없으면 inset 처리 주체가 없으므로 root Modifier에 **직접 명시 필수**
- `WindowInsets.systemBars` = status bar + nav bar 한 번에 처리

---

### 금지 패턴

#### ❌ 외부 Scaffold로 inset을 미리 소비한 뒤 내부에 Scaffold 중첩

```kotlin
// AppNavHost 에서
Scaffold(contentWindowInsets = WindowInsets.systemBars) { innerPadding ->
    NavHost(modifier = Modifier.padding(innerPadding)) {
        composable("register") {
            RegisterScreen() // ← 내부 Scaffold + TopAppBar 가 또 inset 적용 → 이중 패딩!
        }
    }
}
```

외부 Scaffold가 `innerPadding`으로 statusBarHeight를 적용하고,
내부 TopAppBar가 또 statusBarHeight를 적용하면 빈 공간이 두 배로 생긴다.

#### ❌ topBar 슬롯에 raw 컴포넌트 직접 삽입

```kotlin
Scaffold(
    topBar = {
        IconButton(onClick = onBack) { ... } // ← windowInsetsPadding 없음 → status bar 침범!
    }
)
```

`TopAppBar`를 사용하지 않으면 status bar inset이 처리되지 않는다.

---

### 요약표

| 화면 구조 | Status Bar | Nav Bar | 처리 방법 |
|-----------|-----------|---------|-----------|
| `Scaffold` + `AppTopBar` | `TopAppBar` 내부 자동 | Scaffold 자동 | 코드 추가 불필요 |
| `Scaffold` + no topBar | Scaffold 자동 | Scaffold 자동 | 코드 추가 불필요 |
| bare 화면 (Scaffold 없음) | 수동 | 수동 | `Modifier.windowInsetsPadding(WindowInsets.systemBars)` |

---

## 2. 공용 컴포넌트 규칙

### AppTopBar

뒤로가기 버튼이 있는 모든 화면의 상단 바는 `AppTopBar`를 사용한다.

```kotlin
// ui/components/AppTopBar.kt
AppTopBar(
    title = "화면 제목",       // 선택 — 비워두면 title 영역 없음
    onNavigateBack = { ... },  // 선택 — null 이면 뒤로가기 버튼 숨김
)
```

- M3 `TopAppBar` 기반 → status bar inset 자동 처리
- 모든 화면에서 일관된 상단 바 높이 보장

---

## 3. 네비게이션 구조 규칙

```
AppNavHost
  ├─ [비인증] NavHost (Scaffold 래퍼 없음)
  │    ├─ LoginScreen   → bare Column + windowInsetsPadding
  │    └─ RegisterScreen → Scaffold + AppTopBar
  └─ [인증] MainTabScaffold
       └─ Scaffold (NavigationBar)
            └─ NavHost
                 ├─ JobListScreen
                 ├─ FavoritesScreen
                 ├─ ChatListScreen
                 └─ ProfileScreen
```

- 비인증 플로우: **NavHost를 Scaffold로 감싸지 않는다** — 이중 inset 원인
- 인증 플로우: `MainTabScaffold` 하나가 모든 탭의 inset을 관리

---

## 4. 신규 화면 추가 체크리스트

- [ ] `Scaffold` 사용 여부 결정
- [ ] topBar 필요 시 `AppTopBar` 사용 (raw `IconButton` 금지)
- [ ] Scaffold 없는 bare 화면이면 root에 `windowInsetsPadding(WindowInsets.systemBars)` 추가
- [ ] 중첩 Scaffold 구조가 생겼는지 확인 — 생겼다면 이중 inset 검토
