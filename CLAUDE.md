# Project: NestJS Pet-Sitter API (REST + GraphQL)

## Architecture
- **Stack**: NestJS + Prisma + PostgreSQL + GraphQL (Code-first)
- **Auth**: JWT + Session DB hybrid
- **Pattern**: Services shared between REST (Controllers) + GraphQL (Resolvers)

## Modules (src/)

### users/
- **Service**: create, findOne, update, remove, findJobsByUserId, findJobApplicationsByUserId
- **Controller**: POST /users, GET /users/:id, PUT /users/:id, DELETE /users/:id, GET /users/:id/jobs, GET /users/:id/job-applications
- **Resolver**: register, login, updateUser, deleteUser, me, user, userJobs, userJobApplications
- **Auth**: @Public() for register/login, @CurrentUser() for authenticated user

### sessions/
- **Service**: login (returns user_id + auth_header)
- **Controller**: POST /sessions (login)
- **Used by**: UsersResolver for GraphQL login

### jobs/
- **Service**: create, findAll (with pagination/filtering), findOne, update, remove
- **Controller**: POST /jobs, GET /jobs, GET /jobs/:id, PUT /jobs/:id, DELETE /jobs/:id
- **Resolver**: createJob, jobs (with pagination), job, updateJob, deleteJob
- **Auth**: @Roles('PetOwner') for create/update/delete

### job-application/
- **Service**: create, findAllByJobId, update (status changes)
- **Controller**: POST /job-applications, GET /jobs/:jobId/job-applications, PATCH /job-applications/:id
- **Resolver**: applyToJob, jobApplicationsByJob, updateJobApplicationStatus
- **Auth**: @Roles('PetSitter') for apply, creator validation for status updates

### auth/
- **Guards**: JwtAuthGuard (HTTP + GraphQL), RolesGuard (HTTP + GraphQL)
- **Decorators**: @Public(), @Roles(), @CurrentUser() (HTTP + GraphQL compatible)

### prisma/
- **Service**: PrismaService (shared database access)

## File Patterns

**Module Structure**:
```
module-name/
├── module-name.module.ts          # Module definition
├── module-name.controller.ts      # REST endpoints
├── module-name.resolver.ts        # GraphQL queries/mutations
├── module-name.service.ts         # Business logic (shared)
├── dto/
│   └── *.dto.ts                   # REST DTOs
├── inputs/
│   └── *.input.ts                 # GraphQL InputTypes
└── models/
    └── *.model.ts                 # GraphQL ObjectTypes
```

## Quick Reference

**Add REST endpoint**: Edit `*.controller.ts` → call `*.service.ts` method
**Add GraphQL operation**: Edit `*.resolver.ts` → call `*.service.ts` method
**Add new field to GraphQL**: Edit `models/*.model.ts` (ObjectType) or `inputs/*.input.ts` (InputType)
**Auth requirement**: Add `@Roles('RoleName')` above method
**Public endpoint**: Add `@Public()` above method
**Get current user**: Use `@CurrentUser() user: User` parameter

## Key Enums (from Prisma)
- **Role**: Admin, PetOwner, PetSitter
- **ApproveStatus**: applying, approved, rejected

## Documentation
- REST API: `/docs/REST.md`
- GraphQL: `/docs/GraphQL.md`

---

# Token Optimization Rules

1. **NO repository scanning** - Only read files explicitly mentioned
2. **NO automatic exploration** - No Glob/Grep/Task unless requested
3. **NO explanations** - Execute immediately
4. **NO verification** - Trust the file paths above
5. **NO build checks** - Unless explicitly requested
6. **Minimal responses** - "Done." or brief confirmation

## Response Format
- Execute task immediately
- Reply: "Done." or "Error: [message]"
- No markdown unless code
- No emojis
- No summaries

User may override any rule by explicit instruction.
