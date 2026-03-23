# 🌐 REST API 아키텍처 가이드

> **NestJS + Prisma + OpenAPI(Swagger)** 구조 및 테스트 방법

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
9. [즐겨찾기 테스트](#즐겨찾기-토글-favorites--sitter1-시나리오)
10. [채팅 테스트](#채팅방-목록-조회)
11. [OpenAPI(Swagger) 문서](#openapi-문서)
12. [사진 업로드](./PHOTO_UPLOAD.md#rest-api)

---

## 🏗️ 아키텍처 개요

### REST API 계층 구조

```
┌─────────────────────────────────────────────────────┐
│                   HTTP Client                        │
│         (Postman / Thunder Client / curl)            │
└─────────────────────────────────────────────────────┘
                          │
                          │ HTTP Request
                          │ GET /users, POST /users, etc.
                          ▼
┌─────────────────────────────────────────────────────┐
│                  NestJS Server                       │
│               (Express/Fastify)                      │
│   - Swagger UI: /api                                │
│   - ValidationPipe                                   │
│   - Global Guards                                    │
└─────────────────────────────────────────────────────┘
                          │
                          │ Route to Controller
                          ▼
┌─────────────────────────────────────────────────────┐
│                   Controller                         │
│   - @Get, @Post, @Put, @Delete                     │
│   - @Body, @Param, @Query                           │
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
├── app.module.ts              # 앱 모듈 설정
├── main.ts                    # 진입점 (Swagger 설정)
│
├── users/                     # User 모듈 (예시)
│   ├── users.module.ts        # 모듈 등록
│   ├── users.controller.ts    # REST Controller ⭐
│   ├── users.service.ts       # 비즈니스 로직 (GraphQL과 공유)
│   │
│   └── dto/                   # Data Transfer Object
│       ├── create-user-dto.ts # @Body 요청 DTO
│       └── update-user-dto.ts # @Body 수정 DTO
│
├── sessions/                  # 세션(로그인) 모듈
│   ├── sessions.controller.ts # 로그인 엔드포인트
│   ├── sessions.service.ts    # JWT 생성 로직
│   └── dto/
│       └── login.dto.ts       # 로그인 요청 DTO
│
├── jobs/                      # 구인공고 모듈
│   ├── jobs.controller.ts
│   ├── jobs.service.ts
│   └── dto/
│       ├── create-job-dto.ts
│       ├── update-job-dto.ts
│       └── search-job-query.dto.ts  # @Query 파라미터
│
├── auth/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts  # JWT 인증 Guard
│   │   └── roles.guard.ts     # 역할 기반 권한 Guard
│   └── decorators/
│       ├── current-user.decorator.ts  # @CurrentUser()
│       ├── public.decorator.ts        # @Public()
│       └── roles.decorator.ts         # @Roles()
│
└── prisma/
    ├── prisma.service.ts      # Prisma Client 래퍼
    └── prisma.module.ts
```

---

## 🔍 계층별 역할

### 1. **Controller** (`users.controller.ts`)

**역할**: HTTP 요청을 받아 Service로 전달 (라우팅 계층)

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users - 회원가입
  @Post()
  @Public()  // 인증 불필요
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /users/:id - 사용자 조회
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PUT /users/:id - 사용자 수정
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /users/:id - 사용자 삭제
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
```

**핵심 데코레이터:**
- `@Controller()` - URL prefix 지정
- `@Get()`, `@Post()`, `@Put()`, `@Delete()` - HTTP 메서드
- `@Body()` - 요청 바디 받기
- `@Param()` - URL 파라미터 받기
- `@Query()` - 쿼리 파라미터 받기

---

### 2. **Service** (`users.service.ts`)

**역할**: 비즈니스 로직 (Controller와 Prisma 사이)

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
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

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 이메일 변경 시 중복 체크
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException('이미 존재하는 이메일입니다.');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email }),
        ...(dto.full_name && { full_name: dto.full_name }),
        ...(dto.password && { password: dto.password }),
        ...(dto.roles && { roles: dto.roles }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
```

**특징:**
- ✅ **비즈니스 로직 집중** (검증, 변환, 에러 처리)
- ✅ Prisma Client를 통한 DB 접근
- ✅ REST와 GraphQL이 동일한 Service 사용 가능

---

### 3. **DTO** (`dto/create-user-dto.ts`)

**역할**: 요청/응답 데이터 검증 및 타입 정의

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsArray, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @IsString({ message: 'full_name must be a string' })
  @MinLength(2, { message: 'full_name must be at least 2 characters long' })
  @MaxLength(50, { message: 'full_name must not exceed 50 characters' })
  full_name: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  password: string;

  @IsArray({ message: 'roles must be an array' })
  @IsEnum(Role, { each: true, message: 'Each role must be one of: PetOwner, PetSitter, Admin' })
  roles: Role[];
}
```

**UpdateUserDto** (선택적 필드):
```typescript
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];
}
```

**특징:**
- `class-validator` 데코레이터로 자동 검증
- ValidationPipe가 자동으로 검증 실행
- 검증 실패 시 400 Bad Request 응답

---

## 🔄 데이터 흐름

### 회원가입 예시

```
1. HTTP Client
   POST /users
   Content-Type: application/json

   {
     "email": "test@example.com",
     "full_name": "Test User",
     "password": "password123",
     "roles": ["PetOwner"]
   }

2. NestJS Server
   - ValidationPipe: CreateUserDto 검증
   - @Public() 확인: 인증 스킵

3. UsersController.create()
   - @Body()로 CreateUserDto 받음
   - usersService.create() 호출

4. UsersService.create()
   - 이메일 중복 체크
   - Prisma로 User 생성

5. Prisma Client
   - INSERT INTO "User" ...

6. PostgreSQL
   - 데이터 저장

7. Response (User Entity)
   {
     "id": "uuid",
     "email": "test@example.com",
     "full_name": "Test User",
     "password": "hashed_password",
     "roles": ["PetOwner"],
     "createdAt": "2026-02-09T...",
     "updatedAt": "2026-02-09T..."
   }
```

---

## 🔐 인증 시스템

### JWT 기반 인증

#### 1. **로그인 프로세스** (`sessions.service.ts`)

```typescript
@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto): Promise<{ user_id: string; auth_header: string }> {
    // 1. 사용자 조회
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. 비밀번호 확인 (⚠️ 실제로는 bcrypt 사용 권장)
    if (user.password !== dto.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' },
    );

    const authHeader = `Bearer ${token}`;

    // 4. 세션 저장 (DB에 기록)
    await this.prisma.session.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        auth_header: authHeader,
      },
    });

    return {
      user_id: user.id,
      auth_header: authHeader,
    };
  }
}
```

#### 2. **JwtAuthGuard** (`auth/guards/jwt-auth.guard.ts`)

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. @Public() 데코레이터 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 2. Authorization 헤더에서 토큰 추출
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.replace('Bearer ', '');

    // 3. JWT 검증
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret-key',
      ) as { userId: string; email: string };

      // 4. 사용자 조회
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 5. 세션 존재 확인
      const session = await this.prisma.session.findFirst({
        where: {
          user_id: user.id,
          auth_header: authHeader,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      // 6. request.user에 저장
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw error;
    }
  }
}
```

