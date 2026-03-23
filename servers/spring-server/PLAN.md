# Spring Boot 펫시터 서버 구축 플랜

## 참고 파일
- `pet-sitter-server/` — NestJS 레퍼런스 서버 (API 명세, 비즈니스 로직)
- `REQUIREMENTS.md` — 전체 요구사항 및 도메인 모델
- `pet-sitter-server/prisma/schema.prisma` — DB 스키마 (동일하게 구현)

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| Language | Java 21 |
| Framework | Spring Boot 3.3 |
| Build | Gradle KTS |
| ORM | Spring Data JPA + Hibernate |
| DB | PostgreSQL |
| Migration | Flyway |
| Security | Spring Security 6 + JJWT 0.12 |
| Validation | Jakarta Bean Validation |
| WebSocket | Spring WebSocket + STOMP |
| Docs | springdoc-openapi 2 (Swagger UI) |
| Password | BCryptPasswordEncoder |
| File | Spring Multipart |
| Mapping | MapStruct |
| Test | JUnit 5 + Mockito |

> **중요**: Spring은 STOMP WebSocket 프로토콜을 사용한다.
> NestJS/Go 서버의 Socket.IO와 **프로토콜이 다르므로** 클라이언트에서 `socket.io-client` 대신 `@stomp/stompjs`를 사용해야 한다.

---

## NestJS 대비 기술 매핑

| NestJS | Spring Boot |
|--------|-------------|
| Module | `@Configuration` + `@Component` |
| Controller | `@RestController` |
| Service | `@Service` |
| Guard | Spring Security Filter / `@PreAuthorize` |
| Middleware | `OncePerRequestFilter` |
| Pipe (validation) | Bean Validation (`@Valid`) |
| Exception Filter | `@RestControllerAdvice` |
| DTO | Java Record / class + `@Valid` |
| Prisma ORM | Spring Data JPA (Repository) |
| Prisma migrate | Flyway |
| Socket.IO Gateway | STOMP `@MessageMapping` |
| `.env` | `application.yml` |

---

## 프로젝트 구조

```
pet-sitter-spring-server/
├── build.gradle.kts
├── settings.gradle.kts
├── src/
│   ├── main/
│   │   ├── java/com/petsitter/
│   │   │   ├── PetSitterApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── WebSocketConfig.java
│   │   │   │   ├── JpaConfig.java
│   │   │   │   └── SwaggerConfig.java
│   │   │   ├── common/
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ErrorCode.java
│   │   │   │   │   └── ApiException.java
│   │   │   │   ├── response/
│   │   │   │   │   └── ApiResponse.java
│   │   │   │   └── security/
│   │   │   │       ├── JwtTokenProvider.java
│   │   │   │       ├── JwtAuthenticationFilter.java
│   │   │   │       └── UserPrincipal.java
│   │   │   ├── domain/
│   │   │   │   ├── user/
│   │   │   │   │   ├── entity/User.java
│   │   │   │   │   ├── repository/UserRepository.java
│   │   │   │   │   ├── service/UserService.java
│   │   │   │   │   ├── controller/UserController.java
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── CreateUserRequest.java
│   │   │   │   │       ├── UpdateUserRequest.java
│   │   │   │   │       └── UserResponse.java
│   │   │   │   ├── session/
│   │   │   │   │   ├── entity/Session.java
│   │   │   │   │   ├── repository/SessionRepository.java
│   │   │   │   │   ├── service/SessionService.java
│   │   │   │   │   ├── controller/SessionController.java
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── LoginRequest.java
│   │   │   │   │       ├── LoginResponse.java
│   │   │   │   │       └── RefreshResponse.java
│   │   │   │   ├── job/
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── Job.java
│   │   │   │   │   │   └── Pet.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── JobRepository.java
│   │   │   │   │   │   └── PetRepository.java
│   │   │   │   │   ├── service/JobService.java
│   │   │   │   │   ├── controller/JobController.java
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── CreateJobRequest.java
│   │   │   │   │       ├── UpdateJobRequest.java
│   │   │   │   │       ├── JobResponse.java
│   │   │   │   │       └── PetRequest.java
│   │   │   │   ├── application/
│   │   │   │   │   ├── entity/JobApplication.java
│   │   │   │   │   ├── repository/JobApplicationRepository.java
│   │   │   │   │   ├── service/JobApplicationService.java
│   │   │   │   │   ├── controller/JobApplicationController.java
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── CreateApplicationRequest.java
│   │   │   │   │       ├── UpdateApplicationRequest.java
│   │   │   │   │       └── ApplicationResponse.java
│   │   │   │   ├── photo/
│   │   │   │   │   ├── entity/Photo.java
│   │   │   │   │   ├── repository/PhotoRepository.java
│   │   │   │   │   ├── service/PhotoService.java
│   │   │   │   │   └── controller/PhotoController.java
│   │   │   │   ├── review/
│   │   │   │   │   ├── entity/Review.java
│   │   │   │   │   ├── repository/ReviewRepository.java
│   │   │   │   │   ├── service/ReviewService.java
│   │   │   │   │   ├── controller/ReviewController.java
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── CreateReviewRequest.java
│   │   │   │   │       └── ReviewResponse.java
│   │   │   │   ├── chat/
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── ChatRoom.java
│   │   │   │   │   │   ├── Message.java
│   │   │   │   │   │   └── ChatRoomRead.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── ChatRoomRepository.java
│   │   │   │   │   │   └── MessageRepository.java
│   │   │   │   │   ├── service/ChatService.java
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── ChatController.java
│   │   │   │   │   │   └── ChatWebSocketController.java
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── SendMessageRequest.java
│   │   │   │   │       ├── JoinRoomRequest.java
│   │   │   │   │       └── MessageResponse.java
│   │   │   │   └── favorite/
│   │   │   │       ├── entity/Favorite.java
│   │   │   │       ├── repository/FavoriteRepository.java
│   │   │   │       ├── service/FavoriteService.java
│   │   │   │       ├── controller/FavoriteController.java
│   │   │   │       └── dto/
│   │   │   │           ├── ToggleFavoriteRequest.java
│   │   │   │           └── FavoriteResponse.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   │           └── V1__init.sql
│   └── test/
│       └── java/com/petsitter/
│           └── (도메인별 테스트)
```

