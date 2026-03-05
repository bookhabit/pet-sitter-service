import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { ChatRoomContainer } from '@/components/chat/ChatRoomContainer';
import { Flex, Spinner, Text } from '@/design-system';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatSocketStore } from '@/store/useChatSocketStore';

/**
 * [Page] jobApplicationId 기반 채팅방 진입 페이지
 *
 * URL: /chat/application/:jobApplicationId
 *
 * 흐름:
 * 1. connect(token) → 소켓 연결 시작
 * 2. isConnected = true 확인 후 joinRoom emit (race condition 방지)
 * 3. joinedRoom 이벤트 수신 → currentRoomId store에 설정
 * 4. currentRoomId 확정 후 ChatRoomContainer 렌더링
 * 5. 페이지 언마운트 시 leaveRoom() 호출 (currentRoomId 정리)
 */
export function ChatRoomByApplicationPage() {
  const { jobApplicationId } = useParams<{ jobApplicationId: string }>();
  const { token } = useAuthStore();

  const { connect, joinRoom, leaveRoom, currentRoomId, isConnected } = useChatSocketStore();

  // 1단계: 소켓 연결 시작
  useEffect(() => {
    if (!token) return;
    connect(token);
  }, [token, connect]);

  // 2단계: 소켓 연결 완료 후 joinRoom emit (race condition 방지)
  useEffect(() => {
    if (!isConnected || !jobApplicationId) return;
    joinRoom(jobApplicationId);
  }, [isConnected, jobApplicationId, joinRoom]);

  // 3단계: 페이지 언마운트 시 currentRoomId 정리 (ChatRoomContainer cleanup과 분리)
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  // joinedRoom 이벤트로 currentRoomId가 확정될 때까지 로딩 표시
  if (!currentRoomId || !jobApplicationId) {
    return (
      <Flex direction="column" align="center" justify="center" className="min-h-dvh gap-16">
        <Spinner size={32} />
        <Text size="b1" color="secondary">
          채팅방에 입장하는 중...
        </Text>
      </Flex>
    );
  }

  return <ChatRoomContainer roomId={currentRoomId} jobApplicationId={jobApplicationId} />;
}