#### 3. **전역 Guard 설정** (`app.module.ts`)

```typescript
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,  // 모든 요청에 자동 적용
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,    // 역할 기반 권한 체크
    },
  ],
})
export class AppModule {}
```

#### 4. **역할 기반 권한 체크**

```typescript
@Post()
@Roles('PetOwner')  // PetOwner만 접근 가능
async create(@Body() dto: CreateJobDto) {
  return this.jobsService.create(dto);
}
```

---

## 🧪 테스트 방법

### 1. 서버 시작

```bash
npm run start:dev
```

### 2. Swagger UI 접속

브라우저에서 접속: **http://localhost:3000/api**

---

### 3. 회원가입 (Public)

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "email": "test@example.com",
  "full_name": "Test User",
  "password": "password123",
  "roles": ["PetOwner"]
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "password": "password123",
    "roles": ["PetOwner"]
  }'
```

**예상 응답 (201 Created):**
```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "email": "test@example.com",
  "full_name": "Test User",
  "password": "password123",
  "roles": ["PetOwner"],
  "createdAt": "2026-02-09T10:00:00.000Z",
  "updatedAt": "2026-02-09T10:00:00.000Z"
}
```

---

### 4. 로그인 (Public)

**Endpoint:** `POST /sessions`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**예상 응답 (200 OK):**
```json
{
  "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "auth_header": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ auth_header 값을 복사하세요!**

---

### 5. 인증 필요한 요청

#### 사용자 조회

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL:**
```bash
curl -X GET http://localhost:3000/users/d290f1ee-6c54-4b01-90e6-d701748f0851 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**예상 응답 (200 OK):**
```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "email": "test@example.com",
  "full_name": "Test User",
  "password": "password123",
  "roles": ["PetOwner"],
  "createdAt": "2026-02-09T10:00:00.000Z",
  "updatedAt": "2026-02-09T10:00:00.000Z"
}
```

---

### 6. 사용자 수정

**Endpoint:** `PUT /users/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "Updated Name"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/users/d290f1ee-6c54-4b01-90e6-d701748f0851 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name"
  }'