---

## 의존성 (build.gradle.kts)

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.3.0"
    id("io.spring.dependency-management") version "1.1.5"
}

java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }

dependencies {
    // Spring
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-websocket")

    // DB
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // Docs
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

    // MapStruct
    implementation("org.mapstruct:mapstruct:1.6.0")
    annotationProcessor("org.mapstruct:mapstruct-processor:1.6.0")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}
```

---

## 핵심 구현

### 1. application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/pet_sitter
    username: ${DB_USER:postgres}
    password: ${DB_PASS:password}
  jpa:
    hibernate:
      ddl-auto: validate        # Flyway가 DDL 담당
    show-sql: false
    properties:
      hibernate.dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 50MB

jwt:
  secret: ${JWT_SECRET}
  access-expiry: 900            # 15분 (초)
  refresh-expiry: 604800        # 7일 (초)

file:
  upload-dir: ${UPLOAD_DIR:./uploads}
```

---

### 2. JPA 엔티티 (Prisma 스키마 대응)

```java
// User.java
@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;   // bcrypt hash

    private String name;
    private String phone;
    private String profileImage;
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String refreshToken;  // bcrypt hash

    @CreationTimestamp private Instant createdAt;
    @UpdateTimestamp  private Instant updatedAt;
}

// Job.java
@Entity @Table(name = "jobs")
public class Job {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;
    private String description;
    private String address;
    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private PriceType priceType;

    private BigDecimal price;
    private Boolean isOpen;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pet> pets = new ArrayList<>();

    @CreationTimestamp private Instant createdAt;
    @UpdateTimestamp  private Instant updatedAt;
}

// Review.java — @@unique([job_id, reviewer_id])
@Entity
@Table(name = "reviews",
    uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "reviewer_id"}))
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id") private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id") private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id") private User reviewee;

    private Integer rating;
    private String comment;

    @CreationTimestamp private Instant createdAt;
}

// ChatRoom.java — @@unique([job_application_id])
@Entity
@Table(name = "chat_rooms",
    uniqueConstraints = @UniqueConstraint(columnNames = {"job_application_id"}))
public class ChatRoom {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id") private JobApplication jobApplication;

    @CreationTimestamp private Instant createdAt;
}

// Favorite.java — @@unique([user_id, job_id])
@Entity
@Table(name = "favorites",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "job_id"}))
public class Favorite {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id") private Job job;

    @CreationTimestamp private Instant createdAt;
}
```

---

### 3. Security 설정

