# 채팅 기능 구현 계획

## 1. 개요

REQUIREMENTS.md v2의 마지막 미구현 기능인 **실시간 채팅**을 NestJS + Socket.io로 구현한다.
PetOwner(공고 등록자)와 PetSitter(지원자)가 JobApplication을 기반으로 1:1 채팅하며,
채팅방은 첫 접근 시 Lazy Creation으로 생성된다.

---

## 2. Prisma 스키마

### 2.1 신규 모델

```prisma
model ChatRoom {
  id                   String         @id @default(uuid())
  job_application_id   String         @unique
  jobApplication       JobApplication @relation(fields: [job_application_id], references: [id])
  messages             Message[]
  readReceipts         ChatRoomRead[]
  createdAt            DateTime       @default(now())
}

model Message {
  id            String   @id @default(uuid())
  content       String
  sender_id     String
  chat_room_id  String
  sender        User     @relation("SentMessages", fields: [sender_id], references: [id])
  chatRoom      ChatRoom @relation(fields: [chat_room_id], references: [id])
  createdAt     DateTime @default(now())
}

model ChatRoomRead {
  id            String   @id @default(uuid())
  chat_room_id  String
  user_id       String
  last_read_at  DateTime @default(now())
  chatRoom      ChatRoom @relation(fields: [chat_room_id], references: [id])
  user          User     @relation("ChatRoomReads", fields: [user_id], references: [id])

  @@unique([chat_room_id, user_id])
}
```

### 2.2 기존 모델 역방향 관계 추가

**User 모델**:

```prisma
  sentMessages   Message[]       @relation("SentMessages")
  chatRoomReads  ChatRoomRead[]  @relation("ChatRoomReads")
```

**JobApplication 모델**:

```prisma
  chatRoom  ChatRoom?
```

### 2.3 모델 관계도

```
JobApplication ──1:1──▶ ChatRoom ──1:N──▶ Message
                            │                 │
                            │ 1:N             │ N:1
                            ▼                 ▼
                       ChatRoomRead         User (sender)
                       (user_id + last_read_at)
```

- **ChatRoom ↔ JobApplication**: 1:1 (unique FK), Lazy Creation
- **ChatRoom ↔ Message**: 1:N
- **ChatRoom ↔ ChatRoomRead**: 1:N (채팅방당 참여자 2명 = 레코드 최대 2개)
- **Message → User**: N:1 (sender)
- **ChatRoomRead → User**: N:1 (읽은 사용자)

---

## 3. 읽음처리 설계

### 3.1 핵심 개념

| 항목                 | 설명                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| **추적 단위**        | 채팅방 × 사용자 별 `last_read_at` 타임스탬프                         |
| **안읽은 메시지 수** | `Message.createdAt > ChatRoomRead.last_read_at`인 메시지 개수        |
| **읽음 시점**        | (1) 채팅방 입장 시, (2) 채팅방에 들어와 있는 상태에서 메시지 수신 시 |

### 3.2 읽음처리 흐름

#### 시나리오 1: 채팅방 입장 시 읽음처리

```
Client A가 joinRoom 이벤트 전송
  │
  ▼
Server: ChatRoomRead upsert (user_id=A, last_read_at=now())
  │
  ▼
Server: A의 안읽은 메시지 → 0개로 리셋
  │
  ▼
Server → Room 전체: 'messagesRead' 이벤트 emit
  { chatRoomId, userId: A, lastReadAt }
  │
  ▼
Client B(상대방): A가 읽었다는 UI 갱신 가능
```

#### 시나리오 2: 채팅방 접속 중 실시간 읽음처리

```
Client A가 sendMessage 이벤트 전송
  │
  ▼
Server: Message DB 저장
  │
  ▼
Server: Socket.io room에 Client B가 접속해 있는지 확인
  │
  ├── B가 room에 있음 ──▶ B의 ChatRoomRead.last_read_at = message.createdAt
  │                        A의 ChatRoomRead.last_read_at = message.createdAt
  │                        Room에 'messagesRead' emit (양측 모두 읽음)
  │
  └── B가 room에 없음 ──▶ A의 ChatRoomRead.last_read_at = message.createdAt 만 갱신
                           (B는 나중에 joinRoom 할 때 읽음처리)
  │
  ▼
Server → Room: 'receiveMessage' 이벤트 (메시지 브로드캐스트)
```

#### 시나리오 2: 읽음처리 1표시 동작 원리

last_read_at은 시간 기준 경계선 역할을 합니다. 1:1 채팅이라 메시지가 시간순으로 정렬되므로:

내가 보낸 메시지 목록:
─────────────────────────────────────────
메시지 A (10:01) ← createdAt <= 상대방 last_read_at → 표시 없음
메시지 B (10:02) ← createdAt <= 상대방 last_read_at → 표시 없음
─────────── 상대방 last_read_at (10:02) ──────────
메시지 C (10:05) 1 ← createdAt > 상대방 last_read_at → "1" 표시
메시지 D (10:06) 1 ← createdAt > 상대방 last_read_at → "1" 표시
─────────────────────────────────────────
클라이언트 판단 로직

// 상대방의 last_read_at을 messagesRead 이벤트로 수신/보관
let recipientLastReadAt = ...;

// 각 메시지 렌더링 시
const showUnread =
message.sender_id === myId && // 내가 보낸 메시지이고
message.createdAt > recipientLastReadAt; // 상대방이 아직 안 읽음

// showUnread === true → "1" 표시
실시간 갱신 흐름

1. 내가 메시지 전송 → "1" 표시
2. 상대방이 읽음 → server가 'messagesRead' emit → { lastReadAt: 갱신된 시간 }
3. 클라이언트가 recipientLastReadAt 갱신 → "1" 일괄 제거
   last_read_at 이후의 메시지는 전부 안읽은 것이고, 이전은 전부 읽은 것이라 메시지별 읽음 필드 없이도 정확하게 "1" 표시가 가능합니다. messagesRead 이벤트가 오면 경계선이 이동하면서 "1"이 한꺼번에 사라지는 것도 자연스럽게 처리됩니다.

### 3.3 Room 접속 여부 확인 방법

Socket.io의 `server.in(roomId).fetchSockets()`로 현재 room에 연결된 소켓 목록을 가져온 후,
각 소켓의 `client.data.user.id`를 확인하여 상대방 접속 여부를 판단한다.

```typescript
const socketsInRoom = await this.server.in(chatRoomId).fetchSockets();
const recipientInRoom = socketsInRoom.some(
  (s) => s.data.user?.id === recipientId,
);
```

### 3.4 WebSocket 이벤트 정의

| 이벤트           | 방향            | Payload                                                       | 설명                   |
| ---------------- | --------------- | ------------------------------------------------------------- | ---------------------- |
| `joinRoom`       | client → server | `{ jobApplicationId }`                                        | 채팅방 입장 + 읽음처리 |
| `joinedRoom`     | server → client | `{ chatRoomId, jobApplicationId }`                            | 입장 확인              |
| `sendMessage`    | client → server | `{ chatRoomId, content }`                                     | 메시지 전송            |
| `receiveMessage` | server → room   | `{ id, content, sender_id, chat_room_id, sender, createdAt }` | 메시지 수신            |
| `messagesRead`   | server → room   | `{ chatRoomId, userId, lastReadAt }`                          | 읽음 상태 변경 알림    |
| `error`          | server → client | `{ message }`                                                 | 에러 알림              |

### 3.5 안읽은 메시지 수 계산 (채팅방 목록 조회 시)

```typescript
// findMyChatRooms에서 각 채팅방의 안읽은 메시지 수 포함
const myReadReceipt = chatRoom.readReceipts.find((r) => r.user_id === userId);
const lastReadAt = myReadReceipt?.last_read_at ?? new Date(0);

const unreadCount = await this.prisma.message.count({
  where: {
    chat_room_id: chatRoom.id,
    createdAt: { gt: lastReadAt },
    sender_id: { not: userId }, // 내가 보낸 메시지 제외
  },
});
```

---

## 4. 모듈 구조

### 4.1 파일 구조

```
src/chat/
├── chat.module.ts                    # 모듈 정의
├── chat.service.ts                   # 비즈니스 로직 (Gateway/Controller/Resolver 공용)
├── chat.gateway.ts                   # WebSocket Gateway (Socket.io)
├── chat.controller.ts                # REST 엔드포인트
├── chat.resolver.ts                  # GraphQL 쿼리
├── dto/
│   └── get-messages-query.dto.ts     # REST 커서 페이지네이션 DTO
├── inputs/
│   └── get-messages.input.ts         # GraphQL 페이지네이션 Input
└── models/
    ├── chat-room.model.ts            # GraphQL ChatRoom ObjectType
    ├── message.model.ts              # GraphQL Message ObjectType
    └── paginated-messages.model.ts   # GraphQL 페이지네이션 결과 ObjectType
```

### 4.2 모듈 등록