```

---

### 7. 사용자 삭제

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/users/d290f1ee-6c54-4b01-90e6-d701748f0851 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**예상 응답 (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

### 8. 에러 케이스 테스트

#### Authorization 헤더 없이 요청

**Request:**
```bash
curl -X GET http://localhost:3000/users/d290f1ee-6c54-4b01-90e6-d701748f0851
```

**예상 응답 (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Authorization header is missing",
  "error": "Unauthorized"
}
```

#### 잘못된 토큰

**Request:**
```bash
curl -X GET http://localhost:3000/users/d290f1ee-6c54-4b01-90e6-d701748f0851 \
  -H "Authorization: Bearer invalid_token"
```

**예상 응답 (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

---

### 9. 리뷰 작성 — PetOwner → PetSitter (job5 시나리오)

> **사전 조건**: seed 데이터 기준, job5는 `both(양면인)`가 등록하고 `sitter1(박돌봄)`이 approved 상태.
> 두 계정 모두 아직 리뷰를 작성하지 않은 상태.

**Step 1 — `both` 계정으로 로그인:**

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"email": "both@test.com", "password": "password123"}'
```

응답에서 `auth_header` 값을 복사하세요.

**Step 2 — job5의 ID 조회 (공고 목록에서 확인):**

```bash
curl -X GET http://localhost:3000/jobs \
  -H "Authorization: Bearer <BOTH_TOKEN>"
```

activity가 "소형견 산책 도우미 구합니다"인 공고의 ID를 복사하세요.

**Step 3 — 리뷰 작성 (PetOwner 입장):**

```bash
# <JOB5_ID>를 실제 job5 ID로 교체
curl -X POST http://localhost:3000/jobs/<JOB5_ID>/reviews \
  -H "Authorization: Bearer <BOTH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "매우 친절하고 꼼꼼하게 돌봐주셨어요!"}'
```

**예상 응답 (201 Created):**
```json
{
  "id": "review-uuid",
  "rating": 5,
  "comment": "매우 친절하고 꼼꼼하게 돌봐주셨어요!",
  "reviewer_id": "<BOTH_USER_ID>",
  "reviewee_id": "<SITTER1_USER_ID>",
  "job_id": "<JOB5_ID>",
  "createdAt": "2026-02-11T...",
  "updatedAt": "2026-02-11T..."
}
```

---

### 10. 리뷰 작성 — PetSitter → PetOwner (job3 시나리오)

> **사전 조건**: seed 데이터 기준, job3은 `owner2(이주인)`가 등록하고 `sitter2(최돌봄)`이 approved.
> `owner2`는 이미 리뷰를 작성했고, `sitter2`는 아직 미작성.

**Step 1 — `sitter2` 계정으로 로그인:**

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"email": "sitter2@test.com", "password": "password123"}'
```

**Step 2 — job3의 ID 조회:**

```bash
curl -X GET http://localhost:3000/jobs \
  -H "Authorization: Bearer <SITTER2_TOKEN>"
```

activity가 "허스키 산책 도우미 구합니다"인 공고의 ID를 복사하세요.

**Step 3 — 리뷰 작성 (PetSitter 입장):**

```bash
curl -X POST http://localhost:3000/jobs/<JOB3_ID>/reviews \
  -H "Authorization: Bearer <SITTER2_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "comment": "반려동물이 잘 훈련되어 있고 주인분도 친절하셨어요."}'
```