```java
@Configuration @EnableWebSecurity @EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtFilter) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(POST, "/users").permitAll()
                .requestMatchers(POST, "/sessions").permitAll()
                .requestMatchers(POST, "/sessions/refresh").permitAll()
                .requestMatchers(GET, "/jobs/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

### 4. JWT 토큰 (NestJS와 동일 구조)

```java
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.access-expiry}") private long accessExpiry;
    @Value("${jwt.refresh-expiry}") private long refreshExpiry;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String userId, String role) {
        return Jwts.builder()
            .subject(userId)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExpiry * 1000))
            .signWith(key())
            .compact();
    }

    public String generateRefreshToken(String userId) {
        return Jwts.builder()
            .subject(userId)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExpiry * 1000))
            .signWith(key())
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key()).build()
            .parseSignedClaims(token).getPayload();
    }
}
```

---

### 5. 세션 서비스 (로그인/갱신/로그아웃)

```java
@Service @Transactional @RequiredArgsConstructor
public class SessionService {
    private final UserRepository userRepo;
    private final SessionRepository sessionRepo;
    private final JwtTokenProvider jwtProvider;
    private final BCryptPasswordEncoder encoder;

    public LoginResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.email())
            .orElseThrow(() -> new ApiException(ErrorCode.INVALID_CREDENTIALS));

        if (!encoder.matches(req.password(), user.getPassword()))
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS);

        String accessToken  = jwtProvider.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        // bcrypt hash 저장 (NestJS와 동일)
        sessionRepo.save(Session.builder()
            .userId(user.getId())
            .hashedToken(encoder.encode(refreshToken))
            .build());

        return new LoginResponse(accessToken, refreshToken, UserResponse.from(user));
    }

    public RefreshResponse refresh(String rawToken) {
        Claims claims = jwtProvider.parseClaims(rawToken);
        String userId = claims.getSubject();

        Session session = sessionRepo.findByUserId(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHORIZED));

        if (!encoder.matches(rawToken, session.getHashedToken()))
            throw new ApiException(ErrorCode.UNAUTHORIZED);

        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND));

        String newAccess  = jwtProvider.generateAccessToken(userId, user.getRole().name());
        String newRefresh = jwtProvider.generateRefreshToken(userId);

        session.updateToken(encoder.encode(newRefresh));

        return new RefreshResponse(newAccess, newRefresh);
    }

    public void logout(String userId) {
        sessionRepo.deleteByUserId(userId);
    }
}
```

---

### 6. 구인글 조회 (커서 기반 페이지네이션)

```java
// JobRepository.java
public interface JobRepository extends JpaRepository<Job, String> {

    @Query("""
        SELECT j FROM Job j
        WHERE j.isOpen = true
          AND (:cursor IS NULL OR j.createdAt < :cursor)
          AND (:species IS NULL OR EXISTS (
              SELECT p FROM Pet p WHERE p.job = j AND p.species = :species))
        ORDER BY j.createdAt DESC
        """)
    List<Job> findJobsWithCursor(
        @Param("cursor") Instant cursor,
        @Param("species") PetSpecies species,
        Pageable pageable
    );
}

// JobService.java
public JobListResponse getJobs(Instant cursor, PetSpecies species, int limit) {
    Pageable pageable = PageRequest.of(0, limit + 1);
    List<Job> jobs = jobRepo.findJobsWithCursor(cursor, species, pageable);

    boolean hasNext = jobs.size() > limit;
    if (hasNext) jobs = jobs.subList(0, limit);

    String nextCursor = hasNext ? jobs.get(jobs.size() - 1).getCreatedAt().toString() : null;
    return new JobListResponse(jobs.stream().map(JobResponse::from).toList(), nextCursor);
}
```

---

### 7. 사진 업로드

```java
@RestController @RequestMapping("/photos")
@RequiredArgsConstructor
public class PhotoController {
    private final PhotoService photoService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PhotoResponse>> upload(
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserPrincipal principal) {

        // MIME + 크기 검증
        files.forEach(f -> {
            String mime = f.getContentType();
            if (mime == null || !List.of("image/jpeg","image/png","image/webp").contains(mime))
                throw new ApiException(ErrorCode.INVALID_FILE_TYPE);
            if (f.getSize() > 5 * 1024 * 1024)
                throw new ApiException(ErrorCode.FILE_TOO_LARGE);
        });

        return ResponseEntity.ok(photoService.upload(files, principal.getId()));
    }
}
```

---

### 8. 리뷰 서비스 (양방향 리뷰 — reviewee 자동 결정)

```java
// NestJS와 동일한 비즈니스 로직
@Service @Transactional @RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final JobApplicationRepository appRepo;

    public ReviewResponse createReview(String reviewerId, CreateReviewRequest req) {
        JobApplication app = appRepo.findById(req.jobApplicationId())
            .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND));

        User reviewer = app.getJob().getUser().getId().equals(reviewerId)
            ? app.getJob().getUser()    // PetOwner가 리뷰 → reviewee = PetSitter
            : app.getSitter();          // PetSitter가 리뷰 → reviewee = PetOwner

        User reviewee = reviewer == app.getJob().getUser()
            ? app.getSitter()
            : app.getJob().getUser();

        // @@unique([job_id, reviewer_id]) 위반 시 DB가 예외 발생
        Review review = Review.builder()
            .job(app.getJob())
            .reviewer(reviewerEntity)
            .reviewee(revieweeEntity)
            .rating(req.rating())
            .comment(req.comment())
            .build();

        return ReviewResponse.from(reviewRepo.save(review));
    }
}
```

---

### 9. STOMP WebSocket (채팅)

> **NestJS Socket.IO와 프로토콜 다름**: 클라이언트는 `@stomp/stompjs` 사용 필요

```java
// WebSocketConfig.java
@Configuration @EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}

