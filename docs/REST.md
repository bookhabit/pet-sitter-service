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
7. [OpenAPI(Swagger) 문서](#openapi-문서)

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

**문서 버전**: 1.0
**최종 수정일**: 2026-02-09
