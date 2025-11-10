import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI, ordersAPI, authAPI } from '../services/api';
import type { MessageCreate } from '../types';
import { formatDateShort } from '../lib/utils';
import './Chat.css';

interface ChatProps {
  orderId: number;
  otherUserId: number;
  otherUserName: string;
  orderSupplierId?: number | null; // ID поставщика заказа (если есть)
}

export function Chat({ orderId, otherUserId, otherUserName, orderSupplierId }: ChatProps) {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsRead = useRef(false);
  const hasResponded = useRef(false);

  // Получаем текущего пользователя
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authAPI.getMe(),
  });

  // Получаем сообщения
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', orderId],
    queryFn: () => messagesAPI.getOrderMessages(orderId),
    refetchInterval: 3000, // Обновляем каждые 3 секунды
  });

  // Мутация для пометки всех сообщений как прочитанных
  const markAllReadMutation = useMutation({
    mutationFn: () => messagesAPI.markAllAsReadInOrder(orderId),
    onSuccess: () => {
      // Немедленно обновляем список чатов и сообщения
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
      // Принудительно обновляем счетчик уведомлений
      queryClient.refetchQueries({ queryKey: ['chats'] });
    },
  });

  // Сбрасываем флаг при смене заказа
  useEffect(() => {
    hasMarkedAsRead.current = false;
  }, [orderId]);

  // Автоматически помечаем все сообщения как прочитанные при открытии чата
  useEffect(() => {
    if (currentUser && messages.length > 0 && !hasMarkedAsRead.current) {
      // Проверяем, есть ли непрочитанные сообщения
      const hasUnread = messages.some(
        (msg) => msg.receiver_id === currentUser.id && !msg.read_at
      );
      
      if (hasUnread) {
        hasMarkedAsRead.current = true;
        markAllReadMutation.mutate();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, messages, orderId]);
  
  // Обновляем счетчик при монтировании компонента
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['chats'] });
  }, [orderId, queryClient]);

  // Мутация для отклика на заказ (для поставщиков)
  const respondMutation = useMutation({
    mutationFn: () => ordersAPI.respond(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      hasResponded.current = true;
    },
  });

  // Мутация для отправки сообщения
  const sendMutation = useMutation({
    mutationFn: async (data: MessageCreate) => {
      // Если поставщик еще не откликнулся и это его первое сообщение - сначала откликаемся
      if (currentUser?.role === 'supplier' && !orderSupplierId && !hasResponded.current) {
        await respondMutation.mutateAsync();
      }
      return messagesAPI.send(data);
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      // Принудительно обновляем счетчик уведомлений
      queryClient.refetchQueries({ queryKey: ['chats'] });
    },
  });

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    sendMutation.mutate({
      order_id: orderId,
      receiver_id: otherUserId,
      content: message.trim(),
    });
  };

  if (!currentUser) {
    return <div className="chat-loading">Загрузка...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3 className="chat-header-title">Переписка с {otherUserName}</h3>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>Пока нет сообщений. Начните переписку!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'}`}
              >
                <div className="chat-message-content">
                  <div className="chat-message-text">{msg.content}</div>
                  <div className="chat-message-time">
                    {formatDateShort(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder="Введите сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sendMutation.isPending}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!message.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? (
            <svg className="spinner" style={{ width: '20px', height: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}


