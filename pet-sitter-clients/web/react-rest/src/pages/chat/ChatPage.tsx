import { useNavigate } from 'react-router-dom';

export function ChatPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2.4rem', maxWidth: '60rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '2.4rem' }}>채팅방 목록</h1>

      {['채팅방 #1 — 김철수', '채팅방 #2 — 이영희', '채팅방 #3 — 박민준'].map((title, i) => (
        <div
          key={i}
          onClick={() => navigate(`/chat/${i + 1}`)}
          style={{
            padding: '1.6rem',
            backgroundColor: 'white',
            borderRadius: '1.2rem',
            border: '1px solid var(--grey200)',
            marginBottom: '1.2rem',
            cursor: 'pointer',
          }}
        >
          <p style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '0.4rem' }}>{title}</p>
          <p style={{ fontSize: '1.4rem', color: 'var(--grey500)' }}>클릭하여 채팅방 입장</p>
        </div>
      ))}
    </div>
  );
}
