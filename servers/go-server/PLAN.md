# Go 펫시터 서버 구축 플랜

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 언어 | **Go 1.22+** | 강타입, 빠른 컴파일, 낮은 메모리 |
| 웹 프레임워크 | **Gin** | 가장 널리 쓰이는 Go HTTP 프레임워크, 미들웨어 풍부 |
| ORM | **GORM v2** | Go 표준 ORM, PostgreSQL 지원, Auto-migrate |
| 데이터베이스 | **PostgreSQL** | NestJS 서버와 동일 |
| 인증 | **golang-jwt/jwt v5** | JWT Access(15m) + Refresh(7d) |
| 비밀번호 | **bcrypt** (`golang.org/x/crypto`) | NestJS와 동일 알고리즘 |
| 유효성 검사 | **go-playground/validator v10** | struct 태그 기반, NestJS class-validator 대응 |
| 환경 변수 | **godotenv** + `os.Getenv` | `.env` 파일 로드 |
| 파일 업로드 | Go 내장 `multipart` | 외부 라이브러리 불필요 |
| WebSocket | **googollee/go-socket.io** | Socket.IO 프로토콜 완전 호환 (클라이언트 코드 변경 없음) |
| DB 마이그레이션 | **golang-migrate** | SQL 파일 기반, 버전 관리 |
| API 문서 | **swaggo/swag** | Swagger UI 자동 생성 |
| 로깅 | **zerolog** | 구조화된 JSON 로그 |
| 테스트 | Go 내장 `testing` + **testify** | 단위/통합 테스트 |

---

## 2. 아키텍처 — NestJS 모듈과 1:1 대응

```
NestJS              Go
─────────────────────────────────────
Controller    →    Handler (Gin)
Service       →    Service
Repository    →    Repository (GORM)
Module        →    패키지 (internal/feature/)
DTO           →    Request/Response struct
Guard         →    Middleware / Gin Handler
Decorator     →    Gin Context helper
```

### 전체 데이터 흐름

```
HTTP Request
  └─ Router (Gin)
       └─ Middleware (Auth, CORS, Logger)
            └─ Handler
                 └─ Service (비즈니스 로직)
                      └─ Repository (GORM 쿼리)
                           └─ PostgreSQL
```

---

## 3. 프로젝트 구조

