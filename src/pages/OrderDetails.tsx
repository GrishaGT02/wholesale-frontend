import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI, authAPI } from '../services/api';
import { Header } from '../components/Header';
import { Chat } from '../components/Chat';
import { formatDateShort, formatCurrency } from '../lib/utils';
import './OrderDetails.css';

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : 0;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersAPI.getById(orderId),
    enabled: !!orderId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authAPI.getMe(),
  });

  if (isLoading) {
    return (
      <div className="order-details">
        <Header />
        <div className="order-details-loading">
          <div className="dashboard-spinner"></div>
          <p>Загрузка заказа...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details">
        <Header />
        <div className="order-details-content">
          <div className="order-details-error">
            <h2>Заказ не найден</h2>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Вернуться к списку заказов
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Определяем, с кем переписываться
  const otherUser = currentUser?.role === 'buyer' 
    ? order.supplier 
    : order.buyer;

  const otherUserId = currentUser?.role === 'buyer'
    ? (order.supplier?.user_id || 0)  // Для поставщика нужен user_id, а не supplier.id
    : (order.buyer?.id || 0);

  const otherUserName = currentUser?.role === 'buyer'
    ? (order.supplier?.name || 'Поставщик')
    : (order.buyer?.username || 'Покупатель');

  // Для поставщика разрешаем чат всегда (даже если не откликнулся)
  // Для покупателя - только если есть поставщик
  const canChat = currentUser?.role === 'supplier' 
    ? (order.buyer && otherUserId > 0)
    : (order.supplier_id !== null && otherUser && otherUserId > 0);

  return (
    <div className="order-details">
      <Header />
      <div className="order-details-content">
        <div className="order-details-header">
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            ← Назад к заказам
          </button>
          <h1 className="order-details-title">{order.title || order.product_name}</h1>
        </div>

        <div className="order-details-grid">
          <div className="order-details-info">
            <div className="order-info-card">
              <h2 className="order-info-title">Информация о заказе</h2>
              
              <div className="order-info-section">
                <div className="order-info-row">
                  <span className="order-info-label">Наименование товара:</span>
                  <span className="order-info-value">{order.product_name}</span>
                </div>
                
                {order.delivery_volume && (
                  <div className="order-info-row">
                    <span className="order-info-label">Объем поставки:</span>
                    <span className="order-info-value">{order.delivery_volume}</span>
                  </div>
                )}
                
                {order.purchase_budget && (
                  <div className="order-info-row">
                    <span className="order-info-label">Бюджет закупки:</span>
                    <span className="order-info-value">{formatCurrency(order.purchase_budget)}</span>
                  </div>
                )}
                
                <div className="order-info-row">
                  <span className="order-info-label">Стоимость:</span>
                  <span className="order-info-value">{formatCurrency(order.cost)}</span>
                </div>
                
                <div className="order-info-row">
                  <span className="order-info-label">Сроки доставки:</span>
                  <span className="order-info-value">{formatDateShort(order.deadline_at)}</span>
                </div>
                
                <div className="order-info-row">
                  <span className="order-info-label">Статус:</span>
                  <span className={`order-status-badge order-status-${order.status}`}>
                    {order.status === 'в_работе' ? 'В работе' : 
                     order.status === 'завершен' ? 'Завершен' : 'Отменен'}
                  </span>
                </div>
              </div>

              {order.product_description && (
                <div className="order-info-section">
                  <h3 className="order-info-subtitle">Описание товара</h3>
                  <p className="order-info-description">{order.product_description}</p>
                </div>
              )}

              {order.note && (
                <div className="order-info-section">
                  <h3 className="order-info-subtitle">Заметка</h3>
                  <p className="order-info-note">{order.note}</p>
                </div>
              )}

              <div className="order-info-section">
                <div className="order-info-row">
                  <span className="order-info-label">Покупатель:</span>
                  <span className="order-info-value">
                    {order.buyer?.username || 'Неизвестно'}
                  </span>
                </div>
                
                {order.supplier && (
                  <div className="order-info-row">
                    <span className="order-info-label">Поставщик:</span>
                    <span className="order-info-value">{order.supplier.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {canChat && (
            <div className="order-details-chat">
              <Chat 
                orderId={order.id}
                otherUserId={otherUserId}
                otherUserName={otherUserName}
                orderSupplierId={order.supplier_id}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

