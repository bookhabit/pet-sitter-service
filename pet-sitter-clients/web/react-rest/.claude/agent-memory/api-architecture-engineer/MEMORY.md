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

## Key File Paths
- `src/services/job.service.ts` — jobService (getJob, createJob, updateJob, deleteJob)
- `src/hooks/jobs.ts` — all job data/mutation hooks
- `src/hooks/forms/useCreateJobs.ts` — create form logic hook
- `src/hooks/forms/useEditJobs.ts` — edit form logic hook
- `src/hooks/forms/useJobPhotoFiles.ts` — photo file state
- `src/components/jobs/JobCreateForm.tsx` — create form UI
- `src/components/jobs/JobEditForm.tsx` — edit form UI
- `src/schemas/job.schema.ts` — Job, CreateJobInput, UpdateJobInput, CreateJobFormInput
- `src/utils/get-http-error-status.ts` — HTTP status extractor
