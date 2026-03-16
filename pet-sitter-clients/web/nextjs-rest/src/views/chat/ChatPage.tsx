'use client';

import { Suspense } from 'react';

import { ChatRoomsContainer } from '@/components/chat/ChatRoomsContainer';
import { ChatRoomsErrorView } from '@/components/chat/exception/ChatRoomsErrorView';
import { ChatRoomsLoadingView } from '@/components/chat/exception/ChatRoomsLoadingView';
import { QueryErrorBoundary } from '@/components/common/globalException/boundary';
import { Spacing, Text } from '@/design-system';

/**
 * [Page] 채팅방 목록 페이지
 *
 * - 데이터 로직은 ChatRoomsContainer에 위임
 * - loading / error 처리는 Suspense + QueryErrorBoundary가 담당
 */
export function ChatPage() {
  return (
    <div className="mx-auto max-w-[60rem] px-16 py-24">
      <Text size="t1" as="h1" className="font-bold">
        채팅방 목록
      </Text>

      <Spacing size={24} />

      <QueryErrorBoundary fallback={ChatRoomsErrorView}>
        <Suspense fallback={<ChatRoomsLoadingView />}>
          <ChatRoomsContainer />
        </Suspense>
      </QueryErrorBoundary>
    </div>
  );
}