**예상 응답 (201 Created):**
```json
{
  "id": "review-uuid",
  "rating": 4,
  "comment": "반려동물이 잘 훈련되어 있고 주인분도 친절하셨어요.",
  "reviewer_id": "<SITTER2_USER_ID>",
  "reviewee_id": "<OWNER2_USER_ID>",
  "job_id": "<JOB3_ID>",
  "createdAt": "2026-02-11T...",
  "updatedAt": "2026-02-11T..."
}
```

---

### 11. 특정 사용자가 받은 리뷰 목록 조회

**Endpoint:** `GET /users/:userId/reviews`

```bash
# sitter1이 받은 리뷰 목록 조회
curl -X GET http://localhost:3000/users/<SITTER1_USER_ID>/reviews \
  -H "Authorization: Bearer <ANY_TOKEN>"

# 최신순 정렬
curl -X GET "http://localhost:3000/users/<SITTER1_USER_ID>/reviews?sort=createdAt:desc" \
  -H "Authorization: Bearer <ANY_TOKEN>"

# 높은 평점순 정렬
curl -X GET "http://localhost:3000/users/<SITTER1_USER_ID>/reviews?sort=rating:desc" \
  -H "Authorization: Bearer <ANY_TOKEN>"
```

**예상 응답 (200 OK):**
```json
[
  {
    "id": "review-uuid-1",
    "rating": 5,
    "comment": "매우 친절하고 꼼꼼하게 돌봐주셨어요. 다음에도 꼭 부탁드리겠습니다!",
    "reviewer_id": "<OWNER1_USER_ID>",
    "reviewee_id": "<SITTER1_USER_ID>",
    "job_id": "<JOB2_ID>",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### 12. 리뷰 삭제

**Endpoint:** `DELETE /reviews/:id`

```bash
# 리뷰 작성자만 삭제 가능
curl -X DELETE http://localhost:3000/reviews/<REVIEW_ID> \
  -H "Authorization: Bearer <REVIEWER_TOKEN>"
```

**예상 응답 (204 No Content):** 본문 없음

---

### 13. 리뷰 에러 케이스 테스트

#### 케이스 1: 승인된 지원자 없는 공고에 리뷰 시도 → 400

> job1: sitter1, sitter2 모두 applying 상태 (approved 없음)

```bash
# owner1으로 로그인 후 job1에 리뷰 시도
curl -X POST http://localhost:3000/jobs/<JOB1_ID>/reviews \
  -H "Authorization: Bearer <OWNER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 3}'
```

**예상 응답 (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "승인된 지원자가 없어 리뷰를 작성할 수 없습니다.",
  "error": "Bad Request"
}
```

#### 케이스 2: 관계없는 사용자가 리뷰 시도 → 403

> job5는 both와 sitter1만 리뷰 가능. owner2는 권한 없음.

```bash
# owner2 토큰으로 job5에 리뷰 시도
curl -X POST http://localhost:3000/jobs/<JOB5_ID>/reviews \
  -H "Authorization: Bearer <OWNER2_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 3}'
```

**예상 응답 (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "해당 공고에 대한 리뷰 작성 권한이 없습니다.",
  "error": "Forbidden"
}
```

#### 케이스 3: 이미 리뷰를 작성한 경우 → 409

> job2: owner1 → sitter1 이미 리뷰 완료 (seed 데이터)

```bash
# owner1 토큰으로 job2에 중복 리뷰 시도
curl -X POST http://localhost:3000/jobs/<JOB2_ID>/reviews \
  -H "Authorization: Bearer <OWNER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "또 작성 시도"}'
```

**예상 응답 (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "이미 해당 공고에 리뷰를 작성했습니다.",
  "error": "Conflict"
}
```

#### 케이스 4: rating 범위 초과 → 400

```bash
curl -X POST http://localhost:3000/jobs/<JOB5_ID>/reviews \
  -H "Authorization: Bearer <BOTH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 6}'
```

**예상 응답 (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["rating must not be greater than 5"],
  "error": "Bad Request"
}
```

---

---

### 14. 위치·가격 정보 포함 공고 등록 (Location + Price)

> **사전 조건**: seed 실행 후 PetOwner 계정(owner1 또는 owner2)으로 로그인

**Step 1 — `owner1` 계정으로 로그인:**

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"email": "owner1@test.com", "password": "password123"}'
```