```
pet-sitter-go-server/
├── cmd/
│   └── server/
│       └── main.go                  ← 진입점 (Router 조립, DB 연결)
│
├── internal/
│   ├── config/
│   │   └── config.go                ← 환경 변수 로드 (godotenv)
│   │
│   ├── db/
│   │   ├── database.go              ← GORM DB 연결
│   │   └── migrate.go               ← Auto-migrate 실행
│   │
│   ├── middleware/
│   │   ├── auth.go                  ← JWT 검증 (RequireAuth, RequireRole)
│   │   ├── cors.go
│   │   └── logger.go
│   │
│   ├── users/
│   │   ├── handler.go               ← POST /users, GET/PUT/DELETE /users/:id
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── dto.go                   ← CreateUserRequest, UpdateUserRequest, UserResponse
│   │
│   ├── sessions/
│   │   ├── handler.go               ← POST /sessions, POST /sessions/refresh, DELETE /sessions
│   │   ├── service.go               ← login, refresh, logout
│   │   ├── repository.go
│   │   └── dto.go                   ← LoginRequest, LoginResponse, RefreshRequest
│   │
│   ├── jobs/
│   │   ├── handler.go               ← POST/GET /jobs, GET/PUT/DELETE /jobs/:id
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── dto.go                   ← CreateJobRequest, UpdateJobRequest, JobResponse, JobFilter
│   │
│   ├── job_applications/
│   │   ├── handler.go               ← POST /jobs/:id/job-applications, GET, PUT /job-applications/:id
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── dto.go
│   │
│   ├── photos/
│   │   ├── handler.go               ← POST /photos/upload, POST /users/:id/photos 등
│   │   ├── service.go               ← 파일 저장, 메타데이터 DB 기록
│   │   ├── repository.go
│   │   └── dto.go
│   │
│   ├── reviews/
│   │   ├── handler.go               ← POST /jobs/:jobId/reviews, GET /users/:id/reviews, DELETE /reviews/:id
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── dto.go
│   │
│   ├── favorites/
│   │   ├── handler.go               ← POST /favorites, GET /favorites, DELETE /favorites/:jobId
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── dto.go
│   │
│   ├── chat/
│   │   ├── handler.go               ← GET /chat-rooms, GET /chat-rooms/:id/messages
│   │   ├── gateway.go               ← Socket.IO 게이트웨이 (go-socket.io)
│   │   ├── service.go
│   │   ├── repository.go
│   │   └── dto.go
│   │
│   └── common/
│       ├── response.go              ← 공통 응답 헬퍼 (Success, Error, Paginated)
│       ├── pagination.go            ← 커서 기반 페이지네이션
│       └── errors.go                ← AppError, HttpError
│
├── models/                          ← GORM 모델 (Prisma schema 대응)
│   ├── user.go
│   ├── job.go
│   ├── pet.go
│   ├── job_application.go
│   ├── session.go
│   ├── photo.go
│   ├── review.go
│   ├── favorite.go
│   ├── chat_room.go
│   ├── message.go
│   └── chat_room_read.go
│
├── migrations/                      ← SQL 마이그레이션 파일
│   ├── 000001_init.up.sql
│   ├── 000001_init.down.sql
│   └── ...
│
├── uploads/                         ← 업로드 파일 저장 디렉토리
├── docs/                            ← Swagger 생성 파일 (swag init)
├── .env
├── .env.example
├── go.mod
├── go.sum
├── Dockerfile
└── compose.yml
```

---

## 4. go.mod 주요 의존성

```go
module github.com/your-org/pet-sitter-go-server

go 1.22

require (
    // 웹 프레임워크
    github.com/gin-gonic/gin v1.10.0
    github.com/gin-contrib/cors v1.7.2

    // ORM
    gorm.io/gorm v1.25.10
    gorm.io/driver/postgres v1.5.9

    // Auth
    github.com/golang-jwt/jwt/v5 v5.2.1
    golang.org/x/crypto v0.23.0

    // 유효성 검사
    github.com/go-playground/validator/v10 v10.22.0

    // 환경 변수
    github.com/joho/godotenv v1.5.1

    // WebSocket (Socket.IO)
    github.com/googollee/go-socket.io v1.7.0

    // DB 마이그레이션
    github.com/golang-migrate/migrate/v4 v4.17.1

    // 로깅
    github.com/rs/zerolog v1.33.0

    // API 문서
    github.com/swaggo/swag v1.16.3
    github.com/swaggo/gin-swagger v1.6.0

    // 테스트
    github.com/stretchr/testify v1.9.0

    // UUID
    github.com/google/uuid v1.6.0
)
```

---

## 5. GORM 모델 (Prisma Schema 대응)

