import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, messagesAPI } from '../services/api';
import { UserRole } from '../types';
import './Header.css';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleMessagesClick = () => {
    // Обновляем чаты перед переходом на страницу сообщений
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    navigate('/messages');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Получаем информацию о текущем пользователе
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authAPI.getMe(),
  });

  // Получаем количество непрочитанных сообщений
  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: () => messagesAPI.getChats(),
    refetchInterval: 5000, // Обновляем каждые 5 секунд для более быстрого обновления
    refetchOnWindowFocus: true, // Обновляем при возврате на вкладку
  });

  // Мутация для обновления настроек уведомлений
  const updateNotificationsMutation = useMutation({
    mutationFn: (emailNotifications: boolean) =>
      authAPI.updateNotificationSettings(emailNotifications),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  // Подписываемся на обновления чатов при изменении
  useEffect(() => {
    // Обновляем чаты при фокусе на окне
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    };
    
    // Обновляем чаты при видимости страницы
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);
  
  // Обновляем чаты при изменении маршрута
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['chats'] });
  }, [location.pathname, queryClient]);

  const unreadCount = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
  const isMessagesPage = location.pathname === '/messages';
  const isProfilePage = location.pathname === '/profile';

  // Показываем настройки только для поставщиков
  const showSettingsButton = currentUser?.role === UserRole.SUPPLIER;

  return (
    <>
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">Заказы</h1>
          <nav className="header-nav">
            <button
              onClick={handleMessagesClick}
              className={`header-button header-button-messages ${isMessagesPage ? 'header-button-active' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadCount > 0 && (
                <span className="header-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            <button
              onClick={handleProfileClick}
              className={`header-button ${isProfilePage ? 'header-button-active' : ''}`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Личный кабинет
            </button>
            {showSettingsButton && (
              <button
                onClick={() => setShowSettings(true)}
                className="header-button"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Настройки
              </button>
            )}
            <button onClick={handleLogout} className="header-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </button>
          </nav>
        </div>
      </header>

      {/* Модальное окно настроек */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content modal-settings" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Настройки уведомлений</h2>
              <button
                className="modal-close-icon"
                onClick={() => setShowSettings(false)}
                aria-label="Закрыть"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="settings-content">
              <div className="settings-item">
                <div className="settings-item-info">
                  <h3 className="settings-item-title">Email уведомления</h3>
                  <p className="settings-item-description">
                    Получать уведомления на почту о новых заказах на поставку товаров
                  </p>
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={currentUser?.email_notifications ?? true}
                    onChange={(e) => {
                      updateNotificationsMutation.mutate(e.target.checked);
                    }}
                    disabled={updateNotificationsMutation.isPending}
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
              </div>

              {currentUser?.email && (
                <div className="settings-email-info">
                  <p className="settings-email-label">Email для уведомлений:</p>
                  <p className="settings-email-value">{currentUser.email}</p>
                </div>
              )}

              {!currentUser?.email && (
                <div className="settings-warning">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>Для получения email уведомлений необходимо указать email в профиле</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-close-btn"
                onClick={() => setShowSettings(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

