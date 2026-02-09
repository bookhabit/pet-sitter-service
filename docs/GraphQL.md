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
7. [실전 예시](#실전-예시)

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

**문서 버전**: 1.0
**최종 수정일**: 2026-02-09