**Step 2 — 위치·가격 정보 포함 공고 등록:**

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Authorization: Bearer <OWNER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "2026-03-01T09:00:00Z",
    "end_time": "2026-03-01T11:00:00Z",
    "activity": "말티즈 홈케어 서비스 구합니다",
    "address": "서울 종로구 혜화동",
    "latitude": 37.5826,
    "longitude": 127.0016,
    "price": 18000,
    "price_type": "hourly",
    "pets": [
      {
        "name": "콩이",
        "age": 2,
        "species": "Dog",
        "breed": "말티즈",
        "size": "SMALL"
      }
    ]
  }'
```

**예상 응답 (201 Created):**
```json
{
  "id": "new-job-uuid",
  "creator_user_id": "<OWNER1_USER_ID>",
  "start_time": "2026-03-01T09:00:00.000Z",
  "end_time": "2026-03-01T11:00:00.000Z",
  "activity": "말티즈 홈케어 서비스 구합니다",
  "address": "서울 종로구 혜화동",
  "latitude": 37.5826,
  "longitude": 127.0016,
  "price": 18000,
  "price_type": "hourly",
  "pets": [...]
}
```

---

### 15. 가격 범위 필터로 공고 검색

> seed 데이터 기준: job1(15000원/시간), job2(50000원/일), job3(20000원/시간), job4(가격 없음), job5(12000원/시간)

**min_price 필터:**

```bash
# 가격이 20000원 이상인 공고 조회
curl -X GET "http://localhost:3000/jobs?min_price=20000" \
  -H "Authorization: Bearer <ANY_TOKEN>"
```

**예상 응답**: job2(50000), job3(20000) 포함

**max_price 필터:**

```bash
# 가격이 15000원 이하인 공고 조회
curl -X GET "http://localhost:3000/jobs?max_price=15000" \
  -H "Authorization: Bearer <ANY_TOKEN>"
```

**예상 응답**: job1(15000), job5(12000) 포함

**범위 필터 조합:**

```bash
# 12000~20000원 구간 공고 조회
curl -X GET "http://localhost:3000/jobs?min_price=12000&max_price=20000" \
  -H "Authorization: Bearer <ANY_TOKEN>"
```

**예상 응답**: job1(15000), job3(20000), job5(12000) 포함

---

### 16. 즐겨찾기 토글 (Favorites) — sitter1 시나리오

> **사전 조건**: seed 데이터에 sitter1 → job3, job4가 즐겨찾기 된 상태.

**Step 1 — `sitter1` 계정으로 로그인:**

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"email": "sitter1@test.com", "password": "password123"}'
```

**Step 2 — 즐겨찾기 추가 (토글: 없으면 추가):**

```bash
# job1을 즐겨찾기에 추가
curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer <SITTER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "<JOB1_ID>"}'
```

**예상 응답 (200 OK):**
```json
{ "added": true }
```

**Step 3 — 같은 요청 재실행 (토글: 있으면 제거):**

```bash
curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer <SITTER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "<JOB1_ID>"}'
```

**예상 응답 (200 OK):**
```json
{ "added": false }
```

---

### 17. 즐겨찾기 목록 조회

```bash
curl -X GET http://localhost:3000/favorites \
  -H "Authorization: Bearer <SITTER1_TOKEN>"
```

**예상 응답 (200 OK):** seed 기준 sitter1의 즐겨찾기: job3, job4
```json
[
  {
    "id": "<JOB4_ID>",
    "activity": "진돗개 돌봄 서비스 구합니다",
    "address": null,
    "price": null,
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
```

---

### 18. 즐겨찾기 직접 제거 (DELETE)

```bash
# sitter1의 job3 즐겨찾기 제거
curl -X DELETE "http://localhost:3000/favorites/<JOB3_ID>" \
  -H "Authorization: Bearer <SITTER1_TOKEN>"
```

**예상 응답 (204 No Content):** 본문 없음

---

### 19. 즐겨찾기 에러 케이스 테스트

#### 케이스 1: PetOwner 계정으로 즐겨찾기 시도 → 403

```bash
curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer <OWNER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "<JOB1_ID>"}'
```

