# Clean Agent Memory

## Key File Locations
- Form hooks: `src/hooks/forms/`
- Data hooks: `src/hooks/jobs.ts`, `src/hooks/auth.ts`
- Design system: `src/design-system/` — import via `@/design-system`
- Shared utils: `src/utils/`

## Design System Exports (as of current session)
Atoms: Badge, Button, Checkbox, Overlay, Skeleton, Spinner, Text, TextArea, TextField
Layouts: Divider, Flex, Grid, Spacing
Utils: cn

## Shared Utilities Created
- `src/utils/get-http-error-status.ts` — extracts HTTP status from Axios error shape

## Job Feature Components
- `src/components/jobs/OptionSelector.tsx` — generic toggle-button group (species, price type selectors)
- `src/components/jobs/JobCreateForm.tsx` — job creation form view
- `src/hooks/forms/useCreateJobs.ts` — job creation form logic + submit orchestration
- `src/hooks/forms/useJobPhotoFiles.ts` — job/pet photo file state (petCount param syncs petFiles array)
