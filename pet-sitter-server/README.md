# PetSitter API

반려동물 돌봄 서비스를 위한 NestJS 기반 백엔드 API입니다.

## 📋 프로젝트 소개

PetSitter API는 반려동물 주인(PetOwner)과 돌봄 도우미(PetSitter)를 연결하는 플랫폼입니다. 주인은 반려동물 돌봄 구인공고를 등록하고, 도우미는 공고를 조회하고 지원할 수 있습니다.

### 주요 기능

- **사용자 관리**: 회원가입, 로그인, 프로필 관리
- **구인공고 관리**: 반려동물 정보와 함께 돌봄 공고 등록/조회/수정/삭제
- **지원서 관리**: 도우미가 공고에 지원하고, 상태 관리
- **인증/인가**: JWT 기반 인증 및 역할 기반 접근 제어
- **검색 및 필터링**: 날짜, 활동 유형, 반려동물 종류/나이로 공고 검색
- **페이지네이션**: Cursor 기반 페이지네이션 지원

## 🏗️ 백엔드 구조

### 기술 스택

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **API Documentation**: Swagger/OpenAPI 3.0

### 프로젝트 구조

```
nest-study/
├── src/
│   ├── auth/              # 인증/인가 모듈
│   │   ├── decorators/    # 커스텀 데코레이터 (Public, Roles, CurrentUser)
│   │   └── guards/        # 가드 (JwtAuthGuard, RolesGuard)
│   ├── users/             # 사용자 모듈
│   ├── sessions/          # 세션/로그인 모듈
│   ├── jobs/              # 구인공고 모듈
│   ├── job-application/  # 지원서 모듈
│   ├── prisma/            # Prisma 서비스
│   └── common/            # 공통 모듈
├── prisma/
│   ├── schema.prisma      # 데이터베이스 스키마
│   └── migrations/       # 마이그레이션 파일
├── scripts/
│   └── seed.ts            # 테스트 데이터 생성 스크립트
└── openapi.yml            # OpenAPI 스펙
```

### 아키텍처

- **모듈화**: 기능별로 모듈 분리 (Users, Jobs, JobApplications 등)
- **레이어드 아키텍처**: Controller → Service → Repository(Prisma)
- **DTO 패턴**: class-validator를 사용한 요청/응답 검증
- **Guard 기반 인증**: 전역 JWT Guard + 역할 기반 접근 제어

## 🗄️ 데이터베이스 구조

### 주요 모델

- **User**: 사용자 정보 (이메일, 이름, 비밀번호, 역할)
- **Job**: 구인공고 (시작/종료 시간, 활동 내용)
- **Pet**: 반려동물 정보 (이름, 나이, 종류, 품종, 크기)
- **JobApplication**: 지원서 (상태: applying, approved, rejected)
- **Session**: 로그인 세션 정보

### 관계

- User 1:N Job (한 사용자가 여러 공고 생성)
- Job 1:N Pet (한 공고에 여러 반려동물)
- Job 1:N JobApplication (한 공고에 여러 지원서)
- User 1:N JobApplication (한 사용자가 여러 공고에 지원)

### Enum 타입

- **Role**: `PetOwner`, `PetSitter`, `Admin`
- **PetSpecies**: `Cat`, `Dog`
- **ApproveStatus**: `applying`, `approved`, `rejected`

## 🔌 API 엔드포인트

### 인증

- `POST /sessions` - 로그인 (Public)

### 사용자

- `POST /users` - 회원가입 (Public)
- `GET /users/:id` - 사용자 조회
- `PUT /users/:id` - 사용자 정보 수정
- `DELETE /users/:id` - 사용자 삭제
- `GET /users/:id/jobs` - 사용자가 생성한 공고 목록
- `GET /users/:id/job-applications` - 사용자가 지원한 공고 목록

### 구인공고

