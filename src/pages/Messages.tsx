import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { messagesAPI } from '../services/api';
import type { ChatInfo } from '../types';
import { Header } from '../components/Header';
import './Messages.css';

function formatTime(dateString: string | null): string {
  if (!dateString) return '';
  
  // Парсим UTC время правильно
  const dateStringWithTZ = dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 10)
    ? dateString
    : dateString + 'Z';
  const date = new Date(dateStringWithTZ);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function Messages() {
  const navigate = useNavigate();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => messagesAPI.getChats(),
    refetchInterval: 5000, // Обновляем каждые 5 секунд
    refetchOnWindowFocus: true, // Обновляем при возврате на вкладку
  });

  const handleChatClick = (chat: ChatInfo) => {
    navigate(`/orders/${chat.order_id}`);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="messages-container">
          <div className="messages-header">
            <button
              onClick={() => navigate('/dashboard')}
              className="messages-back-button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад к заказам
            </button>
          </div>
          <div className="messages-loading">Загрузка...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="messages-container">
        <div className="messages-header">
          <button
            onClick={() => navigate('/')}
            className="messages-back-button"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад к заказам
          </button>
          <h1 className="messages-title">Переписки</h1>
        </div>

        {chats.length === 0 ? (
          <div className="messages-empty">
            <svg className="messages-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="messages-empty-text">У вас пока нет переписок</p>
            <p className="messages-empty-hint">Переписки появятся после отправки сообщений в заказах</p>
          </div>
        ) : (
          <div className="messages-list">
            {chats.map((chat) => (
              <div
                key={chat.order_id}
                className={`messages-item ${chat.unread_count > 0 ? 'messages-item-unread' : ''}`}
                onClick={() => handleChatClick(chat)}
              >
                <div className="messages-item-content">
                  <div className="messages-item-header">
                    <h3 className="messages-item-title">{chat.order_title}</h3>
                    <span className="messages-item-time">{formatTime(chat.last_message_time)}</span>
                  </div>
                  <div className="messages-item-body">
                    <p className="messages-item-user">С {chat.other_user_name}</p>
                    {chat.last_message && (
                      <p className="messages-item-preview">{chat.last_message}</p>
                    )}
                  </div>
                </div>
                {chat.unread_count > 0 && (
                  <div className="messages-item-badge">
                    {chat.unread_count}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

