import { gql } from '@apollo/client';

const CHAT_MESSAGE_FIELDS = `
  id
  content
  sender_id
  chat_room_id
  createdAt
`;

const JOB_APPLICATION_FIELDS = `
  id
  status
  user_id
  job_id
  createdAt
  updatedAt
`;

/**
 * GET /chat-rooms — 내 채팅방 목록 (unreadCount 포함)
 */
export const GET_CHAT_ROOMS = gql`
  query GetChatRooms {
    chatRooms {
      id
      job_application_id
      jobApplication { ${JOB_APPLICATION_FIELDS} }
      messages { ${CHAT_MESSAGE_FIELDS} }
      unreadCount
      createdAt
    }
  }
`;

/**
 * GET /chat-rooms/:id/messages — 메시지 히스토리 (커서 기반 페이지네이션)
 */
export const GET_MESSAGES = gql`
  query GetMessages($chatRoomId: ID!, $cursor: String, $limit: Int) {
    messages(chatRoomId: $chatRoomId, cursor: $cursor, limit: $limit) {
      messages { ${CHAT_MESSAGE_FIELDS} }
      nextCursor
    }
  }
`;