- `POST /jobs` - 공고 등록 (PetOwner만 가능)
- `GET /jobs` - 공고 목록 조회 (필터링, 정렬, 페이지네이션 지원)
- `GET /jobs/:id` - 공고 상세 조회
- `PUT /jobs/:id` - 공고 수정
- `DELETE /jobs/:id` - 공고 삭제

### 지원서

- `POST /jobs/:jobId/job-applications` - 공고에 지원 (PetSitter만 가능)
- `GET /jobs/:jobId/job-applications` - 공고별 지원서 목록
- `GET /job-applications/:id` - 지원서 상세 조회
- `PUT /job-applications/:id` - 지원서 상태 수정

### API 문서

서버 실행 후 Swagger UI에서 전체 API 문서를 확인할 수 있습니다:

```
http://localhost:8000/api
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- PostgreSQL 12.x 이상
- npm 또는 yarn

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd nest-study
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 변수를 설정하세요:

```env
# 서버 포트
PORT=8000

# 데이터베이스 연결 정보
# 형식: postgresql://[사용자명]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]
DATABASE_URL="postgresql://ckeh0827:ho0827@localhost:5432/nestStudy"

# JWT 토큰 시크릿 키 (프로덕션에서는 반드시 강력한 키 사용)
JWT_SECRET="your-secret-key-here"
```

**PostgreSQL 데이터베이스 설정 방법:**

#### 옵션 1: Docker를 사용한 PostgreSQL 실행 (권장)

```bash
docker run --name neststudy-postgres \
  -e POSTGRES_USER=ckeh0827 \
  -e POSTGRES_PASSWORD=ho0827 \
  -e POSTGRES_DB=nestStudy \
  -p 5432:5432 \
  -d postgres:17
```

#### 옵션 2: 로컬 PostgreSQL 설치

로컬에 PostgreSQL이 설치되어 있다면, 다음 명령어로 데이터베이스를 생성하세요:

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE nestStudy;

# 사용자 생성 (필요한 경우)
CREATE USER ckeh0827 WITH PASSWORD 'ho0827';
GRANT ALL PRIVILEGES ON DATABASE nestStudy TO ckeh0827;
```

> **💡 참고**: 위 예시의 사용자명, 비밀번호, 데이터베이스명은 개발 환경용입니다. 프로덕션에서는 보안을 위해 다른 값을 사용하세요.

### 4. 데이터베이스 설정

#### Prisma Client 생성

Prisma 스키마를 기반으로 TypeScript 타입을 생성합니다:

```bash
npx prisma generate
```

#### 데이터베이스 마이그레이션

스키마를 데이터베이스에 적용합니다:

```bash
npx prisma migrate dev
```

또는 초기 마이그레이션만 실행:

```bash
npx prisma migrate deploy
```

> **💡 권장 워크플로우**
> 
> 1. `schema.prisma` 파일 수정
> 2. `npx prisma migrate dev --name <migration-name>` 실행
> 3. 자동으로 Prisma Client가 재생성됨
> 4. 필요시 `npx prisma db seed`로 테스트 데이터 생성

### 5. 테스트 데이터 생성

개발 및 테스트를 위한 샘플 데이터를 생성합니다:

```bash
npm run seed
```

또는 Prisma 공식 명령어:

```bash
npx prisma db seed
```

**생성되는 테스트 계정:**

- PetOwner 1: `owner1@test.com` / `password123`
- PetOwner 2: `owner2@test.com` / `password123`
- PetSitter 1: `sitter1@test.com` / `password123`
- PetSitter 2: `sitter2@test.com` / `password123`
- Admin: `admin@test.com` / `password123`
- Both (PetOwner + PetSitter): `both@test.com` / `password123`

> ⚠️ **주의**: `seed.ts`는 production 환경에서 실행되지 않도록 보호되어 있습니다.

### 6. 서버 실행

```bash
# 개발 모드 (watch 모드)
npm run start:dev

# 프로덕션 모드
npm run build
npm run start:prod
```

서버가 실행되면:

