# UI Design System Integrator — Agent Memory

## Design System Location
- All atoms: `src/design-system/atoms/` (Badge, Button, Checkbox, Overlay, Skeleton, Spinner, Text, TextArea, TextField)
- Layouts: `src/design-system/layouts/` (Divider, Flex, Grid, Spacing)
- Icons: `src/design-system/icons/` — import from `@/design-system/icons`
- Single public API: `@/design-system` for all atoms/layouts; `@/design-system/icons` for icons
- Docs: `docs/DESIGN_SYSTEM.md`

## Key Design Tokens (Tailwind classes)
- Colors: `bg-primary`/`text-primary` (#3182f6), `text-text-primary` (#191f28), `text-text-secondary` (#4e5968), `bg-background`/`border-grey200` (#e5e8eb), `text-danger`/`bg-danger` (#f04438)
- CSS vars: `var(--blue500)`, `var(--grey600)` usable in icon `color` prop
- Typography: `text-t1` (24px/700), `text-t2` (20px/700), `text-b1` (16px/400), `text-b2` (14px/400), `text-caption` (12px)
- Spacing: only 2/4/8/12/16/24/32/48/64 (px, maps to Tailwind as `p-16` = 1.6rem since 1rem=10px)
- Radius: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-full`

## Component APIs (confirmed)
- `<Text size="t1|t2|b1|b2|caption" color="primary|secondary|white" as="h1|h2|p|span|div|label">`
- `<Button variant="primary|secondary|danger|ghost" size="sm|md|lg" isLoading type="button|submit">`
- `<TextField label error hint leftIcon ...inputProps>` (forwardRef)
- `<TextArea label error hint rows ...textareaProps>` (forwardRef)
- `<Badge variant="primary|success|warning|danger|neutral" size="sm|md">`
- `<Flex direction gap align justify wrap as>` — gap is inline style (px int)
- `<Spacing size={2|4|8|12|16|24|32|48|64} direction="vertical|horizontal">`
- `<Divider direction="horizontal|vertical">`

## Section Card Pattern (established in JobCreateForm)
```tsx
<div className="rounded-2xl border border-grey200 bg-white p-24">
  <Flex align="center" gap={8} className="mb-20">
    <div className="flex size-32 items-center justify-center rounded-lg bg-primary/10">
      <SomeIcon size={18} color="var(--blue500)" />
    </div>
    <Text size="t2" as="h2">Section Title</Text>
  </Flex>
  {/* section content */}
</div>
```

## Available Icons (all in @/design-system/icons)
BellIcon, BriefcaseIcon, CalendarIcon, CheckIcon, ChevronDownIcon, ChevronRight,
ClockIcon, CloseIcon, DogIcon, DollarSignIcon, EditIcon, EyeIcon, FilterIcon,
HeartIcon, HomeIcon, LockIcon, LogoIcon, LogoutIcon, MailIcon, MapIcon,
MessageCircleIcon, PhoneIcon, PlusIcon, SearchIcon, SettingsIcon, StarIcon,
TrashIcon, UserIcon, XIcon

## Established Pages (for visual reference)
- `src/components/auth/LoginForm.tsx` — polished auth form with icon, gradient bg, card layout
- `src/components/auth/AuthFormLayout.tsx` — white card `rounded-2xl bg-white p-32 shadow-xl`

## Rules Confirmed
- Zero inline styles (no `style={{ }}`) — Flex gap is the only exception (design system internal)
- Spacing between sibling sections: `<Spacing size={16} />` not margin classes
- Error banners: `rounded-xl border border-red-200 bg-red-50 px-16 py-12 text-b2 text-danger`
- Figma MCP requires the file to be open and active in the Figma desktop app
