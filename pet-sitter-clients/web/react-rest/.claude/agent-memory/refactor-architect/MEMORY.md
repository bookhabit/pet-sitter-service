# Refactor Agent Memory

## Confirmed Project Patterns

### Error Status Extraction
All form hooks extract HTTP status from Axios errors.
Shared util: `src/utils/get-http-error-status.ts` — use in ALL form hooks.
Pattern: `getHttpErrorStatus(error)` returns `number | undefined`.

### Form Hook Structure (confirmed across 3 hooks)
- File: `src/hooks/forms/use<Feature>Form.ts`
- Pattern: `useForm(zodResolver)` → mutation hook → IIFE `serverError` → handlers → return flat object
- Error cast was previously repeated verbatim in useLoginForm, useSignupForm, useCreateJobs — now unified

### `setValue` for nested array fields
React Hook Form path for nested arrays must use typed template literal:
`setValue(\`pets.${index}.species\` as \`pets.${number}.species\`, value, { shouldValidate: true })`
NOT `as any`.

### Design System Components
- `Button` isLoading prop: use `isLoading={isPending}` NOT `disabled={isPending}` — isLoading handles disabling AND shows Spinner
- `TextArea` added to design system at `src/design-system/atoms/TextArea/` — same API as TextField (label, error, hint, forwardRef)
- `OptionSelector` extracted to `src/components/jobs/OptionSelector.tsx` for generic toggle-button groups
- Raw `<button>` inside forms is a violation — use `Button` from design system

### Job Mutation Return Type
`useCreateJobMutation` data is typed as `Job` (from `jobService.createJob: Promise<Job>`).
`Job` has `id: string`. No runtime `'id' in createdJob` guard needed.

## Common Violations Found
- `as any` in setValue nested path workaround
- `(error as { response?: { status?: number } }).response?.status` repeated across all form hooks
- `disabled={isPending}` instead of `isLoading={isPending}` on submit buttons
- Raw `<textarea>` bypassing design system
- Duplicate toggle-button JSX blocks in same file
- `error={undefined}` passed explicitly (redundant)
