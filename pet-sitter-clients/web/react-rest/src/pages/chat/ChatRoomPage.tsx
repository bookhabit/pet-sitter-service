import { useNavigate, useParams } from 'react-router-dom';

export function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2.4rem', maxWidth: '60rem', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/chat')}
        style={{
          marginBottom: '1.6rem',
          background: 'none',
          border: 'none',
          color: 'var(--blue500)',
          fontSize: '1.4rem',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        ← 채팅 목록
      </button>

      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.8rem' }}>
        채팅방 #{roomId}
      </h1>

      <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>[Prototype] 채팅 기능 미구현</p>
    </div>
  );
}
