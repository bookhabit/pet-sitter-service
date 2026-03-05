# API Architecture Engineer — Project Memory

## Project Structure (react-rest)

- Schemas: `src/schemas/*.schema.ts` (Zod)
- Services: `src/services/*.service.ts` (pure axios calls)
- Data hooks: `src/hooks/*.ts` (TanStack Query — useQuery/useMutation)
- Logic hooks: `src/hooks/forms/use*.ts` (react-hook-form + mutation)
- Components: `src/components/jobs/` (Container + View pattern)
- Pages: `src/pages/jobs/` (thin — extracts params, renders container/form)

## Confirmed Patterns

### Data Hooks (src/hooks/jobs.ts)
- `useJobQuery(id)` — `useSuspenseQuery`, staleTime 3 min, queryKey: `['jobs', 'detail', id]`
- `useJobsQuery(params)` — `useSuspenseInfiniteQuery`, cursor pagination
- `useCreateJobMutation()` — invalidates `['jobs', 'list']`
- `useUpdateJobMutation(id)` — mutationFn `(data: UpdateJobInput) => jobService.updateJob(id, data)`, invalidates detail + list
- `useDeleteJobMutation()` — removes detail, invalidates list
- Query key factory: `jobQueryKeys.list(params)` / `jobQueryKeys.detail(id)`

### Logic Hook Pattern (src/hooks/forms/useCreateJobs.ts)
- useForm<CreateJobFormInput> with zodResolver(createJobFormSchema), mode: 'onBlur'
- useFieldArray for pets array
- Photo state delegated to useJobPhotoFiles(watchPets.length)
- Photo pre-upload via useUploadPhotosMutation before mutation
- serverError computed from uploadServerError ?? getHttpErrorStatus(error)
- Navigate on isSuccess via useEffect

### Edit Hook Pattern (src/hooks/forms/useEditJobs.ts)
- Same as create, but seeds defaultValues from useJobQuery(jobId)
- start_time/end_time: Date → "YYYY-MM-DDTHH:MM" via toDatetimeLocalString()
- Uses useUpdateJobMutation(jobId), navigates to /jobs/${jobId} on success

### Form Schema
- createJobFormSchema: pets[] age/species stored as string in form, converted to number/PetSpecies in onSubmit
- updateJobSchema = createJobSchema.partial()

### Page Pattern
- Pages extract useParams, guard against missing param with navigate+return null
- Pages are thin wrappers: `JobDetailPage` → `JobDetailContainer`, `JobCreatePage` → `JobWriteForm`

### Route Structure (App.tsx)
- `/jobs/write` and `/jobs/:jobId/edit` both inside `<RoleGuard allowedRoles={['PetOwner']} />`
- All protected routes wrapped in `<AuthGuard>` + `<MainLayout>` + `<PageAsyncBoundary>`

### Error Handling
- `getHttpErrorStatus(error)` extracts HTTP status from axios error shape
- Status 403 → permission message, 404 → not found message
- Upload errors caught in try/catch, set to uploadServerError state

### Design System Constraints (confirmed)
- `Text` color prop: only `'primary' | 'secondary' | 'white'` — use `className="text-danger"` for error colors
- `Badge` variants: `'primary' | 'success' | 'warning' | 'danger' | 'neutral'`
- `Flex` supports `as` prop: `'div' | 'section' | 'ul' | 'ol' | 'li'` etc.
- `Button` has `isLoading` prop (shows Spinner + disables automatically)
- Image component is at `@/design-system/atoms/Image/Image` (NOT in barrel index)

### Auth Store
- `useAuthStore((s) => s.user)` → `User | null`
- `user.roles: UserRole[]` — check role with `.includes('PetSitter')` or `.includes('PetOwner')`

### Boundary Components
- All from `@/components/common/globalException/boundary`:
  `EmptyBoundary`, `ErrorBoundary`, `QueryErrorBoundary`, `PageAsyncBoundary`
- Exception view files pattern: `src/components/{feature}/exception/{Feature}LoadingView.tsx` etc.

### SuspenseQuery Sub-Container Pattern
When `useSuspenseQuery` must be conditional (e.g., only for PetOwner), extract it into a private
sub-container function in the same file and render it conditionally wrapped in `Suspense + QueryErrorBoundary`.
This avoids React's rules-of-hooks conditional call restriction.

