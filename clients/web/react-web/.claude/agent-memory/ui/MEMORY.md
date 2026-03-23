# UI Agent Memory

## Design System — Quick Reference
See: `.claude/agent-memory/ui-design-system-integrator/MEMORY.md` for full details.

## Key Rules
- Import atoms from `@/design-system`, icons from `@/design-system/icons`
- No inline styles ever — only Tailwind classes
- Use `<Spacing>` between components, not margin classes on components
- Section card pattern (Figma-confirmed): `rounded-2xl bg-white p-24 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]`
- Pet/nested cards (Figma-confirmed): `rounded-xl bg-background p-16 flex gap-16`
- Pet avatar: `h-[6.4rem] w-[6.4rem] shrink-0 overflow-hidden rounded-full`
- Hero image: `h-[40rem] w-full overflow-hidden rounded-b-2xl`
- Photo grid item: `h-[12rem] w-[12rem] overflow-hidden rounded-xl`
- Section divider inside a card: `border-t border-grey200` with `mt-24 pt-24`

## Figma MCP
- Requires Figma desktop app open with the target file as the active tab
- If unavailable, proceed with design system visual language from existing pages

## Design Token Mappings (Figma hex → Tailwind class)
- `#0a0a0a` → `text-text-primary` (default Text color)
- `#4a5565` → `text-text-secondary` (color="secondary")
- `#6a7282` → `text-text-secondary`
- `#f9fafb` → `bg-background`
- Shadow `0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)` → section card shadow
- Icon color secondary: `var(--grey500)`
- Heart filled: `var(--red500)`, unfilled: `var(--grey400)`

## Available Icons (design-system/icons)
BellIcon, BriefcaseIcon, CalendarIcon, CheckIcon, ChevronDownIcon, ChevronRight,
ClockIcon, CloseIcon, DogIcon, DollarSignIcon, EditIcon, EyeIcon, FilterIcon,
HeartIcon, HomeIcon, LockIcon, LogoIcon, LogoutIcon, MailIcon, MapIcon,
MessageCircleIcon, PhoneIcon, PlusIcon, SearchIcon, SettingsIcon, StarIcon,
TrashIcon, UserIcon, XIcon

## Image Component
- `import { Image } from '@/design-system/atoms/Image/Image'`
- Props: `src`, `alt`, `className`, `fallback?`
- Wrap in a sized div with overflow-hidden for aspect ratio control
- Handles skeleton loading and fallback internally

## Text Component Sizes
- `t1` = h1 title (24px bold), `t2` = section heading (18px semibold)
- `b1` = body (16px), `b2` = small body (14px), `caption` = caption

## Flex Component
- gap prop takes px number (e.g. gap={12} → 1.2rem gap)
- as prop supports: div, section, article, main, ul, ol, li, etc.

## formatJobDateTime
Use for schedule display: "M월 D일 (요일) HH:MM - HH:MM" (same-day) or date range
Imported from `@/utils/format`

Notes:
- Agent threads always have their cwd reset between bash calls — use absolute paths only.
- In your final response always share relevant file names and code snippets with absolute paths.
- For clear communication with the user avoid using emojis.
- Do not use a colon before tool calls.