```typescript
// chat.module.ts
@Module({
  imports: [PrismaModule],
  providers: [ChatService, ChatGateway, ChatResolver],
  controllers: [ChatController],
})
export class ChatModule {}
```

`app.module.ts`의 imports 배열에 `ChatModule` 추가.

---

## 5. ChatService 설계

### 5.1 메서드 목록

| 메서드                                            | 역할                                                   | 호출자               |
| ------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| `joinRoom(jobApplicationId, userId)`              | 접근 검증 + ChatRoom lazy creation (upsert) + 읽음처리 | Gateway              |
| `sendMessage(chatRoomId, content, senderId)`      | 접근 검증 + 메시지 DB 저장 + 발신자 읽음처리           | Gateway              |
| `markAsRead(chatRoomId, userId)`                  | ChatRoomRead upsert (last_read_at = now)               | Gateway              |
| `findMyChatRooms(userId)`                         | 내 채팅방 목록 + 최근 메시지 1개 + 안읽은 수           | Controller, Resolver |
| `findMessages(chatRoomId, userId, limit, cursor)` | 커서 기반 메시지 페이지네이션                          | Controller, Resolver |

### 5.2 접근 제어 (private helper)

```typescript
private validateChatParticipant(jobApplication, userId): void
  // 허용 대상 2명:
  //   1. jobApplication.job.creator_user_id (PetOwner)
  //   2. jobApplication.user_id (PetSitter)
  // 둘 다 아니면 → ForbiddenException
```

### 5.3 Lazy Creation (Race Condition 방지)

```typescript
// joinRoom 내부
const chatRoom = await this.prisma.chatRoom.upsert({
  where: { job_application_id: jobApplicationId },
  create: { id: randomUUID(), job_application_id: jobApplicationId },
  update: {}, // 이미 존재하면 no-op
});
```

### 5.4 커서 기반 페이지네이션

`take: limit + 1` 패턴으로 다음 페이지 존재 여부 판단.
반환: `{ messages: Message[], nextCursor: string | null }`

---

## 6. ChatGateway 설계 (WebSocket)

### 6.1 인증 전략

**Gateway의 `handleConnection`에서 직접 JWT 검증.**
모든 `@SubscribeMessage` 핸들러에 `@Public()` 데코레이터를 붙여 글로벌 JwtAuthGuard 우회.

이유: 기존 JwtAuthGuard의 `getRequest()`는 `'ws'` context type을 처리하지 않음.
Guard를 수정하면 기존 HTTP/GraphQL에 영향을 줄 수 있으므로 Gateway가 자체 인증 담당.

### 6.2 handleConnection

```
1. 토큰 추출: client.handshake.auth.token 또는 client.handshake.headers.authorization
2. jwt.verify()로 검증 (기존과 동일한 JWT_SECRET 사용)
3. DB에서 user 조회
4. Session 존재 확인 (auth_header = "Bearer <token>" 형식으로 조회)
   ※ SessionsService가 auth_header를 "Bearer ${token}" 형식으로 저장하므로 동일 형식 사용
5. 성공 → client.data.user = user
6. 실패 → client.emit('error', { message }) + client.disconnect()
```

### 6.3 joinRoom 핸들러

```
payload: { jobApplicationId: string }

1. client.data.user 확인 (없으면 error emit)
2. chatService.joinRoom(jobApplicationId, user.id) → ChatRoom 반환
3. client.join(chatRoom.id) — Socket.io 룸 입장
4. chatService.markAsRead(chatRoom.id, user.id) — 읽음처리
5. server.to(chatRoom.id).emit('messagesRead', { chatRoomId, userId, lastReadAt })
6. client.emit('joinedRoom', { chatRoomId, jobApplicationId })
```

### 6.4 sendMessage 핸들러

```
payload: { chatRoomId: string, content: string }

1. client.data.user 확인
2. chatService.sendMessage(chatRoomId, content, user.id) → Message 반환
3. server.to(chatRoomId).emit('receiveMessage', message) — 브로드캐스트

4. 읽음처리:
   a. sender의 last_read_at 갱신
   b. fetchSockets()로 room 내 상대방 접속 확인
   c. 상대방이 room에 있으면 → 상대방 last_read_at도 갱신
   d. server.to(chatRoomId).emit('messagesRead', { ... })
```

### 6.5 에러 처리

Gateway 핸들러에서 try/catch로 서비스 예외를 잡아 `client.emit('error', { message })` 형태로 전달.

---

## 7. REST Controller

### 7.1 엔드포인트