**예상 응답 (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

#### 케이스 2: 존재하지 않는 공고 즐겨찾기 시도 → 404

```bash
curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer <SITTER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "00000000-0000-0000-0000-000000000000"}'
```

**예상 응답 (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Job not found",
  "error": "Not Found"
}
```

#### 케이스 3: 즐겨찾기에 없는 항목 DELETE 시도 → 404

```bash
curl -X DELETE "http://localhost:3000/favorites/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer <SITTER1_TOKEN>"
```

**예상 응답 (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Favorite not found",
  "error": "Not Found"
}
```

---

## 📚 OpenAPI (Swagger) 문서

### 1. Swagger UI 접속

**URL:** http://localhost:3000/api

### 2. Swagger 설정 (`main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe 전역 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger 설정 (openapi.yml 파일 기반)
  const swaggerDocument = YAML.load(
    fs.readFileSync('./openapi.yml', 'utf8'),
  );
  SwaggerModule.setup('api', app, swaggerDocument);

  await app.listen(3000);
}
```

### 3. Swagger에서 인증 테스트

1. **회원가입**: `POST /users` 실행
2. **로그인**: `POST /sessions` 실행 → `auth_header` 복사
3. **Authorize 버튼 클릭**
4. **Value 입력**: `Bearer {복사한 토큰}`
5. **Authorize 클릭**
6. 이제 인증이 필요한 API 테스트 가능

---

### 20. 채팅방 목록 조회

> **사전 조건**: seed 데이터 기준, owner1은 chatRoom1(job2, sitter1과 대화)에 참여 중.

**Step 1 — `owner1` 계정으로 로그인:**

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"email": "owner1@test.com", "password": "password123"}'
```

**Step 2 — 내 채팅방 목록 조회:**

```bash
curl -X GET http://localhost:3000/chat-rooms \
  -H "Authorization: Bearer <OWNER1_TOKEN>"
```

**예상 응답 (200 OK):**
```json
[
  {
    "id": "<CHATROOM1_ID>",
    "job_application_id": "<APPLICATION_ID>",
    "jobApplication": {
      "id": "...",
      "user_id": "<SITTER1_ID>",
      "job_id": "<JOB2_ID>",
      "user": { "id": "...", "full_name": "박돌봄", "email": "sitter1@test.com" },
      "job": { "id": "...", "activity": "고양이 돌봄 서비스 요청합니다" }
    },
    "messages": [
      {
        "id": "...",
        "content": "좋습니다! 그러면 내일 오전 10시에 뵐 수 있을까요?",
        "sender_id": "<OWNER1_ID>",
        "createdAt": "..."
      }
    ],
    "unreadCount": 0,
    "createdAt": "..."
  }
]
```

---

### 21. 채팅방 목록 — 안읽은 메시지 확인

> owner2는 chatRoom2에서 sitter2의 마지막 메시지를 안읽은 상태 (unreadCount=1)

```bash
# owner2 로그인 후
curl -X GET http://localhost:3000/chat-rooms \
  -H "Authorization: Bearer <OWNER2_TOKEN>"
```

**예상 응답**: `unreadCount: 1`

```bash
# sitter2 로그인 후 — 본인은 모두 읽음
curl -X GET http://localhost:3000/chat-rooms \
  -H "Authorization: Bearer <SITTER2_TOKEN>"
```

**예상 응답**: `unreadCount: 0`

---

### 22. 메시지 히스토리 조회 (커서 페이지네이션)

```bash
# chatRoom1의 메시지 히스토리 조회 (최신순, 기본 20개)
curl -X GET "http://localhost:3000/chat-rooms/<CHATROOM1_ID>/messages" \
  -H "Authorization: Bearer <OWNER1_TOKEN>"
```

**예상 응답 (200 OK):**
```json
{
  "messages": [
    {
      "id": "msg-uuid-5",
      "content": "좋습니다! 그러면 내일 오전 10시에 뵐 수 있을까요?",
      "sender_id": "<OWNER1_ID>",
      "sender": { "id": "...", "full_name": "김주인", "email": "owner1@test.com" },
      "createdAt": "..."
    },
    {
      "id": "msg-uuid-4",
      "content": "네, 페르시안 3마리를 돌본 경험이 있습니다. 털 관리도 가능해요!",
      "sender_id": "<SITTER1_ID>",
      "sender": { "id": "...", "full_name": "박돌봄" },
      "createdAt": "..."
    }
  ],
  "nextCursor": null
}
```