```go
// models/user.go
type Role string
const (
  RolePetOwner Role = "PetOwner"
  RolePetSitter Role = "PetSitter"
  RoleAdmin Role = "Admin"
)

type User struct {
  ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
  Email     string    `gorm:"uniqueIndex;not null" json:"email"`
  FullName  string    `gorm:"column:full_name;not null" json:"full_name"`
  Password  string    `gorm:"not null" json:"-"`
  Roles     []Role    `gorm:"type:text[];not null;default:'{}'" json:"roles"`
  CreatedAt time.Time `json:"created_at"`
  UpdatedAt time.Time `json:"updated_at"`

  // 관계
  CreatedJobs     []Job             `gorm:"foreignKey:CreatorUserID" json:"-"`
  JobApplications []JobApplication  `gorm:"foreignKey:UserID" json:"-"`
  Photos          []Photo           `gorm:"foreignKey:UserID" json:"photos,omitempty"`
  UploadedPhotos  []Photo           `gorm:"foreignKey:UploaderID" json:"-"`
  ReviewsGiven    []Review          `gorm:"foreignKey:ReviewerID" json:"-"`
  ReviewsReceived []Review          `gorm:"foreignKey:RevieweeID" json:"-"`
  Favorites       []Favorite        `gorm:"foreignKey:UserID" json:"-"`
}

// models/job.go
type PriceType string
const (
  PriceTypeHourly PriceType = "hourly"
  PriceTypeDaily  PriceType = "daily"
)

type Job struct {
  ID            string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
  CreatorUserID string     `gorm:"column:creator_user_id;not null" json:"creator_user_id"`
  StartTime     time.Time  `gorm:"column:start_time;not null" json:"start_time"`
  EndTime       time.Time  `gorm:"column:end_time;not null" json:"end_time"`
  Activity      string     `gorm:"not null" json:"activity"`
  Address       *string    `json:"address,omitempty"`
  Latitude      *float64   `json:"latitude,omitempty"`
  Longitude     *float64   `json:"longitude,omitempty"`
  Price         *int       `json:"price,omitempty"`
  PriceType     *PriceType `gorm:"column:price_type" json:"price_type,omitempty"`
  CreatedAt     time.Time  `json:"created_at"`
  UpdatedAt     time.Time  `json:"updated_at"`

  Creator         User             `gorm:"foreignKey:CreatorUserID" json:"creator,omitempty"`
  Pets            []Pet            `gorm:"foreignKey:JobID" json:"pets,omitempty"`
  JobApplications []JobApplication `gorm:"foreignKey:JobID" json:"-"`
  Photos          []Photo          `gorm:"foreignKey:JobID" json:"photos,omitempty"`
  Reviews         []Review         `gorm:"foreignKey:JobID" json:"-"`
  Favorites       []Favorite       `gorm:"foreignKey:JobID" json:"-"`
}

// models/pet.go
type PetSpecies string
const (
  PetSpeciesCat PetSpecies = "Cat"
  PetSpeciesDog PetSpecies = "Dog"
)

type Pet struct {
  ID        string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
  Name      string     `gorm:"not null" json:"name"`
  Age       int        `gorm:"not null" json:"age"`
  Species   PetSpecies `gorm:"type:text;not null" json:"species"`
  Breed     string     `gorm:"not null" json:"breed"`
  Size      *string    `json:"size,omitempty"`
  JobID     string     `gorm:"column:job_id;not null" json:"job_id"`
  CreatedAt time.Time  `json:"created_at"`
  UpdatedAt time.Time  `json:"updated_at"`

  Photos []Photo `gorm:"foreignKey:PetID" json:"photos,omitempty"`
}
```

---

## 6. 인증 플로우 (JWT + Session DB)

### 로그인 응답 구조 (NestJS 동일)

```go
// internal/sessions/dto.go
type LoginRequest struct {
  Email    string `json:"email" validate:"required,email"`
  Password string `json:"password" validate:"required,min=8"`
}

type LoginResponse struct {
  AccessToken  string       `json:"access_token"`
  RefreshToken string       `json:"refresh_token"`
  User         UserResponse `json:"user"`
}

type RefreshRequest struct {
  RefreshToken string `json:"refreshToken" validate:"required"`
}

type RefreshResponse struct {
  AccessToken     string `json:"accessToken"`
  NewRefreshToken string `json:"newRefreshToken"`
}
```

### 서비스 로직

