# UI Agent Memory

## Design System — Quick Reference
See: `.claude/agent-memory/ui-design-system-integrator/MEMORY.md` for full details.

## Key Rules
- Import atoms from `@/design-system`, icons from `@/design-system/icons`
- No inline styles ever — only Tailwind classes
- Use `<Spacing>` between components, not margin classes on components
- Section card pattern: `rounded-2xl border border-grey200 bg-white p-24`
- Pet/nested cards: `rounded-xl border border-grey200 bg-background p-20`

## Figma MCP
- Requires Figma desktop app open with the target file as the active tab
- If unavailable, proceed with design system visual language from existing pages
