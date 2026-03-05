import { useNavigate } from 'react-router-dom';

import { useChatRoomsQuery } from '@/hooks/chat';
import { EmptyBoundary } from '@/components/common/globalException/boundary';

import type { ChatRoom } from '@/schemas/chat.schema';
import { ChatRoomsList } from './ChatRoomsList';
import { ChatRoomsEmptyView } from './exception/ChatRoomsEmptyView';

/**
 * [Container] 채팅방 목록 데이터 연결
 *
 * 책임:
 *   - useChatRoomsQuery 호출 → 채팅방 목록 확보
 *   - 채팅방 클릭 시 /chat/:roomId 로 이동 (jobApplicationId를 state로 전달)
 *   - ChatRoomsList에 데이터 + 핸들러 전달
 *
 * useSuspenseQuery를 사용하므로 반드시 Suspense + QueryErrorBoundary 안에서 렌더링됩니다.
 */
export function ChatRoomsContainer() {
  const navigate = useNavigate();
  const { data: rooms } = useChatRoomsQuery();

  const handleRoomClick = (room: ChatRoom) => {
    navigate(`/chat/application/${room.job_application_id}`);
  };

  return (
    <EmptyBoundary data={rooms} fallback={<ChatRoomsEmptyView />}>
      <ChatRoomsList rooms={rooms} onRoomClick={handleRoomClick} />
    </EmptyBoundary>
  );
}
