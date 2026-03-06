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
 * 내 채팅방 목록 (unreadCount 포함)
 *
 * 서버 스키마: myChatRooms: [ChatRoomModel!]!
 */
export const GET_CHAT_ROOMS = gql`
  query GetChatRooms {
    myChatRooms {
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
 * 채팅방 메시지 히스토리 (커서 기반 페이지네이션)
 *
 * 서버 스키마: chatRoomMessages(input: GetMessagesInput!): PaginatedMessages!
 * GetMessagesInput: { chatRoomId: ID!, cursor: String, limit: Int }
 */
export const GET_MESSAGES = gql`
  query GetMessages($chatRoomId: ID!, $cursor: String, $limit: Int) {
    chatRoomMessages(input: { chatRoomId: $chatRoomId, cursor: $cursor, limit: $limit }) {
      messages { ${CHAT_MESSAGE_FIELDS} }
      nextCursor
    }
  }
`;