**커서 기반 페이지네이션:**

```bash
# limit=2로 첫 페이지 조회
curl -X GET "http://localhost:3000/chat-rooms/<CHATROOM1_ID>/messages?limit=2" \
  -H "Authorization: Bearer <OWNER1_TOKEN>"

# nextCursor로 다음 페이지 조회
curl -X GET "http://localhost:3000/chat-rooms/<CHATROOM1_ID>/messages?limit=2&cursor=<NEXT_CURSOR>" \
  -H "Authorization: Bearer <OWNER1_TOKEN>"
```

---

### 23. 채팅 에러 케이스 테스트

#### 케이스 1: 권한 없는 사용자가 메시지 히스토리 조회 → 403

> chatRoom1은 owner1 ↔ sitter1 전용. owner2는 접근 불가.

```bash
curl -X GET "http://localhost:3000/chat-rooms/<CHATROOM1_ID>/messages" \
  -H "Authorization: Bearer <OWNER2_TOKEN>"
```

**예상 응답 (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "이 채팅방에 접근할 권한이 없습니다",
  "error": "Forbidden"
}
```

#### 케이스 2: 존재하지 않는 채팅방 조회 → 404

```bash
curl -X GET "http://localhost:3000/chat-rooms/00000000-0000-0000-0000-000000000000/messages" \
  -H "Authorization: Bearer <ANY_TOKEN>"
```

**예상 응답 (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "ChatRoom not found",
  "error": "Not Found"
}
```

---

### 24. WebSocket 채팅 테스트 (Socket.io)

> WebSocket은 Swagger로 테스트할 수 없습니다. Node.js 스크립트 또는 Socket.io 클라이언트를 사용하세요.

**연결:**
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: { token: 'JWT토큰 (Bearer 제외)' },
});
```

**채팅방 입장 (chatRoom3 = 메시지 없는 빈 채팅방):**
```typescript
// applications[5]의 ID로 joinRoom
socket.emit('joinRoom', { jobApplicationId: '<APPLICATION5_ID>' });

socket.on('joinedRoom', (data) => {
  console.log('입장:', data.chatRoomId);
});
```

**메시지 송수신:**
```typescript
socket.emit('sendMessage', { chatRoomId: '<CHATROOM3_ID>', content: '안녕하세요!' });

