import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

import { chatMessageSchema } from '../schemas/chat.schema';

import type { ChatMessage, JoinedRoomPayload, MessagesReadPayload } from '../schemas/chat.schema';

const SOCKET_URL = 'http://localhost:8000/chat';

/* ─── State ──────────────────────────────────────────────────── */

interface ChatSocketState {
  socket: Socket | null;
  isConnected: boolean;

  /** 현재 입장해 있는 채팅방 ID (chatRoom.id) */
  currentRoomId: string | null;
  /** joinRoom emit에 사용한 jobApplicationId (visibility 복구 시 재입장에 사용) */
  currentJobApplicationId: string | null;

  /** 룸별 메시지 목록 (오래된→최신 순) */
  messages: Record<string, ChatMessage[]>;
  /** 룸별 다음 페이지 커서 */
  nextCursor: Record<string, string | null>;
  /** 룸별 추가 페이지 존재 여부 */
  hasMore: Record<string, boolean>;
  /** 룸별 이전 메시지 로드 중 여부 */
  isLoadingMore: Record<string, boolean>;

  /** 읽음 상태: roomId → userId → lastReadAt */
  readReceipts: Record<string, Record<string, Date>>;
}

/* ─── Actions ────────────────────────────────────────────────── */

interface ChatSocketActions {
  /** 소켓 연결 — 로그인 직후 또는 탭 복귀 시 호출 */
  connect: (token: string) => void;
  /** 소켓 해제 — 로그아웃 또는 탭 숨김 시 호출 */
  disconnect: () => void;

  /** 채팅방 입장 emit */
  joinRoom: (jobApplicationId: string) => void;
  /** 채팅방 퇴장 (클라이언트 상태 초기화) */
  leaveRoom: () => void;

  /** 메시지 전송 emit */
  sendMessage: (chatRoomId: string, content: string) => void;

  /** REST로 받아온 초기 메시지 적재 */
  initMessages: (roomId: string, messages: ChatMessage[], nextCursor: string | null) => void;
  /** 이전 메시지(오래된) prepend — 무한스크롤 */
  prependMessages: (roomId: string, messages: ChatMessage[], nextCursor: string | null) => void;
  setLoadingMore: (roomId: string, loading: boolean) => void;

  /** 소켓 receiveMessage 이벤트로 수신한 메시지 append */
  appendMessage: (roomId: string, message: ChatMessage) => void;
  /** messagesRead 이벤트 수신 시 읽음 상태 갱신 */
  updateReadReceipt: (roomId: string, userId: string, lastReadAt: Date) => void;
}

/* ─── Store ──────────────────────────────────────────────────── */

export const useChatSocketStore = create<ChatSocketState & ChatSocketActions>()((set, get) => ({
  socket: null,
  isConnected: false,
  currentRoomId: null,
  currentJobApplicationId: null,
  messages: {},
  nextCursor: {},
  hasMore: {},
  isLoadingMore: {},
  readReceipts: {},

  connect: (token) => {
    const existing = get().socket;
    if (existing?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('joinedRoom', (payload: JoinedRoomPayload) => {
      set({ currentRoomId: payload.chatRoomId });
    });

    socket.on('receiveMessage', (raw: unknown) => {
      const result = chatMessageSchema.safeParse(raw);
      if (!result.success) return;
      const message = result.data;
      get().appendMessage(message.chat_room_id, message);
    });

    socket.on('messagesRead', (payload: MessagesReadPayload) => {
      get().updateReadReceipt(
        payload.chatRoomId,
        payload.userId,
        new Date(payload.lastReadAt),
      );
    });

    socket.on('error', (err: { message: string }) => {
      console.error('[ChatSocket] error:', err.message);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (!socket) return;
    socket.disconnect();
    set({ socket: null, isConnected: false });
  },

  joinRoom: (jobApplicationId) => {
    const { socket } = get();
    if (!socket?.connected) return;
    set({ currentJobApplicationId: jobApplicationId });
    socket.emit('joinRoom', { jobApplicationId });
  },

  leaveRoom: () => {
    set({ currentRoomId: null, currentJobApplicationId: null });
  },

  sendMessage: (chatRoomId, content) => {
    const { socket } = get();
    if (!socket?.connected) return;
    socket.emit('sendMessage', { chatRoomId, content });
  },

  initMessages: (roomId, messages, nextCursor) => {
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
      nextCursor: { ...state.nextCursor, [roomId]: nextCursor },
      hasMore: { ...state.hasMore, [roomId]: nextCursor !== null },
    }));
  },

  prependMessages: (roomId, messages, nextCursor) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...messages, ...(state.messages[roomId] ?? [])],
      },
      nextCursor: { ...state.nextCursor, [roomId]: nextCursor },
      hasMore: { ...state.hasMore, [roomId]: nextCursor !== null },
    }));
  },

  setLoadingMore: (roomId, loading) => {
    set((state) => ({
      isLoadingMore: { ...state.isLoadingMore, [roomId]: loading },
    }));
  },

  appendMessage: (roomId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] ?? []), message],
      },
    }));
  },

  updateReadReceipt: (roomId, userId, lastReadAt) => {
    set((state) => ({
      readReceipts: {
        ...state.readReceipts,
        [roomId]: {
          ...(state.readReceipts[roomId] ?? {}),
          [userId]: lastReadAt,
        },
      },
    }));
  },
}));
