import { useNavigate } from 'react-router-dom';
import type { Order, OrderStatus, UserRole } from '../types';
import { formatDateShort, formatCurrency, getInitials } from '../lib/utils';
import './OrdersTable.css';

interface OrdersTableProps {
  orders: Order[];
  onStatusChange?: (orderId: number, status: OrderStatus) => void;
  currentUserRole?: UserRole;
  onNoteClick?: (note: string) => void;
}

export function OrdersTable({ orders, onStatusChange, currentUserRole, onNoteClick }: OrdersTableProps) {
  const navigate = useNavigate();
  
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'в_работе':
        return 'status-badge in-progress';
      case 'завершен':
        return 'status-badge completed';
      case 'отменен':
        return 'status-badge cancelled';
      default:
        return 'status-badge cancelled';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'в_работе':
        return 'В работе';
      case 'завершен':
        return 'Завершен';
      case 'отменен':
        return 'Отменен';
      default:
        return status;
    }
  };

  const getAvatarClass = (username: string) => {
    const colors = ['purple', 'blue', 'green', 'yellow', 'red', 'indigo', 'pink'];
    const index = username.length % colors.length;
    return colors[index];
  };

  return (
    <div className="orders-table-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Покупатель</th>
            <th>Заказан</th>
            <th className="sortable">
              Осталось
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </th>
            <th>Стоимость</th>
            <th>Заметка</th>
            <th>Статус</th>
            {currentUserRole === 'supplier' && <th>Действия</th>}
          </tr>
        </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <button
                      className="order-title-link"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <div className="order-title">{order.title}</div>
                    </button>
                  </td>
              <td>
                {order.buyer && (
                  <div className="order-buyer">
                    <div className={`order-avatar ${getAvatarClass(order.buyer.username)}`}>
                      {getInitials(order.buyer.username)}
                    </div>
                    <span className="order-buyer-name">{order.buyer.username}</span>
                  </div>
                )}
              </td>
              <td>
                <div className="order-date">{formatDateShort(order.ordered_at)}</div>
              </td>
              <td>
                <div>{order.remaining_time || '-'}</div>
              </td>
              <td>
                <div className="order-cost">{formatCurrency(order.cost)}</div>
              </td>
              <td>
                {order.note ? (
                  <div className="order-note-container">
                    <button 
                      className="order-note-icon"
                      title="Нажмите чтобы посмотреть заметку"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNoteClick && order.note) {
                          onNoteClick(order.note);
                        }
                      }}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <span style={{ color: '#d1d5db' }}>-</span>
                )}
              </td>
              <td>
                <button
                  className={getStatusBadgeClass(order.status)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange?.(order.id, order.status);
                  }}
                  style={{ cursor: onStatusChange ? 'pointer' : 'default' }}
                  title={onStatusChange ? 'Нажмите для изменения статуса' : undefined}
                >
                  {getStatusText(order.status)}
                </button>
              </td>
              {currentUserRole === 'supplier' && (
                <td>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Сообщения
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