socket.on('receiveMessage', (msg) => {
  console.log('수신:', msg.content, '보낸 사람:', msg.sender.full_name);
});
```

**읽음처리 알림:**
```typescript
socket.on('messagesRead', (data) => {
  console.log(`${data.userId}가 읽음 (${data.lastReadAt})`);
});
```

**에러 처리:**
```typescript
socket.on('error', (err) => {
  console.error('에러:', err.message);
});
```

---

## 📊 REST API 엔드포인트 요약

### Users

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|------|------|
| POST | `/users` | 회원가입 | ❌ Public | - |
| GET | `/users/:id` | 사용자 조회 | ✅ | - |
| PUT | `/users/:id` | 사용자 수정 | ✅ | 본인 or Admin |
| DELETE | `/users/:id` | 사용자 삭제 | ✅ | 본인 or Admin |
| GET | `/users/:id/jobs` | 사용자 생성 구인공고 | ✅ | - |
| GET | `/users/:id/job-applications` | 사용자 지원 이력 | ✅ | - |

### Sessions

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|------|------|
| POST | `/sessions` | 로그인 | ❌ Public | - |

### Jobs

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|------|------|
| POST | `/jobs` | 구인공고 등록 | ✅ | PetOwner |
| GET | `/jobs` | 구인공고 목록 (필터링/페이징) | ✅ | - |
| GET | `/jobs/:id` | 구인공고 상세 | ✅ | - |
| PUT | `/jobs/:id` | 구인공고 수정 | ✅ | 작성자 or Admin |
| DELETE | `/jobs/:id` | 구인공고 삭제 | ✅ | 작성자 or Admin |

### Job Applications

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|------|------|
| POST | `/jobs/:jobId/job-applications` | 구인공고 지원 | ✅ | PetSitter |
| GET | `/jobs/:jobId/job-applications` | 구인공고별 지원 목록 | ✅ | 작성자 |
| PATCH | `/job-applications/:id` | 지원 상태 수정 (승인/거절) | ✅ | 구인공고 작성자 |

### Favorites (즐겨찾기)

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|------|------|
| POST | `/favorites` | 즐겨찾기 토글 (추가/제거) | ✅ | PetSitter |
| GET | `/favorites` | 내 즐겨찾기 목록 조회 | ✅ | PetSitter |
| DELETE | `/favorites/:jobId` | 즐겨찾기 직접 제거 | ✅ | PetSitter |

### Chat (채팅)

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|------|------|
| GET | `/chat-rooms` | 내 채팅방 목록 (최근 메시지 + 안읽은 수) | ✅ | - |
| GET | `/chat-rooms/:id/messages` | 메시지 히스토리 (커서 페이지네이션) | ✅ | 채팅 참여자 |

### WebSocket (실시간 채팅)

| 이벤트 | 방향 | Payload | 설명 |
|--------|------|---------|------|
| `joinRoom` | client → server | `{ jobApplicationId }` | 채팅방 입장 + 읽음처리 |
| `joinedRoom` | server → client | `{ chatRoomId, jobApplicationId }` | 입장 확인 |
| `sendMessage` | client → server | `{ chatRoomId, content }` | 메시지 전송 |
| `receiveMessage` | server → room | `{ id, content, sender_id, ... }` | 메시지 수신 |
| `messagesRead` | server → room | `{ chatRoomId, userId, lastReadAt }` | 읽음 상태 알림 |
| `error` | server → client | `{ message }` | 에러 알림 |

---

## 🔧 Query Parameters (필터링/페이징)

### GET /jobs 예시

**Query Parameters:**
```
page=1                           # 페이지 번호 (기본값: 1)
limit=10                         # 페이지당 항목 수 (기본값: 10)
animalType=DOG                   # 동물 유형 필터
size=MEDIUM                      # 크기 필터
activity=산책                     # 활동 유형 필터
startDate=2026-02-01             # 시작 날짜 필터
endDate=2026-02-28               # 종료 날짜 필터
search=강아지                     # 검색어 (활동, 품종 등)
sortBy=createdAt                 # 정렬 기준
sortOrder=desc                   # 정렬 순서 (asc/desc)
min_price=10000                  # 최소 가격 필터 (이상)
max_price=50000                  # 최대 가격 필터 (이하)
```

**요청 예시:**
```bash
curl -X GET "http://localhost:3000/jobs?page=1&limit=10&animalType=DOG&size=MEDIUM" \
  -H "Authorization: Bearer {token}"
```

**응답 예시:**
```json
{
  "items": [
    {
      "id": "job-uuid",
      "activity": "산책",
      "start_time": "2026-02-10T10:00:00Z",
      "end_time": "2026-02-10T12:00:00Z",
      "pets": [
        {
          "id": "pet-uuid",
          "name": "멍멍이",
          "species": "DOG",
          "size": "MEDIUM"
        }
      ]
    }
  ],
  "totalCount": 25,
  "currentPage": 1,
  "totalPages": 3,
  "hasNextPage": true
}
```

---

## ✅ Best Practices

### 1. **Controller는 얇게 유지**
```typescript
// ❌ 나쁜 예
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundException();
  return user;
}

// ✅ 좋은 예
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.usersService.findOne(id);  // Service로 위임
}
```

### 2. **DTO 검증 활용**
```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
```

### 3. **에러 처리 일관성**
```typescript
// Service에서 적절한 Exception 사용
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new UnauthorizedException('Invalid credentials');
```

### 4. **응답 포맷 표준화**
```typescript
// 성공 응답
{ "data": { ... } }

// 에러 응답
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 🚨 트러블슈팅

### 1. "The table does not exist"
```bash
npx prisma db push
npx prisma generate
```

### 2. ValidationPipe 동작 안함
```typescript
// main.ts에 전역 설정 확인
app.useGlobalPipes(new ValidationPipe());
```

### 3. CORS 에러
```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});
```

---

## 📚 참고 자료

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [class-validator](https://github.com/typestack/class-validator)
- [OpenAPI Specification](https://swagger.io/specification/)

---

**문서 버전**: 1.3
**최종 수정일**: 2026-02-13
