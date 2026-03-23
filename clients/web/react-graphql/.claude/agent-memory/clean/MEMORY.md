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

## Global Modal System
- Store: `src/store/useModalStore.ts` — `useOpenModal()` / `useCloseModal()` selector hooks
- Renderer: `src/components/GlobalModal.tsx` — mounted once in App.tsx
- Registry: `src/components/modals/registry.ts` — add new modals here (ModalRegistry type + MODAL_COMPONENTS map)
- Built-in modal: `src/components/modals/ConfirmModal.tsx` — id: `'confirm'`, variant: `'primary' | 'danger'`
- Usage pattern: `const openModal = useOpenModal(); openModal('confirm', { title, message, onConfirm, variant })`
- Container manages modal open intent; View receives only `() => void` handlers (no modal state in View)

## Job Feature Components
- `src/components/jobs/OptionSelector.tsx` — generic toggle-button group (species, price type selectors)
- `src/components/jobs/JobCreateForm.tsx` — job creation form view
- `src/components/jobs/JobDetailContainer.tsx` — data + auth + modal orchestration; passes onDelete/onEdit/onNavigateBack to View
- `src/components/jobs/JobDetailView.tsx` — pure UI; props: job, isOwner, onDelete, onEdit, onNavigateBack, isDeleting
- `src/hooks/forms/useCreateJobs.ts` — job creation form logic + submit orchestration
- `src/hooks/forms/useJobPhotoFiles.ts` — job/pet photo file state (petCount param syncs petFiles array)