```go
// internal/sessions/service.go

func (s *SessionService) Login(req LoginRequest) (*LoginResponse, error) {
  // 1. 이메일로 사용자 조회
  user, err := s.userRepo.FindByEmail(req.Email)
  if err != nil { return nil, ErrInvalidCredentials }

  // 2. 비밀번호 검증 (bcrypt)
  if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
    return nil, ErrInvalidCredentials
  }

  // 3. Access Token 생성 (15분)
  accessToken, _ := generateJWT(user.ID, user.Email, "access", 15*time.Minute)

  // 4. Refresh Token 생성 (7일)
  refreshToken, _ := generateJWT(user.ID, user.Email, "refresh", 7*24*time.Hour)

  // 5. Refresh Token 해시 → Session DB 저장 (upsert)
  hash, _ := bcrypt.GenerateFromPassword([]byte(refreshToken), 12)
  s.sessionRepo.Upsert(user.ID, string(hash))

  return &LoginResponse{AccessToken: accessToken, RefreshToken: refreshToken, User: toUserResponse(user)}, nil
}

func (s *SessionService) Refresh(refreshToken string) (*RefreshResponse, error) {
  // 1. JWT 파싱 → userId 추출
  claims, err := verifyJWT(refreshToken, config.JWTRefreshSecret)
  if err != nil { return nil, ErrInvalidToken }

  // 2. Session DB에서 해시 조회 + bcrypt 검증
  session, err := s.sessionRepo.FindByUserID(claims.UserID)
  if err != nil { return nil, ErrInvalidToken }

  if err := bcrypt.CompareHashAndPassword([]byte(session.RefreshTokenHash), []byte(refreshToken)); err != nil {
    return nil, ErrInvalidToken
  }

  // 3. 새 토큰 발급 + Session 업데이트
  newAccess, _  := generateJWT(claims.UserID, claims.Email, "access", 15*time.Minute)
  newRefresh, _ := generateJWT(claims.UserID, claims.Email, "refresh", 7*24*time.Hour)
  newHash, _    := bcrypt.GenerateFromPassword([]byte(newRefresh), 12)
  s.sessionRepo.UpdateHash(claims.UserID, string(newHash))

  return &RefreshResponse{AccessToken: newAccess, NewRefreshToken: newRefresh}, nil
}
```

### Auth 미들웨어

```go
// internal/middleware/auth.go
func RequireAuth() gin.HandlerFunc {
  return func(c *gin.Context) {
    token := extractBearerToken(c)
    if token == "" {
      c.AbortWithStatusJSON(401, gin.H{"error": "token required"})
      return
    }

    claims, err := verifyJWT(token, config.JWTAccessSecret)
    if err != nil {
      c.AbortWithStatusJSON(401, gin.H{"error": "invalid token"})
      return
    }

    c.Set("user_id", claims.UserID)
    c.Set("user_roles", claims.Roles)
    c.Next()
  }
}

func RequireRole(roles ...Role) gin.HandlerFunc {
  return func(c *gin.Context) {
    userRoles := c.MustGet("user_roles").([]Role)
    for _, required := range roles {
      for _, has := range userRoles {
        if has == required {
          c.Next()
          return
        }
      }
    }
    c.AbortWithStatusJSON(403, gin.H{"error": "forbidden"})
  }
}
```

---

## 7. 전체 API 엔드포인트 (NestJS 동일)

