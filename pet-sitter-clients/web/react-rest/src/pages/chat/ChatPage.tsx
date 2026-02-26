import { useNavigate } from 'react-router-dom';

import { useChatRoomsQuery } from '@/hooks/chat';

export function ChatPage() {
  const navigate = useNavigate();
  const { data: rooms } = useChatRoomsQuery();

  return (
    <div style={{ padding: '2.4rem', maxWidth: '60rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '2.4rem' }}>채팅방 목록</h1>

      {rooms.length === 0 && (
        <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>
          참여 중인 채팅방이 없습니다.
        </p>
      )}

      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() =>
            navigate(`/chat/${room.id}`, {
              state: { jobApplicationId: room.job_application_id },
            })
          }
          style={{
            padding: '1.6rem',
            backgroundColor: 'white',
            borderRadius: '1.2rem',
            border: '1px solid var(--grey200)',
            marginBottom: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              채팅방
            </p>
            <p
              style={{
                fontSize: '1.4rem',
                color: 'var(--grey500)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {room.messages?.[0]?.content ?? '메시지가 없습니다.'}
            </p>
          </div>

          {room.unreadCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--blue500)',
                color: 'white',
                borderRadius: '999px',
                padding: '0.2rem 0.8rem',
                fontSize: '1.2rem',
                fontWeight: 700,
                minWidth: '2.4rem',
                textAlign: 'center',
              }}
            >
              {room.unreadCount}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
