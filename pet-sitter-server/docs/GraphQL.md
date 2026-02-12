# 🚀 GraphQL API 아키텍처 가이드

> **NestJS + GraphQL + Prisma** 구조 및 테스트 방법

---

## 📋 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [디렉토리 구조](#디렉토리-구조)
3. [계층별 역할](#계층별-역할)
4. [데이터 흐름](#데이터-흐름)
5. [인증 시스템](#인증-시스템)
6. [테스트 방법](#테스트-방법)
7. [리뷰 기능 테스트](#리뷰-작성--petowner--petsitter-job5-시나리오)
8. [위치·가격 정보 테스트](#위치가격-정보-포함-공고-등록-location--price)
9. [즐겨찾기 테스트](#즐겨찾기-토글-togglefavorite--sitter1-시나리오)
10. [실전 예시](#실전-예시)
11. [사진 업로드](./PHOTO_UPLOAD.md#graphql-api)

---

## 🏗️ 아키텍처 개요

### GraphQL 계층 구조

```
┌─────────────────────────────────────────────────────┐
│                   GraphQL Client                     │
│            (Apollo Sandbox / Playground)             │
└─────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST /graphql
                          ▼
┌─────────────────────────────────────────────────────┐
│                  Apollo Server                       │
│              (GraphQL Module)                        │
│   - autoSchemaFile: src/schema.gql                  │
│   - playground: true                                 │
│   - context: JWT 전달                                │
└─────────────────────────────────────────────────────┘
                          │
                          │ Query/Mutation
                          ▼
┌─────────────────────────────────────────────────────┐
│                    Resolver                          │
│   - @Query, @Mutation, @ResolveField               │
│   - @Args, @CurrentUser                             │
│   - @Public, @Roles                                 │
└─────────────────────────────────────────────────────┘
                          │
                          │ 비즈니스 로직 호출
                          ▼
┌─────────────────────────────────────────────────────┐
│                    Service                           │
│   - 비즈니스 로직                                     │
│   - Prisma Client 사용                               │
│   - DTO ↔ Entity 변환                               │
└─────────────────────────────────────────────────────┘
                          │
                          │ DB 쿼리
                          ▼
┌─────────────────────────────────────────────────────┐
│                  Prisma Client                       │
│                  (ORM Layer)                         │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 디렉토리 구조

```
src/
├── app.module.ts              # GraphQL 설정 포함
│
├── users/                     # User 모듈 (예시)
│   ├── users.module.ts        # 모듈 등록
│   ├── users.resolver.ts      # GraphQL Resolver ⭐
│   ├── users.service.ts       # 비즈니스 로직 (REST와 공유)
│   │
│   ├── models/                # GraphQL ObjectType (응답)
│   │   ├── user.model.ts      # @ObjectType()
│   │   └── auth-payload.model.ts
│   │
│   └── inputs/                # GraphQL InputType (요청)
│       ├── register.input.ts  # @InputType()
│       ├── login.input.ts
│       └── update-user.input.ts
│
├── auth/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts  # HTTP + GraphQL 지원
│   │   └── roles.guard.ts     # 역할 기반 권한 체크
│   └── decorators/
│       ├── current-user.decorator.ts  # @CurrentUser()
│       ├── public.decorator.ts        # @Public()
│       └── roles.decorator.ts         # @Roles()
│
├── prisma/
│   ├── prisma.service.ts      # Prisma Client 래퍼
│   └── prisma.module.ts
│
└── schema.gql                 # 자동 생성된 GraphQL 스키마 ⭐
```

---

## 🔍 계층별 역할

### 1. **Resolver** (`users.resolver.ts`)

**역할**: GraphQL 요청을 받아 Service로 전달 (Controller 역할)

```typescript
@Resolver(() => UserModel)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  // Mutation: 데이터 생성/수정/삭제
  @Mutation(() => UserModel, { description: '회원가입' })
  @Public()  // 인증 불필요
  async register(@Args('data') data: RegisterInput): Promise<User> {
    return this.usersService.create(data);
  }

  // Query: 데이터 조회
  @Query(() => UserModel, { description: '현재 사용자 조회' })
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
```

**핵심 데코레이터:**
- `@Resolver()` - Resolver 클래스 선언
- `@Query()` - 조회 작업
- `@Mutation()` - 생성/수정/삭제 작업
- `@Args()` - 파라미터 받기
- `@CurrentUser()` - 현재 인증된 사용자 가져오기

---

### 2. **Service** (`users.service.ts`)

**역할**: 비즈니스 로직 (REST와 GraphQL이 공유)

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto | RegisterInput): Promise<User> {
    // 1. 이메일 중복 체크
    const existsUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existsUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 2. 사용자 생성
    return this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: dto.email,
        full_name: dto.full_name,
        password: dto.password,
        roles: dto.roles,
      }
    });
  }
}
```

**특징:**
- ✅ **REST와 GraphQL이 동일한 Service 사용**
- ✅ Prisma Client를 통한 DB 접근
- ✅ 비즈니스 로직 집중 (검증, 변환, 에러 처리)

---

### 3. **ObjectType** (`models/user.model.ts`)

**역할**: GraphQL 응답 스키마 (Response DTO 역할)

```typescript
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles',
});

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  full_name: string;

  @Field(() => [Role])
  roles: Role[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // ⚠️ password는 노출하지 않음 (보안)
}
```

**특징:**
- `@ObjectType()` - GraphQL 타입 선언
- `@Field()` - 노출할 필드 지정
- 민감한 정보(password) 제외 가능

---

### 4. **InputType** (`inputs/register.input.ts`)

**역할**: GraphQL 요청 스키마 (Request DTO 역할)

```typescript
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsArray, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @Field()
  @IsString()
  @MinLength(2)
  full_name: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;

  @Field(() => [Role])
  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
```

**특징:**
- `@InputType()` - GraphQL Input 타입 선언
- `@Field()` - 입력 필드 정의
- `class-validator` 검증 데코레이터 사용 가능

---

## 🔄 데이터 흐름

### 회원가입 예시

```
1. GraphQL Client
   mutation {
     register(data: {
       email: "test@example.com"
       full_name: "Test User"
       password: "password123"
       roles: [PetOwner]
     }) {
       id
       email
     }
   }

2. Apollo Server
   - autoSchemaFile에서 스키마 검증
   - ValidationPipe로 입력 검증

3. UsersResolver.register()
   - @Args('data')로 RegisterInput 받음
   - @Public() 데코레이터로 인증 스킵

4. UsersService.create()
   - 이메일 중복 체크
   - Prisma로 User 생성

5. Prisma Client
   - INSERT INTO "User" ...

6. PostgreSQL
   - 데이터 저장

7. Response (UserModel)
   {
     id: "uuid",
     email: "test@example.com",
     full_name: "Test User",
     roles: ["PetOwner"],
     createdAt: "2026-02-09T...",
     updatedAt: "2026-02-09T..."
   }
```

---

## 🔐 인증 시스템

### JWT 기반 인증 (HTTP + GraphQL 공용)

#### 1. **JwtAuthGuard** (`auth/guards/jwt-auth.guard.ts`)

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. @Public() 데코레이터 확인
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) return true;

    // 2. HTTP / GraphQL 분기
    const request = this.getRequest(context);
    const authHeader = request.headers.authorization;

    // 3. JWT 검증
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. User 조회 및 Session 확인
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    // 5. request.user에 저장
    request.user = user;
    return true;
  }

  private getRequest(context: ExecutionContext) {
    const contextType = context.getType<string>();
    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }
}
```

#### 2. **인증 필요 Resolver**

```typescript
@Query(() => UserModel)
async me(@CurrentUser() user: User): Promise<User> {
  // @CurrentUser()가 request.user를 자동 주입
  return user;
}
```

#### 3. **역할 기반 권한 체크**

```typescript
@Mutation(() => UserModel)
@Roles(Role.Admin)  // Admin만 접근 가능
async updateAnyUser(@Args('id') id: string): Promise<User> {
  // ...
}
```

---

## 🧪 테스트 방법

### 1. 서버 시작

```bash
npm run start:dev
```

### 2. GraphQL Playground 접속

브라우저에서 접속: **http://localhost:3000/graphql**

---

### 3. 회원가입 (Public)

```graphql
mutation Register {
  register(data: {
    email: "test@example.com"
    full_name: "Test User"
    password: "password123"
    roles: [PetOwner]
  }) {
    id
    email
    full_name
    roles
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "register": {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "email": "test@example.com",
      "full_name": "Test User",
      "roles": ["PetOwner"],
      "createdAt": "2026-02-09T10:00:00.000Z"
    }
  }
}
```

---

### 4. 로그인 (Public)

```graphql
mutation Login {
  login(data: {
    email: "test@example.com"
    password: "password123"
  }) {
    user_id
    auth_header
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "login": {
      "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "auth_header": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**⚠️ auth_header 값을 복사하세요!**

---

### 5. 인증 필요한 Query 테스트

#### HTTP Headers 설정

Playground 하단의 **HTTP HEADERS** 탭 클릭 후:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Query 실행

```graphql
query Me {
  me {
    id
    email
    full_name
    roles
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "me": {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "email": "test@example.com",
      "full_name": "Test User",
      "roles": ["PetOwner"],
      "createdAt": "2026-02-09T10:00:00.000Z"
    }
  }
}
```

---

### 6. 사용자 조회 (인증 필요)

```graphql
query GetUser {
  user(id: "d290f1ee-6c54-4b01-90e6-d701748f0851") {
    id
    email
    full_name
    roles
  }
}
```

---

### 7. 사용자 수정 (본인 또는 Admin만)

```graphql
mutation UpdateUser {
  updateUser(
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851"
    data: {
      full_name: "Updated Name"
    }
  ) {
    id
    full_name
    updatedAt
  }
}
```

---

### 8. 사용자 삭제 (본인 또는 Admin만)

```graphql
mutation DeleteUser {
  deleteUser(id: "d290f1ee-6c54-4b01-90e6-d701748f0851")
}
```

**예상 응답:**
```json
{
  "data": {
    "deleteUser": true
  }
}
```

---

### 9. 에러 케이스 테스트

#### Authorization 헤더 없이 인증 필요한 Query 호출

```graphql
query Me {
  me {
    id
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "Authorization header is missing",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ],
  "data": null
}
```

---

### 10. 구인공고 등록 (PetOwner 역할 필요)

**⚠️ 주의: PetOwner 역할로 회원가입한 사용자의 JWT 토큰 필요**

먼저 PetOwner로 회원가입:
```graphql
mutation RegisterPetOwner {
  register(data: {
    email: "owner@example.com"
    full_name: "Pet Owner"
    password: "password123"
    roles: [PetOwner]
  }) {
    id
    email
    roles
  }
}
```

로그인하여 JWT 토큰 획득:
```graphql
mutation LoginOwner {
  login(data: {
    email: "owner@example.com"
    password: "password123"
  }) {
    user_id
    auth_header
  }
}
```

HTTP Headers 설정 후 구인공고 등록:
```graphql
mutation CreateJob {
  createJob(data: {
    start_time: "2026-02-10T09:00:00Z"
    end_time: "2026-02-10T18:00:00Z"
    activity: "산책 및 놀이 활동 도우미를 구합니다"
    pets: [
      {
        name: "초코"
        age: 3
        species: Dog
        breed: "골든 리트리버"
        size: "대형"
      },
      {
        name: "모카"
        age: 2
        species: Cat
        breed: "코리안 숏헤어"
      }
    ]
  }) {
    id
    creator_user_id
    start_time
    end_time
    activity
    pets {
      id
      name
      age
      species
      breed
      size
    }
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "createJob": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "creator_user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "start_time": "2026-02-10T09:00:00.000Z",
      "end_time": "2026-02-10T18:00:00.000Z",
      "activity": "산책 및 놀이 활동 도우미를 구합니다",
      "pets": [
        {
          "id": "pet-uuid-1",
          "name": "초코",
          "age": 3,
          "species": "Dog",
          "breed": "골든 리트리버",
          "size": "대형"
        },
        {
          "id": "pet-uuid-2",
          "name": "모카",
          "age": 2,
          "species": "Cat",
          "breed": "코리안 숏헤어",
          "size": null
        }
      ],
      "createdAt": "2026-02-09T15:00:00.000Z"
    }
  }
}
```

---

### 11. 구인공고 조회 (인증 필요)

```graphql
query GetJob {
  job(id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890") {
    id
    creator_user_id
    start_time
    end_time
    activity
    pets {
      name
      age
      species
      breed
      size
    }
    createdAt
    updatedAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "job": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "creator_user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "start_time": "2026-02-10T09:00:00.000Z",
      "end_time": "2026-02-10T18:00:00.000Z",
      "activity": "산책 및 놀이 활동 도우미를 구합니다",
      "pets": [
        {
          "name": "초코",
          "age": 3,
          "species": "Dog",
          "breed": "골든 리트리버",
          "size": "대형"
        },
        {
          "name": "모카",
          "age": 2,
          "species": "Cat",
          "breed": "코리안 숏헤어",
          "size": null
        }
      ],
      "createdAt": "2026-02-09T15:00:00.000Z",
      "updatedAt": "2026-02-09T15:00:00.000Z"
    }
  }
}
```

---

### 12. 구인공고 수정 (본인 또는 Admin만)

```graphql
mutation UpdateJob {
  updateJob(
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    data: {
      activity: "산책 및 놀이 활동 도우미를 구합니다 (수정됨)"
      end_time: "2026-02-10T20:00:00Z"
    }
  ) {
    id
    activity
    end_time
    updatedAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "updateJob": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "activity": "산책 및 놀이 활동 도우미를 구합니다 (수정됨)",
      "end_time": "2026-02-10T20:00:00.000Z",
      "updatedAt": "2026-02-09T15:30:00.000Z"
    }
  }
}
```

**⚠️ 권한 에러 (다른 사용자가 수정 시도):**
```json
{
  "errors": [
    {
      "message": "You can only update your own job",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ],
  "data": null
}
```

---

### 13. 구인공고 삭제 (본인 또는 Admin만)

```graphql
mutation DeleteJob {
  deleteJob(id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
}
```

**예상 응답:**
```json
{
  "data": {
    "deleteJob": true
  }
}
```

**⚠️ 권한 에러 (다른 사용자가 삭제 시도):**
```json
{
  "errors": [
    {
      "message": "You can only delete your own job",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ],
  "data": null
}
```

---

### 14. 구인공고 등록 실패 케이스

#### PetSitter 역할로 등록 시도 (권한 없음)

```graphql
mutation CreateJobAsSitter {
  createJob(data: {
    start_time: "2026-02-10T09:00:00Z"
    end_time: "2026-02-10T18:00:00Z"
    activity: "산책 도우미"
    pets: [
      {
        name: "멍멍이"
        age: 2
        species: Dog
        breed: "포메라니안"
      }
    ]
  }) {
    id
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "Forbidden resource",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ],
  "data": null
}
```

#### 유효성 검증 실패 (activity 글자수 부족)

```graphql
mutation CreateJobInvalid {
  createJob(data: {
    start_time: "2026-02-10T09:00:00Z"
    end_time: "2026-02-10T18:00:00Z"
    activity: "짧음"
    pets: [
      {
        name: "멍멍이"
        age: 2
        species: Dog
        breed: "포메라니안"
      }
    ]
  }) {
    id
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "validationErrors": [
          "activity must be at least 5 characters long"
        ]
      }
    }
  ],
  "data": null
}
```

---

### 15. 구인공고 목록 조회 (필터링 + 페이지네이션)

**기본 조회:**
```graphql
query Jobs {
  jobs {
    items {
      id
      activity
      start_time
      end_time
      pets {
        name
        species
        age
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "jobs": {
      "items": [
        {
          "id": "job-uuid-1",
          "activity": "산책 도우미",
          "start_time": "2026-02-10T09:00:00.000Z",
          "end_time": "2026-02-10T18:00:00.000Z",
          "pets": [
            {
              "name": "초코",
              "species": "Dog",
              "age": 3
            }
          ]
        }
      ],
      "pageInfo": {
        "hasNextPage": true,
        "endCursor": "job-uuid-20"
      }
    }
  }
}
```

---

### 16. 구인공고 목록 - 날짜 필터링

```graphql
query FilteredJobs {
  jobs(
    filter: {
      startTimeAfter: "2026-02-01T00:00:00Z"
      endTimeBefore: "2026-12-31T23:59:59Z"
    }
  ) {
    items {
      id
      activity
      start_time
      end_time
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

### 17. 구인공고 목록 - Activity 검색

```graphql
query SearchJobs {
  jobs(
    filter: {
      activity: "산책"
    }
  ) {
    items {
      id
      activity
    }
    pageInfo {
      hasNextPage
    }
  }
}
```

---

### 18. 구인공고 목록 - Pet 필터링

```graphql
query FilterByPets {
  jobs(
    filter: {
      pets: {
        species: [Dog]
        ageAbove: 1
        ageBelow: 5
      }
    }
  ) {
    items {
      id
      activity
      pets {
        name
        species
        age
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
```

---

### 19. 구인공고 목록 - 복합 필터 + 페이지네이션

```graphql
query ComplexSearch {
  jobs(
    filter: {
      startTimeAfter: "2026-02-01T00:00:00Z"
      activity: "산책"
      pets: {
        species: [Dog, Cat]
        ageBelow: 10
      }
    }
    pagination: {
      limit: 10
    }
  ) {
    items {
      id
      activity
      start_time
      pets {
        name
        species
        age
        breed
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

### 20. 구인공고 목록 - Cursor 기반 페이지네이션

```graphql
# 첫 페이지
query FirstPage {
  jobs(pagination: { limit: 10 }) {
    items {
      id
      activity
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# 다음 페이지 (endCursor 사용)
query NextPage {
  jobs(
    pagination: {
      limit: 10
      cursor: "job-uuid-10"
    }
  ) {
    items {
      id
      activity
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "jobs": {
      "items": [
        {
          "id": "job-uuid-11",
          "activity": "반려견 산책"
        },
        {
          "id": "job-uuid-12",
          "activity": "고양이 돌봄"
        }
      ],
      "pageInfo": {
        "hasNextPage": true,
        "endCursor": "job-uuid-20"
      }
    }
  }
}
```

---

### 21. 구인공고 지원하기 (PetSitter)

**HTTP Headers:**
```json
{
  "Authorization": "Bearer <PetSitter_JWT_TOKEN>"
}
```

**Mutation:**
```graphql
mutation ApplyToJob {
  applyToJob(jobId: "job-uuid") {
    id
    status
    user_id
    job_id
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "applyToJob": {
      "id": "application-uuid",
      "status": "applying",
      "user_id": "petsitter-uuid",
      "job_id": "job-uuid",
      "createdAt": "2026-02-09T10:30:00Z"
    }
  }
}
```

**에러 케이스:**
```json
// 본인이 등록한 구인공고에 지원
{
  "errors": [
    {
      "message": "Job creator cannot apply to their own job"
    }
  ]
}

// 이미 지원한 구인공고
{
  "errors": [
    {
      "message": "Already applied to this job"
    }
  ]
}

// PetOwner가 지원 시도 (역할 권한 에러)
{
  "errors": [
    {
      "message": "Forbidden resource"
    }
  ]
}
```

---

### 22. 특정 구인공고의 지원자 목록 조회

**Query:**
```graphql
query GetApplications {
  jobApplicationsByJob(jobId: "job-uuid") {
    id
    status
    user_id
    user {
      id
      email
      full_name
      roles
    }
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "jobApplicationsByJob": [
      {
        "id": "application-uuid-1",
        "status": "applying",
        "user_id": "petsitter-uuid-1",
        "user": {
          "id": "petsitter-uuid-1",
          "email": "sitter1@example.com",
          "full_name": "Kim PetSitter",
          "roles": ["PetSitter"]
        },
        "createdAt": "2026-02-09T10:30:00Z"
      },
      {
        "id": "application-uuid-2",
        "status": "approved",
        "user_id": "petsitter-uuid-2",
        "user": {
          "id": "petsitter-uuid-2",
          "email": "sitter2@example.com",
          "full_name": "Lee PetSitter",
          "roles": ["PetSitter"]
        },
        "createdAt": "2026-02-09T11:00:00Z"
      }
    ]
  }
}
```

---

### 23. 지원 상태 변경 (PetOwner - 승인/거절)

**HTTP Headers:**
```json
{
  "Authorization": "Bearer <PetOwner_JWT_TOKEN>"
}
```

**Mutation (승인):**
```graphql
mutation ApproveApplication {
  updateJobApplicationStatus(
    id: "application-uuid"
    data: { status: approved }
  ) {
    id
    status
    user {
      id
      email
      full_name
    }
    job {
      id
      activity
      pets {
        name
        species
      }
    }
    updatedAt
  }
}
```

**Mutation (거절):**
```graphql
mutation RejectApplication {
  updateJobApplicationStatus(
    id: "application-uuid"
    data: { status: rejected }
  ) {
    id
    status
    user {
      id
      email
    }
    updatedAt
  }
}
```

**예상 응답 (승인):**
```json
{
  "data": {
    "updateJobApplicationStatus": {
      "id": "application-uuid",
      "status": "approved",
      "user": {
        "id": "petsitter-uuid",
        "email": "sitter@example.com",
        "full_name": "Kim PetSitter"
      },
      "job": {
        "id": "job-uuid",
        "activity": "반려견 산책",
        "pets": [
          {
            "name": "초코",
            "species": "Dog"
          }
        ]
      },
      "updatedAt": "2026-02-09T12:00:00Z"
    }
  }
}
```

**에러 케이스:**
```json
// 구인공고 작성자가 아닌 경우
{
  "errors": [
    {
      "message": "Only the job creator can update application status"
    }
  ]
}

// status 필드 누락
{
  "errors": [
    {
      "message": "status is required"
    }
  ]
}
```

---

### 24. 사용자가 등록한 구인공고 목록 조회

**Query:**
```graphql
query GetUserJobs {
  userJobs(userId: "petowner-uuid") {
    id
    activity
    start_time
    end_time
    pets {
      id
      name
      species
      age
      breed
    }
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "userJobs": [
      {
        "id": "job-uuid-1",
        "activity": "반려견 산책",
        "start_time": "2026-02-10T09:00:00Z",
        "end_time": "2026-02-10T11:00:00Z",
        "pets": [
          {
            "id": "pet-uuid-1",
            "name": "초코",
            "species": "Dog",
            "age": 3,
            "breed": "푸들"
          }
        ],
        "createdAt": "2026-02-09T08:00:00Z"
      },
      {
        "id": "job-uuid-2",
        "activity": "고양이 돌봄",
        "start_time": "2026-02-12T14:00:00Z",
        "end_time": "2026-02-12T18:00:00Z",
        "pets": [
          {
            "id": "pet-uuid-2",
            "name": "나비",
            "species": "Cat",
            "age": 2,
            "breed": "코리안숏헤어"
          }
        ],
        "createdAt": "2026-02-09T10:00:00Z"
      }
    ]
  }
}
```

**사용 케이스:**
- PetOwner가 자신이 등록한 구인공고 확인
- 관리자가 특정 사용자의 구인공고 확인
- 마이페이지에서 "내가 올린 구인공고" 목록 표시

---

### 25. 사용자가 지원한 구인공고 목록 조회

**Query:**
```graphql
query GetUserApplications {
  userJobApplications(userId: "petsitter-uuid") {
    id
    status
    createdAt
    updatedAt
    job {
      id
      activity
      start_time
      end_time
      creator_user_id
      pets {
        name
        species
        age
      }
    }
    user {
      id
      email
      full_name
    }
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "userJobApplications": [
      {
        "id": "application-uuid-1",
        "status": "applying",
        "createdAt": "2026-02-09T10:30:00Z",
        "updatedAt": "2026-02-09T10:30:00Z",
        "job": {
          "id": "job-uuid-1",
          "activity": "반려견 산책",
          "start_time": "2026-02-10T09:00:00Z",
          "end_time": "2026-02-10T11:00:00Z",
          "creator_user_id": "petowner-uuid-1",
          "pets": [
            {
              "name": "초코",
              "species": "Dog",
              "age": 3
            }
          ]
        },
        "user": {
          "id": "petsitter-uuid",
          "email": "sitter@example.com",
          "full_name": "Kim PetSitter"
        }
      },
      {
        "id": "application-uuid-2",
        "status": "approved",
        "createdAt": "2026-02-09T11:00:00Z",
        "updatedAt": "2026-02-09T12:00:00Z",
        "job": {
          "id": "job-uuid-2",
          "activity": "고양이 돌봄",
          "start_time": "2026-02-12T14:00:00Z",
          "end_time": "2026-02-12T18:00:00Z",
          "creator_user_id": "petowner-uuid-2",
          "pets": [
            {
              "name": "나비",
              "species": "Cat",
              "age": 2
            }
          ]
        },
        "user": {
          "id": "petsitter-uuid",
          "email": "sitter@example.com",
          "full_name": "Kim PetSitter"
        }
      }
    ]
  }
}
```

**필터링 예시 (클라이언트 측):**
```graphql
# 승인된 지원만 보기
query GetApprovedApplications {
  userJobApplications(userId: "petsitter-uuid") {
    id
    status
    job {
      activity
      start_time
    }
  }
}
```

클라이언트에서 `filter(app => app.status === 'approved')` 처리

**사용 케이스:**
- PetSitter가 자신이 지원한 구인공고 확인
- 지원 상태별 필터링 (대기중/승인됨/거절됨)
- 마이페이지에서 "내 지원 내역" 목록 표시

---

### 26. 리뷰 작성 — PetOwner → PetSitter (job5 시나리오)

> **사전 조건**: seed 데이터 기준, job5는 `both(양면인)`가 등록하고 `sitter1(박돌봄)`이 approved.
> 두 계정 모두 아직 리뷰 미작성 상태.

**HTTP Headers:**
```json
{
  "Authorization": "Bearer <BOTH_JWT_TOKEN>"
}
```

**Step 1 — `both` 계정으로 로그인:**
```graphql
mutation LoginBoth {
  login(data: {
    email: "both@test.com"
    password: "password123"
  }) {
    user_id
    auth_header
  }
}
```

**Step 2 — job5 ID 조회 (activity로 찾기):**
```graphql
query FindJob5 {
  jobs(filter: { activity: "소형견" }) {
    items {
      id
      activity
      creator_user_id
    }
  }
}
```

**Step 3 — 리뷰 작성:**
```graphql
mutation CreateReviewAsOwner {
  createReview(
    jobId: "<JOB5_ID>"
    data: {
      rating: 5
      comment: "매우 친절하고 꼼꼼하게 돌봐주셨어요!"
    }
  ) {
    id
    rating
    comment
    reviewer_id
    reviewee_id
    job_id
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "createReview": {
      "id": "review-uuid",
      "rating": 5,
      "comment": "매우 친절하고 꼼꼼하게 돌봐주셨어요!",
      "reviewer_id": "<BOTH_USER_ID>",
      "reviewee_id": "<SITTER1_USER_ID>",
      "job_id": "<JOB5_ID>",
      "createdAt": "2026-02-11T..."
    }
  }
}
```

---

### 27. 리뷰 작성 — PetSitter → PetOwner (job3 시나리오)

> **사전 조건**: seed 데이터 기준, job3은 `owner2(이주인)`가 등록하고 `sitter2(최돌봄)`이 approved.
> `owner2`는 이미 리뷰 작성 완료, `sitter2`는 미작성.

**HTTP Headers:**
```json
{
  "Authorization": "Bearer <SITTER2_JWT_TOKEN>"
}
```

**Step 1 — `sitter2` 계정으로 로그인:**
```graphql
mutation LoginSitter2 {
  login(data: {
    email: "sitter2@test.com"
    password: "password123"
  }) {
    user_id
    auth_header
  }
}
```

**Step 2 — job3 ID 조회:**
```graphql
query FindJob3 {
  jobs(filter: { activity: "허스키" }) {
    items {
      id
      activity
      creator_user_id
    }
  }
}
```

**Step 3 — 리뷰 작성 (PetSitter 입장):**
```graphql
mutation CreateReviewAsSitter {
  createReview(
    jobId: "<JOB3_ID>"
    data: {
      rating: 4
      comment: "반려동물이 잘 훈련되어 있고 주인분도 친절하셨어요."
    }
  ) {
    id
    rating
    comment
    reviewer_id
    reviewee_id
    job_id
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "createReview": {
      "id": "review-uuid",
      "rating": 4,
      "comment": "반려동물이 잘 훈련되어 있고 주인분도 친절하셨어요.",
      "reviewer_id": "<SITTER2_USER_ID>",
      "reviewee_id": "<OWNER2_USER_ID>",
      "job_id": "<JOB3_ID>",
      "createdAt": "2026-02-11T..."
    }
  }
}
```

---

### 28. 특정 사용자가 받은 리뷰 목록 조회

```graphql
# sitter1이 받은 리뷰 목록 (최신순)
query GetSitter1Reviews {
  userReviews(
    userId: "<SITTER1_USER_ID>"
    sort: "createdAt:desc"
  ) {
    id
    rating
    comment
    reviewer_id
    reviewee_id
    job_id
    createdAt
  }
}
```

```graphql
# 높은 평점순 정렬
query GetReviewsByRating {
  userReviews(
    userId: "<SITTER1_USER_ID>"
    sort: "rating:desc"
  ) {
    id
    rating
    comment
    createdAt
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "userReviews": [
      {
        "id": "review-uuid-1",
        "rating": 5,
        "comment": "매우 친절하고 꼼꼼하게 돌봐주셨어요. 다음에도 꼭 부탁드리겠습니다!",
        "reviewer_id": "<OWNER1_USER_ID>",
        "reviewee_id": "<SITTER1_USER_ID>",
        "job_id": "<JOB2_ID>",
        "createdAt": "..."
      }
    ]
  }
}
```

---

### 29. 리뷰 삭제

```graphql
# 리뷰 작성자만 삭제 가능
mutation DeleteReview {
  deleteReview(id: "<REVIEW_ID>")
}
```

**예상 응답:**
```json
{
  "data": {
    "deleteReview": true
  }
}
```

---

### 30. 리뷰 에러 케이스 테스트

#### 케이스 1: 승인된 지원자 없는 공고에 리뷰 시도 → 400

> job1: sitter1, sitter2 모두 applying 상태 (approved 없음)

```graphql
# owner1 토큰으로 실행
mutation ReviewJobWithNoApproved {
  createReview(
    jobId: "<JOB1_ID>"
    data: { rating: 3 }
  ) {
    id
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "승인된 지원자가 없어 리뷰를 작성할 수 없습니다.",
      "extensions": { "code": "BAD_USER_INPUT" }
    }
  ],
  "data": null
}
```

#### 케이스 2: 관계없는 사용자가 리뷰 시도 → 403

> job5는 both와 sitter1만 리뷰 가능. owner2는 권한 없음.

```graphql
# owner2 토큰으로 실행
mutation UnauthorizedReview {
  createReview(
    jobId: "<JOB5_ID>"
    data: { rating: 3 }
  ) {
    id
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "해당 공고에 대한 리뷰 작성 권한이 없습니다.",
      "extensions": { "code": "FORBIDDEN" }
    }
  ],
  "data": null
}
```

#### 케이스 3: 이미 리뷰를 작성한 경우 → 409

> job2: owner1 → sitter1 리뷰 이미 완료 (seed 데이터)

```graphql
# owner1 토큰으로 실행
mutation DuplicateReview {
  createReview(
    jobId: "<JOB2_ID>"
    data: { rating: 5, comment: "중복 작성 시도" }
  ) {
    id
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "이미 해당 공고에 리뷰를 작성했습니다.",
      "extensions": { "code": "CONFLICT" }
    }
  ],
  "data": null
}
```

#### 케이스 4: rating 범위 초과 → 400

```graphql
mutation InvalidRating {
  createReview(
    jobId: "<JOB5_ID>"
    data: { rating: 6 }
  ) {
    id
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "validationErrors": ["rating must not be greater than 5"]
      }
    }
  ],
  "data": null
}
```

---

### 31. 위치·가격 정보 포함 공고 등록 (Location + Price)

> **사전 조건**: PetOwner 계정(owner1)으로 로그인 후 토큰을 Authorization 헤더에 설정

**HTTP Headers:**
```json
{ "Authorization": "Bearer <OWNER1_JWT_TOKEN>" }
```

```graphql
mutation CreateJobWithLocation {
  createJob(data: {
    start_time: "2026-03-01T09:00:00Z"
    end_time: "2026-03-01T11:00:00Z"
    activity: "말티즈 홈케어 서비스 구합니다"
    address: "서울 종로구 혜화동"
    latitude: 37.5826
    longitude: 127.0016
    price: 18000
    price_type: hourly
    pets: [
      {
        name: "콩이"
        age: 2
        species: Dog
        breed: "말티즈"
        size: SMALL
      }
    ]
  }) {
    id
    activity
    address
    latitude
    longitude
    price
    price_type
    pets {
      name
      species
    }
  }
}
```

**예상 응답:**
```json
{
  "data": {
    "createJob": {
      "id": "new-job-uuid",
      "activity": "말티즈 홈케어 서비스 구합니다",
      "address": "서울 종로구 혜화동",
      "latitude": 37.5826,
      "longitude": 127.0016,
      "price": 18000,
      "price_type": "hourly",
      "pets": [
        { "name": "콩이", "species": "Dog" }
      ]
    }
  }
}
```

---

### 32. 가격 범위 필터로 공고 목록 조회

> seed 데이터 기준: job1(15000원/시간), job2(50000원/일), job3(20000원/시간), job4(가격 없음), job5(12000원/시간)

**min_price 필터 (20000원 이상):**

```graphql
query JobsMinPrice {
  jobs(filter: { minPrice: 20000 }) {
    items {
      id
      activity
      price
      price_type
    }
    pageInfo {
      hasNextPage
    }
  }
}
```

**예상 응답**: job2(50000), job3(20000) 포함

**max_price 필터 (15000원 이하):**

```graphql
query JobsMaxPrice {
  jobs(filter: { maxPrice: 15000 }) {
    items {
      id
      activity
      price
      price_type
      address
    }
    pageInfo {
      hasNextPage
    }
  }
}
```

**예상 응답**: job1(15000), job5(12000) 포함

**범위 필터 조합 (12000~20000원):**

```graphql
query JobsPriceRange {
  jobs(filter: { minPrice: 12000, maxPrice: 20000 }) {
    items {
      id
      activity
      price
      price_type
    }
  }
}
```

**예상 응답**: job1(15000), job3(20000), job5(12000) 포함

---

### 33. 즐겨찾기 토글 (toggleFavorite) — sitter1 시나리오

> **사전 조건**: seed 데이터에 sitter1 → job3, job4가 즐겨찾기 된 상태. PetSitter 계정으로 로그인.

**HTTP Headers:**
```json
{ "Authorization": "Bearer <SITTER1_JWT_TOKEN>" }
```

**Step 1 — sitter1 로그인:**
```graphql
mutation LoginSitter1 {
  login(data: {
    email: "sitter1@test.com"
    password: "password123"
  }) {
    user_id
    auth_header
  }
}
```

**Step 2 — 즐겨찾기 추가 (job1 토글: 없으면 추가):**
```graphql
mutation ToggleFavorite {
  toggleFavorite(jobId: "<JOB1_ID>") {
    added
  }
}
```

**예상 응답 (추가):**
```json
{
  "data": {
    "toggleFavorite": {
      "added": true
    }
  }
}
```

**Step 3 — 동일 mutation 재실행 (토글: 있으면 제거):**

```json
{
  "data": {
    "toggleFavorite": {
      "added": false
    }
  }
}
```

---

### 34. 즐겨찾기 목록 조회 (myFavorites)

**HTTP Headers:**
```json
{ "Authorization": "Bearer <SITTER1_JWT_TOKEN>" }
```

```graphql
query MyFavorites {
  myFavorites {
    id
    activity
    address
    price
    price_type
    start_time
    end_time
    pets {
      name
      species
      age
    }
    photos {
      url
    }
  }
}
```

**예상 응답** (seed 기준 sitter1의 즐겨찾기: job4, job3 — 최신 등록순):
```json
{
  "data": {
    "myFavorites": [
      {
        "id": "<JOB4_ID>",
        "activity": "진돗개 돌봄 서비스 구합니다",
        "address": null,
        "price": null,
        "price_type": null,
        ...
      },
      {
        "id": "<JOB3_ID>",
        "activity": "허스키 산책 도우미 구합니다",
        "address": "부산 해운대구 우동",
        "price": 20000,
        "price_type": "hourly",
        ...
      }
    ]
  }
}
```

---

### 35. 즐겨찾기 에러 케이스 테스트

#### 케이스 1: PetOwner 계정으로 toggleFavorite 시도 → 403

```graphql
# owner1 토큰으로 실행
mutation ToggleFavoriteAsOwner {
  toggleFavorite(jobId: "<JOB1_ID>") {
    added
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "Forbidden resource",
      "extensions": { "code": "FORBIDDEN" }
    }
  ],
  "data": null
}
```

#### 케이스 2: 존재하지 않는 공고 즐겨찾기 시도 → 404

```graphql
mutation ToggleFavoriteNotFound {
  toggleFavorite(jobId: "00000000-0000-0000-0000-000000000000") {
    added
  }
}
```

**예상 응답 (에러):**
```json
{
  "errors": [
    {
      "message": "Job not found",
      "extensions": { "code": "NOT_FOUND" }
    }
  ],
  "data": null
}
```

---

## 💡 실전 예시

### 복잡한 Query 예시 (Field Resolver 사용)

```typescript
@Resolver(() => UserModel)
export class UsersResolver {
  // Field Resolver: User의 관계형 데이터를 lazy loading
  @ResolveField(() => [JobModel])
  async jobs(@Parent() user: UserModel) {
    return this.jobsService.findByUserId(user.id);
  }
}
```

**Query:**
```graphql
query {
  me {
    id
    email
    jobs {
      id
      activity
      start_time
    }
  }
}
```

---

### Pagination 예시

```typescript
@Query(() => PaginatedUsers)
async users(
  @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
  @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
) {
  return this.usersService.findAll({ page, limit });
}
```

**Query:**
```graphql
query {
  users(page: 1, limit: 10) {
    items {
      id
      email
    }
    totalCount
    hasNextPage
  }
}
```

---

## 🔧 GraphQL 설정 (app.module.ts)

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),  // 스키마 자동 생성
  sortSchema: true,                                        // 스키마 정렬
  playground: true,                                        // Playground 활성화
  context: ({ req, res }: any) => ({ req, res }),         // JWT 컨텍스트 전달
})
```

---

## 📊 REST vs GraphQL 비교

| 항목 | REST | GraphQL |
|------|------|---------|
| **엔드포인트** | `/users`, `/users/:id` | `/graphql` (단일) |
| **요청 핸들러** | Controller | Resolver |
| **요청 DTO** | DTO (class-validator) | InputType |
| **응답 DTO** | Response DTO | ObjectType |
| **데이터 로딩** | 고정된 응답 | 원하는 필드만 선택 |
| **Over-fetching** | 발생 가능 | 없음 |
| **Under-fetching** | 발생 가능 (N+1) | Field Resolver로 해결 |
| **캐싱** | HTTP 캐싱 | Apollo Cache |
| **인증** | Guard | Guard (HTTP와 동일) |

---

## ✅ Best Practices

### 1. **Resolver는 얇게 유지**
```typescript
// ❌ 나쁜 예
@Mutation(() => User)
async register(@Args('data') data: RegisterInput) {
  // Resolver에 비즈니스 로직 X
  const user = await this.prisma.user.create({ ... });
  return user;
}

// ✅ 좋은 예
@Mutation(() => User)
async register(@Args('data') data: RegisterInput) {
  return this.usersService.create(data);  // Service로 위임
}
```

### 2. **Service는 REST/GraphQL 공용**
```typescript
@Injectable()
export class UsersService {
  // RegisterInput | CreateUserDto 모두 받을 수 있음
  async create(input: RegisterInput | CreateUserDto): Promise<User> {
    // 비즈니스 로직
  }
}
```

### 3. **민감한 정보는 ObjectType에서 제외**
```typescript
@ObjectType()
export class UserModel {
  @Field()
  email: string;

  // ❌ password는 노출하지 않음
  // password: string;
}
```

### 4. **InputType과 ObjectType 분리**
```typescript
// Input (요청)
@InputType()
export class CreateJobInput {
  @Field()
  activity: string;

  @Field(() => [CreatePetInput])
  pets: CreatePetInput[];
}

// Output (응답)
@ObjectType()
export class JobModel {
  @Field(() => ID)
  id: string;

  @Field()
  activity: string;

  @Field(() => [PetModel])
  pets: PetModel[];
}
```

---

## 🚨 트러블슈팅

### 1. "The table does not exist"
```bash
npx prisma db push
npx prisma generate
```

### 2. "Cannot return null for non-nullable field"
- ObjectType의 `@Field()` nullable 설정 확인
- Service에서 null 반환 확인

### 3. "Circular dependency"
- forwardRef() 사용
- Module imports 순서 확인

---

## 📚 참고 자료

- [NestJS GraphQL Docs](https://docs.nestjs.com/graphql/quick-start)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Code-first](https://docs.nestjs.com/graphql/quick-start#code-first)
- [Prisma](https://www.prisma.io/docs)

---

**문서 버전**: 1.2
**최종 수정일**: 2026-02-12