```go
// cmd/server/main.go 라우터 구성
r := gin.Default()
r.Use(middleware.CORS(), middleware.Logger())

// 정적 파일 서빙
r.Static("/uploads", "./uploads")

api := r.Group("/")

// ─── Public ───────────────────────────────────────
api.POST("/users",            users.Handler.Create)
api.POST("/sessions",         sessions.Handler.Login)
api.POST("/sessions/refresh", sessions.Handler.Refresh)

// ─── Authenticated ────────────────────────────────
auth := api.Group("/", middleware.RequireAuth())

auth.GET("/users/:id",              users.Handler.GetOne)
auth.PUT("/users/:id",              users.Handler.Update)
auth.DELETE("/users/:id",           users.Handler.Delete)
auth.GET("/users/:id/jobs",         jobs.Handler.ListByUser)
auth.GET("/users/:userId/reviews",  reviews.Handler.ListByUser)

auth.POST("/users/:id/photos",      photos.Handler.UploadUserPhoto)
auth.POST("/jobs/:id/photos",       photos.Handler.UploadJobPhoto)
auth.POST("/pets/:id/photos",       photos.Handler.UploadPetPhoto)
auth.POST("/photos/upload",         photos.Handler.BulkUpload)
auth.DELETE("/photos/:id",          photos.Handler.Delete)

auth.GET("/jobs",                   jobs.Handler.List)         // 필터/페이징
auth.GET("/jobs/:id",               jobs.Handler.GetOne)
auth.POST("/jobs",                  middleware.RequireRole(RolePetOwner), jobs.Handler.Create)
auth.PUT("/jobs/:id",               jobs.Handler.Update)
auth.DELETE("/jobs/:id",            jobs.Handler.Delete)

auth.POST("/jobs/:jobId/job-applications",  middleware.RequireRole(RolePetSitter), jobApps.Handler.Create)
auth.GET("/jobs/:jobId/job-applications",   jobApps.Handler.List)
auth.PUT("/job-applications/:id",           jobApps.Handler.Update)

auth.POST("/jobs/:jobId/reviews",   reviews.Handler.Create)
auth.DELETE("/reviews/:id",         reviews.Handler.Delete)

auth.POST("/favorites",             middleware.RequireRole(RolePetSitter), favorites.Handler.Toggle)
auth.GET("/favorites",              middleware.RequireRole(RolePetSitter), favorites.Handler.List)
auth.DELETE("/favorites/:jobId",    middleware.RequireRole(RolePetSitter), favorites.Handler.Remove)

auth.GET("/chat-rooms",             chat.Handler.ListRooms)
auth.GET("/chat-rooms/:id/messages", chat.Handler.ListMessages)

auth.DELETE("/sessions",            sessions.Handler.Logout)

// Swagger
r.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

// Socket.IO
setupSocketIO(r)
```

---

## 8. 공고 목록 — 필터링 + 커서 페이징

```go
// internal/jobs/dto.go
type JobFilter struct {
  Page       int     `form:"page"`
  Limit      int     `form:"limit"`
  AnimalType string  `form:"animalType"`
  Size       string  `form:"size"`
  Activity   string  `form:"activity"`
  StartDate  string  `form:"startDate"`
  EndDate    string  `form:"endDate"`
  Search     string  `form:"search"`
  MinPrice   *int    `form:"min_price"`
  MaxPrice   *int    `form:"max_price"`
}

// internal/jobs/repository.go
func (r *JobRepository) FindAll(filter JobFilter) ([]Job, int64, error) {
  query := r.db.Model(&Job{}).Preload("Pets").Preload("Photos").Preload("Creator")

  if filter.Search != "" {
    query = query.Where("activity ILIKE ? OR EXISTS (SELECT 1 FROM pets WHERE pets.job_id = jobs.id AND (pets.name ILIKE ? OR pets.breed ILIKE ?))",
      "%"+filter.Search+"%", "%"+filter.Search+"%", "%"+filter.Search+"%")
  }
  if filter.AnimalType != "" {
    query = query.Where("EXISTS (SELECT 1 FROM pets WHERE pets.job_id = jobs.id AND pets.species = ?)", filter.AnimalType)
  }
  if filter.MinPrice != nil {
    query = query.Where("price >= ?", *filter.MinPrice)
  }
  if filter.MaxPrice != nil {
    query = query.Where("price <= ?", *filter.MaxPrice)
  }
  if filter.StartDate != "" {
    query = query.Where("start_time >= ?", filter.StartDate)
  }

  var total int64
  query.Count(&total)

  offset := (filter.Page - 1) * filter.Limit
  var jobs []Job
  err := query.Offset(offset).Limit(filter.Limit).Order("created_at DESC").Find(&jobs).Error
  return jobs, total, err
}
```

---

## 9. 파일 업로드