| HTTP  | 경로                       | 설명                                          |
| ----- | -------------------------- | --------------------------------------------- |
| `GET` | `/chat-rooms`              | 내 채팅방 목록 (최근 메시지 + 안읽은 수 포함) |
| `GET` | `/chat-rooms/:id/messages` | 메시지 히스토리 (query: `limit`, `cursor`)    |

- `@ApiTags('Chat')`, `@ApiBearerAuth('access-token')` 적용
- 기존 컨트롤러 패턴 (FavoritesController) 따름

### 7.2 DTO

**`dto/get-messages-query.dto.ts`**:

- `limit?: number` — 기본 20, 최대 100
- `cursor?: string` — 메시지 UUID

---

## 8. GraphQL Resolver

### 8.1 쿼리

| 쿼리                                       | 반환 타입           | 설명            |
| ------------------------------------------ | ------------------- | --------------- |
| `myChatRooms`                              | `[ChatRoomModel]`   | 내 채팅방 목록  |
| `chatRoomMessages(chatRoomId, pagination)` | `PaginatedMessages` | 메시지 히스토리 |

Mutation 없음 — 채팅방 생성과 메시지 전송은 WebSocket 전용.

### 8.2 GraphQL Models

- **ChatRoomModel**: id, job_application_id, jobApplication?, messages?, unreadCount, createdAt
- **MessageModel**: id, content, sender_id, chat_room_id, createdAt
- **PaginatedMessages**: messages[], nextCursor

---

## 9. 수정/생성 파일 요약

### 수정 파일 (2개)

| 파일                   | 변경 내용                                                               |
| ---------------------- | ----------------------------------------------------------------------- |
| `prisma/schema.prisma` | ChatRoom, Message, ChatRoomRead 모델 추가 + User, JobApplication 역관계 |
| `src/app.module.ts`    | ChatModule import 추가                                                  |

### 신규 파일 (10개)

| 파일                                          | 역할                           |
| --------------------------------------------- | ------------------------------ |
| `src/chat/chat.module.ts`                     | 모듈 정의                      |
| `src/chat/chat.service.ts`                    | 비즈니스 로직                  |
| `src/chat/chat.gateway.ts`                    | WebSocket Gateway              |
| `src/chat/chat.controller.ts`                 | REST 엔드포인트                |
| `src/chat/chat.resolver.ts`                   | GraphQL 쿼리                   |
| `src/chat/dto/get-messages-query.dto.ts`      | REST 페이지네이션 DTO          |
| `src/chat/inputs/get-messages.input.ts`       | GraphQL 페이지네이션 Input     |
| `src/chat/models/chat-room.model.ts`          | GraphQL ChatRoom 타입          |
| `src/chat/models/message.model.ts`            | GraphQL Message 타입           |
| `src/chat/models/paginated-messages.model.ts` | GraphQL 페이지네이션 결과 타입 |

---

## 10. 구현 순서

1. 의존성 설치 (`@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`)
2. Prisma 스키마 수정 + 마이그레이션
3. GraphQL Models
4. DTO, Input
5. ChatService
6. ChatGateway
7. ChatController
8. ChatResolver
9. ChatModule + app.module.ts 등록
10. 빌드 검증

---

## 11. 검증 방법

1. `npx prisma migrate dev` 정상 실행
2. `npm run start:dev` 서버 기동
3. Swagger UI (`/api`)에서 REST 엔드포인트 확인
4. GraphQL Playground에서 쿼리 확인
5. Socket.io 클라이언트 테스트:
   - `ws://localhost:3000/chat` 연결 (auth.token = JWT)
   - `joinRoom` → `joinedRoom` + `messagesRead` 이벤트 수신 확인
   - `sendMessage` → `receiveMessage` + `messagesRead` 이벤트 수신 확인
   - 상대방 미접속 시 읽음처리 안 되는 것 확인
   - 권한 없는 사용자 접근 시 `error` 이벤트 확인

---

## 12. 클라이언트 연결 예시

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: { token: 'jwt-token-here' },
});

// 채팅방 입장
socket.emit('joinRoom', { jobApplicationId: 'uuid' });
socket.on('joinedRoom', (data) => console.log('입장:', data.chatRoomId));

// 메시지 송수신
socket.emit('sendMessage', { chatRoomId: 'uuid', content: '안녕하세요!' });
socket.on('receiveMessage', (msg) => console.log('수신:', msg));

// 읽음처리 알림
socket.on('messagesRead', (data) => {
  console.log(`${data.userId}가 읽음 (${data.lastReadAt})`);
});

// 에러
socket.on('error', (err) => console.error(err.message));
```
