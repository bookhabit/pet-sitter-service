import { z } from 'zod';

import { http } from '../api/axios-instance';
import { chatRoomSchema, paginatedMessagesSchema } from '../schemas/chat.schema';

import type { ChatRoom, GetMessagesParams, PaginatedMessages } from '../schemas/chat.schema';

/**
 * GET /chat-rooms          — 내 채팅방 목록 (unreadCount 포함)
 * GET /chat-rooms/:id/messages — 메시지 히스토리 (커서 기반 페이지네이션)
 */
export const chatService = {
  getChatRooms: (): Promise<ChatRoom[]> =>
    http.get('/chat-rooms', undefined, z.array(chatRoomSchema)),

  getMessages: (chatRoomId: string, params?: GetMessagesParams): Promise<PaginatedMessages> =>
    http.get(`/chat-rooms/${chatRoomId}/messages`, params, paginatedMessagesSchema),
};