- API 서버: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api`

## 🛠️ Prisma 사용법

### Prisma Studio

데이터베이스를 시각적으로 탐색하고 편집할 수 있는 GUI 도구입니다:

```bash
npx prisma studio
```

브라우저에서 `http://localhost:5555`로 접속하여 데이터를 확인하고 수정할 수 있습니다.

> **💡 권장 사용 시나리오**
> - 개발 중 데이터 확인 및 수정
> - 관계형 데이터 탐색
> - 빠른 데이터 검증

### Prisma 명령어 요약

| 명령어 | 설명 | 사용 시점 |
|--------|------|-----------|
| `npx prisma generate` | Prisma Client 생성 | 스키마 변경 후, 또는 처음 설치 시 |
| `npx prisma migrate dev` | 개발용 마이그레이션 생성 및 적용 | 스키마 변경 후 |
| `npx prisma migrate deploy` | 프로덕션 마이그레이션 적용 | 배포 시 |
| `npx prisma db seed` | 시드 데이터 생성 | 개발/테스트 환경 |
| `npx prisma studio` | 데이터베이스 GUI 도구 실행 | 데이터 확인/수정 시 |
| `npx prisma format` | 스키마 파일 포맷팅 | 스키마 작성 후 |

### 일반적인 개발 워크플로우

1. **스키마 수정**
   ```bash
   # prisma/schema.prisma 파일 편집
   ```

2. **마이그레이션 생성 및 적용**
   ```bash
   npx prisma migrate dev --name add_new_field
   ```
   - 자동으로 Prisma Client가 재생성됩니다
   - 마이그레이션 파일이 `prisma/migrations/`에 생성됩니다

3. **테스트 데이터 생성 (선택)**
   ```bash
   npx prisma db seed
   ```

4. **데이터 확인**
   ```bash
   npx prisma studio
   ```

### 프로덕션 배포 시

```bash
# 1. 마이그레이션만 적용 (마이그레이션 파일은 이미 생성되어 있어야 함)
npx prisma migrate deploy

# 2. Prisma Client 생성
npx prisma generate

# 3. 애플리케이션 빌드 및 실행
npm run build
npm run start:prod
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:cov
```

## 📝 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run start:dev` | 개발 모드 (watch) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start:prod` | 프로덕션 실행 |
| `npm run seed` | 테스트 데이터 생성 |
| `npm run lint` | 코드 린팅 |

## 📚 추가 문서

- [API 사용 예제](./docs/API_USAGE_EXAMPLES.md)
- [요구사항 문서](./docs/REQUIREMENTS.md)
- [OpenAPI 스펙](./openapi.yml)

## ⚙️ 환경 변수 설정 예시

### .env 파일 예시

```env
# 서버 포트
PORT=8000

# 데이터베이스 연결 정보
# 형식: postgresql://[사용자명]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]
DATABASE_URL="postgresql://ckeh0827:ho0827@localhost:5432/nestStudy"

# JWT 토큰 시크릿 키
JWT_SECRET="your-secret-key-here"
```

### Docker를 사용한 PostgreSQL 실행

```bash
docker run --name neststudy-postgres \
  -e POSTGRES_USER=ckeh0827 \
  -e POSTGRES_PASSWORD=ho0827 \
  -e POSTGRES_DB=nestStudy \
  -p 5432:5432 \
  -d postgres:17
```

**환경 변수 설명:**

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `PORT` | 서버가 실행될 포트 번호 | `8000` |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://사용자명:비밀번호@호스트:포트/DB명` |
| `JWT_SECRET` | JWT 토큰 서명에 사용할 시크릿 키 | 임의의 강력한 문자열 |

> **⚠️ 보안 주의사항**: 
> - `.env` 파일은 절대 Git에 커밋하지 마세요
> - 프로덕션 환경에서는 강력한 비밀번호와 JWT_SECRET을 사용하세요
> - `.gitignore`에 `.env`가 포함되어 있는지 확인하세요


## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