### Job Application Hooks (src/hooks/job-applications.ts)
- `useJobApplicationsQuery(jobId)` — useSuspenseQuery, queryKey: `['job-applications', 'byJob', jobId]`
- `useApplyJobMutation(jobId)` — mutationFn: `() => ...` (void variable, call with `mutate(undefined, ...)`)
- `useUpdateJobApplicationMutation(jobId)` — mutationFn: `({ jobApplicationId, data }) => ...`

### Modal System
- `useOpenModal()` returns `open(id, props)`
- Registry key `'confirm'` props: `{ title, message, confirmLabel, cancelLabel, variant, onConfirm }`

## Key File Paths
- `src/services/job.service.ts` — jobService (getJob, createJob, updateJob, deleteJob)
- `src/hooks/jobs.ts` — all job data/mutation hooks
- `src/hooks/forms/useCreateJobs.ts` — create form logic hook
- `src/hooks/forms/useEditJobs.ts` — edit form logic hook
- `src/hooks/forms/useJobPhotoFiles.ts` — photo file state
- `src/hooks/forms/useProfileEditForm.ts` — profile edit logic hook
- `src/hooks/user.ts` — useUserQuery, useUpdateUserMutation, useDeleteUserMutation
- `src/components/jobs/JobCreateForm.tsx` — create form UI
- `src/components/jobs/JobEditForm.tsx` — edit form UI
- `src/components/profile/ProfileContainer.tsx` — profile card data + edit toggle
- `src/components/profile/ProfileView.tsx` — profile card display (isMe branching)
- `src/components/profile/ProfileEditForm.tsx` — profile edit form UI
- `src/schemas/job.schema.ts` — Job, CreateJobInput, UpdateJobInput, CreateJobFormInput
- `src/schemas/user.schema.ts` — User, UpdateUserInput, userSchema, photoSchema
- `src/utils/get-http-error-status.ts` — HTTP status extractor

## Favorites Feature (implemented 2026-03-05)
- `src/hooks/favorites.ts` — `useMyFavoritesQuery` (suspense), `useMyFavoritesOptionalQuery(isPetSitter)` (regular useQuery with enabled), `useToggleFavoriteMutation`, `useRemoveFavoriteMutation`
- `src/services/favorite.service.ts` — toggle (POST), getMyFavorites (GET → Job[]), remove (DELETE)
- `src/components/favorites/` — FavoritesContainer + FavoritesSection + exception/{Empty,Loading,Error}View
- `src/pages/favorites/FavoritesPage.tsx` — QueryErrorBoundary + Suspense wrapping FavoritesContainer
- HeartIcon active color: `var(--red500)`, inactive: `var(--grey400)`, hover bg: `hover:bg-grey100`
- List page: favorites fetched once in JobListContainer via `useMyFavoritesOptionalQuery`, derived Set passed to each JobCard
- `useMyFavoritesOptionalQuery(isPetSitter: boolean)` — use this (not useSuspenseQuery) when role gates the fetch

## useQuery (non-suspense) Container Pattern
When a page has NO Suspense boundary around a data section, use `useQuery` (not `useSuspenseQuery`).
Handle states explicitly: `if (isPending) return <LoadingView />; if (isError || !user) return <ErrorView />;`
ProfileContainer is the reference implementation.

## Container Split for Dependent Hooks
When hook B requires data from hook A (and A may be undefined during loading):
- Outer component: calls hook A, guards loading/error, renders Inner only when data exists
- Inner component (not exported): calls hook B safely with guaranteed non-null data
- Avoids both non-null assertions and conditional hook calls
Reference: `ProfileContainer` (outer) + `ProfileReady` (inner) in `ProfileContainer.tsx`

## UpdateUserInput Payload Building
Build as `const payload: UpdateUserInput = {}` then assign only non-empty fields.
`z.union([z.string().validated..., z.literal('')])` pattern allows empty string in form while preserving type narrowing for payload exclusion check (`if (data.field !== '') payload.field = data.field`).

## Tailwind max-width
Use `max-w-[60rem]` (arbitrary value) — `max-w-600` is NOT defined in the spacing scale.
Confirmed pattern: `JobsPage.tsx`, `JobApplicationsPage.tsx`.