// ChatWebSocketController.java
@Controller @RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // Socket.IO: joinRoom → Spring: /app/chat.join
    @MessageMapping("/chat.join")
    public void joinRoom(JoinRoomRequest req, Principal principal) {
        ChatRoomResponse room = chatService.joinRoom(req.roomId(), principal.getName());
        // /user/{userId}/queue/joined 로 응답
        messagingTemplate.convertAndSendToUser(
            principal.getName(), "/queue/joined", room);
    }

    // Socket.IO: sendMessage → Spring: /app/chat.send
    @MessageMapping("/chat.send")
    public void sendMessage(SendMessageRequest req, Principal principal) {
        MessageResponse saved = chatService.saveMessage(req, principal.getName());

        // 룸 전체에 브로드캐스트
        messagingTemplate.convertAndSend(
            "/topic/chat." + req.roomId(), saved);

        // 상대방이 오프라인이면 알림
        chatService.notifyIfOffline(saved, req.roomId(), principal.getName());
    }
}
```

---

### 10. 전역 예외 처리

```java
// ErrorCode.java
@Getter @RequiredArgsConstructor
public enum ErrorCode {
    INVALID_CREDENTIALS(401, "이메일 또는 비밀번호가 올바르지 않습니다"),
    UNAUTHORIZED(401, "인증이 필요합니다"),
    FORBIDDEN(403, "접근 권한이 없습니다"),
    NOT_FOUND(404, "리소스를 찾을 수 없습니다"),
    DUPLICATE_EMAIL(409, "이미 사용 중인 이메일입니다"),
    INVALID_FILE_TYPE(422, "지원하지 않는 파일 형식입니다"),
    FILE_TOO_LARGE(422, "파일 크기가 5MB를 초과합니다"),
    ALREADY_REVIEWED(409, "이미 리뷰를 작성했습니다");

    private final int status;
    private final String message;
}

// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.getErrorCode().getStatus())
            .body(new ErrorResponse(ex.getErrorCode().getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(new ErrorResponse(message));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DataIntegrityViolationException ex) {
        return ResponseEntity.status(409).body(new ErrorResponse("중복된 데이터입니다"));
    }
}
```

---

### 11. 즐겨찾기 토글 (NestJS와 동일 로직)

```java
@Service @Transactional @RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepo;

    public FavoriteToggleResponse toggle(String userId, String jobId) {
        Optional<Favorite> existing = favoriteRepo.findByUserIdAndJobId(userId, jobId);
        if (existing.isPresent()) {
            favoriteRepo.delete(existing.get());
            return new FavoriteToggleResponse(false);
        } else {
            Favorite fav = Favorite.builder()
                .userId(userId).jobId(jobId).build();
            favoriteRepo.save(fav);
            return new FavoriteToggleResponse(true);
        }
    }
}
```

---

## Flyway 마이그레이션 (V1__init.sql)

```sql
CREATE TYPE role AS ENUM ('PetOwner', 'PetSitter', 'Admin');
CREATE TYPE price_type AS ENUM ('hourly', 'daily');
CREATE TYPE pet_species AS ENUM ('Cat', 'Dog');
CREATE TYPE approve_status AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password      TEXT NOT NULL,
    name          VARCHAR(100),
    phone         VARCHAR(20),
    profile_image TEXT,
    bio           TEXT,
    role          role NOT NULL,
    refresh_token TEXT,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hashed_token  TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE jobs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200),
    description TEXT,
    address     TEXT,
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    price_type  price_type,
    price       NUMERIC(10,2),
    is_open     BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pets (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id   UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name     VARCHAR(100),
    age      INTEGER,
    species  pet_species,
    breed    VARCHAR(100),
    size     VARCHAR(50)
);