```go
// internal/photos/handler.go
func (h *PhotoHandler) BulkUpload(c *gin.Context) {
  uploaderID := c.GetString("user_id")
  form, _ := c.MultipartForm()
  files := form.File["file"]

  if len(files) > 10 {
    c.JSON(400, gin.H{"error": "최대 10개까지 업로드 가능합니다"})
    return
  }

  var results []PhotoResponse
  for _, fileHeader := range files {
    // 1. MIME 검증 (image/jpeg, image/png, image/webp만 허용)
    if !isAllowedMime(fileHeader.Header.Get("Content-Type")) {
      c.JSON(400, gin.H{"error": "허용되지 않는 파일 형식입니다"})
      return
    }
    // 2. 크기 검증 (5MB 이하)
    if fileHeader.Size > 5*1024*1024 {
      c.JSON(400, gin.H{"error": "파일 크기는 5MB 이하여야 합니다"})
      return
    }
    // 3. UUID 파일명 생성 + ./uploads/ 저장
    fileName := uuid.New().String() + filepath.Ext(fileHeader.Filename)
    dst := filepath.Join("uploads", fileName)
    c.SaveUploadedFile(fileHeader, dst)

    // 4. Photo 메타데이터 DB 저장
    photo, _ := h.service.SaveMeta(PhotoMeta{
      URL:          "/uploads/" + fileName,
      FileName:     fileName,
      OriginalName: fileHeader.Filename,
      MimeType:     fileHeader.Header.Get("Content-Type"),
      Size:         int(fileHeader.Size),
      UploaderID:   uploaderID,
    })
    results = append(results, toPhotoResponse(photo))
  }

  c.JSON(200, results)
}
```

---

## 10. 리뷰 — 비즈니스 로직

```go
// internal/reviews/service.go
func (s *ReviewService) Create(jobID, reviewerID string, req CreateReviewRequest) (*Review, error) {
  job, _ := s.jobRepo.FindOne(jobID)

  // PetOwner가 작성하는 경우
  if job.CreatorUserID == reviewerID {
    // approved 지원자 확인
    app, err := s.jobAppRepo.FindApproved(jobID)
    if err != nil { return nil, errors.New("승인된 지원자가 없습니다") }
    return s.reviewRepo.Create(Review{
      Rating:     req.Rating,
      Comment:    req.Comment,
      ReviewerID: reviewerID,
      RevieweeID: app.UserID,   // 서버에서 자동 결정
      JobID:      jobID,
    })
  }

  // PetSitter가 작성하는 경우
  app, err := s.jobAppRepo.FindApprovedByUser(jobID, reviewerID)
  if err != nil { return nil, errors.New("승인된 지원 내역이 없습니다") }
  _ = app
  return s.reviewRepo.Create(Review{
    Rating:     req.Rating,
    Comment:    req.Comment,
    ReviewerID: reviewerID,
    RevieweeID: job.CreatorUserID, // 서버에서 자동 결정
    JobID:      jobID,
  })
  // DB @@unique([job_id, reviewer_id]) 위반 시 409 반환
}
```

---

## 11. Socket.IO 채팅 게이트웨이

NestJS chat.gateway.ts와 동일한 이벤트/로직을 Go로 구현:

```go
// internal/chat/gateway.go
func SetupSocketIO(router *gin.Engine, chatService *ChatService, db *gorm.DB) {
  server := socketio.NewServer(nil)

  server.OnConnect("/chat", func(s socketio.Conn) error {
    // JWT 검증
    token := s.RemoteHeader().Get("Authorization")
    if token == "" {
      token, _ = url.QueryUnescape(s.URL().Query().Get("token"))
    }

    claims, err := verifyJWT(strings.TrimPrefix(token, "Bearer "), config.JWTAccessSecret)
    if err != nil {
      s.Emit("error", map[string]string{"message": "Authentication failed"})
      s.Close()
      return nil
    }

    // Session DB 확인
    var session Session
    if err := db.Where("user_id = ?", claims.UserID).First(&session).Error; err != nil {
      s.Emit("error", map[string]string{"message": "Session not found"})
      s.Close()
      return nil
    }

    s.SetContext(claims.UserID)
    s.Join("user:" + claims.UserID) // 개인 알림 룸
    return nil
  })

  // joinRoom 이벤트
  server.OnEvent("/chat", "joinRoom", func(s socketio.Conn, payload map[string]string) {
    userID := s.Context().(string)
    jobApplicationID := payload["jobApplicationId"]

    chatRoom, err := chatService.JoinRoom(jobApplicationID, userID)
    if err != nil {
      s.Emit("error", map[string]string{"message": err.Error()})
      return
    }

    s.Join(chatRoom.ID)
    lastReadAt, _ := chatService.MarkAsRead(chatRoom.ID, userID)

    server.BroadcastToRoom("/chat", chatRoom.ID, "messagesRead", map[string]interface{}{
      "chatRoomId": chatRoom.ID,
      "userId":     userID,
      "lastReadAt": lastReadAt,
    })
    s.Emit("joinedRoom", map[string]string{
      "chatRoomId":        chatRoom.ID,
      "jobApplicationId":  jobApplicationID,
    })
  })

  // sendMessage 이벤트
  server.OnEvent("/chat", "sendMessage", func(s socketio.Conn, payload map[string]string) {
    userID     := s.Context().(string)
    chatRoomID := payload["chatRoomId"]
    content    := payload["content"]

    message, err := chatService.SendMessage(chatRoomID, content, userID)
    if err != nil {
      s.Emit("error", map[string]string{"message": err.Error()})
      return
    }

    // 룸 전체에 메시지 브로드캐스트
    server.BroadcastToRoom("/chat", chatRoomID, "receiveMessage", message)

    // 발신자 읽음처리
    senderReadAt, _ := chatService.MarkAsRead(chatRoomID, userID)
    server.BroadcastToRoom("/chat", chatRoomID, "messagesRead", map[string]interface{}{
      "chatRoomId": chatRoomID,
      "userId":     userID,
      "lastReadAt": senderReadAt,
    })

    // 수신자 온라인 여부 → 개인 룸 알림
    recipientID, _ := chatService.GetRecipientID(chatRoomID, userID)
    server.BroadcastToRoom("/chat", "user:"+recipientID, "newMessageNotification", map[string]interface{}{
      "chatRoomId": chatRoomID,
      "message":    message,
    })
  })

  server.OnDisconnect("/chat", func(s socketio.Conn, reason string) {})

  go server.Serve()
  router.GET("/socket.io/*any", gin.WrapH(server))
  router.POST("/socket.io/*any", gin.WrapH(server))
}
```

---

## 12. 공통 응답 형식

```go
// internal/common/response.go

// 성공 응답
func Success(c *gin.Context, data interface{}) {
  c.JSON(200, data)
}

// 페이지네이션 응답
type PaginatedResponse struct {
  Data     interface{} `json:"data"`
  Total    int64       `json:"total"`
  Page     int         `json:"page"`
  Limit    int         `json:"limit"`
  HasNext  bool        `json:"hasNext"`
}

// 에러 응답
type ErrorResponse struct {
  StatusCode int    `json:"statusCode"`
  Message    string `json:"message"`
}

func HttpError(c *gin.Context, status int, message string) {
  c.AbortWithStatusJSON(status, ErrorResponse{StatusCode: status, Message: message})
}
```

---

## 13. 에러 처리 전략

```go
// internal/common/errors.go
var (
  ErrNotFound           = errors.New("not found")
  ErrForbidden          = errors.New("forbidden")
  ErrInvalidCredentials = errors.New("invalid credentials")
  ErrInvalidToken       = errors.New("invalid token")
  ErrDuplicate          = errors.New("already exists")
)

// Handler에서 서비스 에러 → HTTP 상태코드 변환
func handleServiceError(c *gin.Context, err error) {
  switch {
  case errors.Is(err, ErrNotFound):           HttpError(c, 404, err.Error())
  case errors.Is(err, ErrForbidden):          HttpError(c, 403, err.Error())
  case errors.Is(err, ErrInvalidCredentials): HttpError(c, 401, err.Error())
  case errors.Is(err, ErrDuplicate):          HttpError(c, 409, err.Error())
  default:                                    HttpError(c, 500, "internal server error")
  }
}
```

