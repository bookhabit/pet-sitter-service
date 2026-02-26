import { z } from 'zod';

import { jobApplicationSchema } from './job-application.schema';

/* ─── Message ────────────────────────────────────────────────── */

export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  sender_id: z.string().uuid(),
  chat_room_id: z.string().uuid(),
  createdAt: z.coerce.date(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

/* ─── ChatRoom ───────────────────────────────────────────────── */

export const chatRoomSchema = z.object({
  id: z.string().uuid(),
  job_application_id: z.string().uuid(),
  /** 서버가 포함할 경우 파싱, 없으면 undefined */
  jobApplication: jobApplicationSchema.optional(),
  /**
   * 목록 조회 시 서버가 최근 메시지 1개만 내려줌 (미리보기 용도)
   * 전체 메시지는 GET /chat-rooms/:id/messages 로 별도 조회
   */
  messages: z.array(chatMessageSchema).optional(),
  unreadCount: z.number().int(),
  createdAt: z.coerce.date(),
});

export type ChatRoom = z.infer<typeof chatRoomSchema>;

/* ─── Paginated Messages ─────────────────────────────────────── */

export const paginatedMessagesSchema = z.object({
  messages: z.array(chatMessageSchema),
  nextCursor: z.string().nullable(),
});

export type PaginatedMessages = z.infer<typeof paginatedMessagesSchema>;

/* ─── Query Params ───────────────────────────────────────────── */

export interface GetMessagesParams {
  limit?: number;
  cursor?: string;
}

/* ─── Socket Event Payloads ──────────────────────────────────── */

export interface JoinedRoomPayload {
  chatRoomId: string;
  jobApplicationId: string;
}

export interface MessagesReadPayload {
  chatRoomId: string;
  userId: string;
  lastReadAt: string; // ISO string from server
}