CREATE TABLE job_applications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    sitter_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status     approve_status NOT NULL DEFAULT 'Pending',
    message    TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE photos (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id      UUID NOT NULL REFERENCES jobs(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(job_id, reviewer_id)
);

CREATE TABLE chat_rooms (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_application_id   UUID NOT NULL UNIQUE REFERENCES job_applications(id),
    created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id    UUID NOT NULL REFERENCES users(id),
    content      TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_room_reads (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id),
    last_read_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(chat_room_id, user_id)
);

CREATE TABLE favorites (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, job_id)
);
```

---

## API 엔드포인트 (NestJS와 동일)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /users | - | 회원가입 |
| GET | /users/me | Bearer | 내 정보 조회 |
| PATCH | /users/me | Bearer | 내 정보 수정 |
| DELETE | /users/me | Bearer | 회원 탈퇴 |
| POST | /sessions | - | 로그인 |
| POST | /sessions/refresh | - | 토큰 갱신 |
| DELETE | /sessions | Bearer | 로그아웃 |
| GET | /jobs | - | 구인글 목록 (커서 페이지네이션) |
| POST | /jobs | PetOwner | 구인글 작성 |
| GET | /jobs/:id | - | 구인글 상세 |
| PATCH | /jobs/:id | PetOwner | 구인글 수정 |
| DELETE | /jobs/:id | PetOwner | 구인글 삭제 |
| GET | /jobs/:id/applications | PetOwner | 지원서 목록 |
| POST | /jobs/:id/applications | PetSitter | 지원 |
| PATCH | /applications/:id | PetOwner | 지원 승인/거절 |
| POST | /photos/upload | Bearer | 사진 업로드 |
| POST | /reviews | Bearer | 리뷰 작성 |
| GET | /reviews/user/:userId | - | 사용자 리뷰 목록 |
| GET | /chat/rooms | Bearer | 채팅방 목록 |
| GET | /chat/rooms/:id/messages | Bearer | 메시지 목록 |
| POST | /favorites | Bearer | 즐겨찾기 토글 |
| GET | /favorites | Bearer | 즐겨찾기 목록 |

### WebSocket (STOMP)

| Endpoint | Description |
|----------|-------------|
| WS `/ws/chat` | STOMP 연결 (SockJS) |
| `/app/chat.join` | 채팅방 참여 |
| `/app/chat.send` | 메시지 전송 |
| `/topic/chat.{roomId}` | 룸 메시지 수신 |
| `/user/queue/joined` | 룸 참여 완료 응답 |
| `/user/queue/notification` | 새 메시지 알림 |

---

## NestJS vs Go vs Spring Boot 비교

| 항목 | NestJS | Go (Gin) | Spring Boot |
|------|--------|----------|-------------|
| 언어 | TypeScript | Go | Java 21 |
| ORM | Prisma | GORM v2 | Spring Data JPA |
| Migration | prisma migrate | golang-migrate | Flyway |
| Auth | passport-jwt | golang-jwt | Spring Security + JJWT |
| WebSocket | Socket.IO | go-socket.io | STOMP |
| WS 클라이언트 | socket.io-client | socket.io-client | @stomp/stompjs |
| DI | NestJS IoC | 수동 (wire) | Spring IoC |
| Validation | class-validator | go-playground/validator | Bean Validation |
| 에러처리 | ExceptionFilter | middleware | @RestControllerAdvice |
| Docs | @nestjs/swagger | swaggo | springdoc-openapi |
| 빌드산출물 | JS bundle | 단일 바이너리 | JAR |

---

## 구현 순서

1. `build.gradle.kts` + `application.yml` 설정
2. Flyway `V1__init.sql` 작성 (DB 스키마)
3. JPA 엔티티 전체 작성 (User, Job, Pet, Session, ...)
4. `JwtTokenProvider` 구현
5. `JwtAuthenticationFilter` + `SecurityConfig` 구현
6. User 도메인 (회원가입/조회/수정)
7. Session 도메인 (로그인/갱신/로그아웃)
8. Job 도메인 (CRUD + 커서 페이지네이션)
9. JobApplication 도메인 (지원/승인/거절)
10. Photo 도메인 (Multipart 업로드 + MIME/크기 검증)
11. Review 도메인 (양방향 리뷰)
12. Favorite 도메인 (토글)
13. Chat REST API (채팅방/메시지 목록)
14. STOMP WebSocket 채팅 (`WebSocketConfig` + `ChatWebSocketController`)
15. `GlobalExceptionHandler` + 통합 테스트

---

## 참고

- NestJS 레퍼런스: `pet-sitter-server/`
- DB 스키마: `pet-sitter-server/prisma/schema.prisma`
- 요구사항: `REQUIREMENTS.md`
- **STOMP 클라이언트 라이브러리**: `npm install @stomp/stompjs` (socket.io-client 사용 불가)