---

## 14. 환경 변수 (`.env.example`)

```env
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/petsitter

JWT_ACCESS_SECRET=your-64-char-access-secret-here
JWT_REFRESH_SECRET=your-64-char-refresh-secret-here
BCRYPT_ROUNDS=12

UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=5
```

---

## 15. Docker 구성 (`compose.yml`)

```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: petsitter
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 16. NestJS vs Go 서버 비교

| 항목 | NestJS | Go (Gin) |
|---|---|---|
| 언어 | TypeScript | Go |
| 프레임워크 | NestJS (Express 기반) | Gin |
| ORM | Prisma | GORM v2 |
| DI | NestJS IoC 컨테이너 | 생성자 수동 주입 |
| 유효성 검사 | class-validator + class-transformer | go-playground/validator (struct 태그) |
| JWT | @nestjs/jwt | golang-jwt/jwt |
| WebSocket | @nestjs/websockets + socket.io | googollee/go-socket.io |
| 마이그레이션 | Prisma migrate | golang-migrate (SQL 파일) |
| 모듈 구조 | `@Module()` 데코레이터 | 패키지 (internal/feature/) |
| 가드 | `@Guard()` 데코레이터 | Gin 미들웨어 |
| API 문서 | @nestjs/swagger | swaggo/swag |
| 로깅 | NestJS Logger | zerolog |
| 파일 업로드 | Multer | Go 내장 multipart |
| 빌드 산출물 | JS 번들 (node 필요) | 단일 바이너리 |
| 메모리 | 높음 (V8) | 낮음 (GC 경량) |

---

## 17. 구현 순서

1. **프로젝트 셋업** — `go mod init`, 폴더 구조, `.env`, Docker DB 실행
2. **DB 연결** — GORM PostgreSQL, GORM Auto-migrate (모든 모델)
3. **공통 레이어** — 응답 헬퍼, 에러 타입, 페이지네이션
4. **인증** — JWT 생성/검증, bcrypt, sessions handler/service/repository
5. **사용자** — users CRUD + RequireAuth/RequireRole 미들웨어 검증
6. **공고** — jobs CRUD + 필터/페이징 쿼리
7. **지원** — job_applications CRUD + 상태 변경
8. **사진 업로드** — multipart, MIME/크기 검증, ./uploads/ 저장
9. **리뷰** — 양방향 리뷰, reviewee 자동 결정, unique 제약
10. **즐겨찾기** — toggle (upsert + delete)
11. **채팅 REST** — chat-rooms, messages 목록 (커서 페이징)
12. **채팅 Socket.IO** — go-socket.io gateway (joinRoom, sendMessage)
13. **Swagger 문서** — swag init, 주석 작성
14. **Dockerfile** — 멀티 스테이지 빌드 (builder → 단일 바이너리)

---

## 18. 참고 파일

| 파일 | 용도 |
|---|---|
| `pet-sitter-server/prisma/schema.prisma` | DB 스키마 완전 동일 구현 (GORM 모델 기준) |
| `pet-sitter-server/src/chat/chat.gateway.ts` | Socket.IO 이벤트명, auth 흐름, 읽음처리 로직 |
| `pet-sitter-server/src/jobs/dto/create-job-dto.ts` | 공고 생성 유효성 규칙 (go validator 태그로 대응) |
| `pet-sitter-server/src/sessions/sessions.controller.ts` | 로그인/갱신/로그아웃 응답 구조 |
| `REQUIREMENTS.md` | 전체 비즈니스 요구사항 및 권한 규칙 |

---

**문서 버전**: 1.0
**최종 수정일**: 2026-03-23
