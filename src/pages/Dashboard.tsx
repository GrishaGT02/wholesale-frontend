import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, authAPI } from '../services/api';
import { OrdersTable } from '../components/OrdersTable';
import { Tabs } from '../components/Tabs';
import { Header } from '../components/Header';
import { UserRole, OrderStatus } from '../types';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress'>('in_progress');
  const [statusModal, setStatusModal] = useState<{ orderId: number; currentStatus: OrderStatus } | null>(null);
  const [noteModal, setNoteModal] = useState<{ note: string } | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Получаем информацию о текущем пользователе
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authAPI.getMe(),
  });

  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () => ordersAPI.getAll(),
  });

  const { data: inProgressOrders = [] } = useQuery({
    queryKey: ['orders', 'in_progress'],
    queryFn: () => ordersAPI.getAll('в_работе'),
  });

  // Мутация для изменения статуса
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      ordersAPI.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setStatusModal(null);
    },
  });

  const handleStatusChange = (orderId: number, currentStatus: OrderStatus) => {
    // Только покупатели и админы могут менять статус
    if (currentUser?.role === UserRole.BUYER || currentUser?.role === UserRole.ADMIN) {
      setStatusModal({ orderId, currentStatus });
    }
  };

  const handleStatusSelect = (newStatus: OrderStatus) => {
    if (statusModal) {
      updateStatusMutation.mutate({ orderId: statusModal.orderId, status: newStatus });
    }
  };

  const currentOrders = activeTab === 'in_progress' ? inProgressOrders : allOrders;

  const tabs = [
    {
      id: 'in_progress',
      label: 'В работе',
      count: inProgressOrders.length,
    },
    {
      id: 'all',
      label: 'Все',
      count: allOrders.length,
    },
  ];

  if (isLoading) {
    return (
      <div className="dashboard">
        <Header />
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
          <p>Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Управление заказами</h1>
            <p className="dashboard-subtitle">
              {currentUser?.role === UserRole.BUYER 
                ? 'Просмотр и управление вашими заказами'
                : currentUser?.role === UserRole.SUPPLIER
                ? 'Просмотр доступных заказов и управление вашими откликами'
                : 'Просмотр и управление оптовыми заказами из Китая'}
            </p>
          </div>
          {currentUser?.role === UserRole.BUYER && (
            <button
              onClick={() => navigate('/create-order')}
              className="btn btn-primary"
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать заказ
            </button>
          )}
        </div>
        
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as 'all' | 'in_progress')} />

        {currentOrders.length === 0 ? (
          <div className="dashboard-empty">
            <svg className="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="dashboard-empty-title">Заказы не найдены</h3>
            <p className="dashboard-empty-text">
              {currentUser?.role === UserRole.BUYER
                ? 'У вас пока нет заказов. Создайте первый заказ!'
                : currentUser?.role === UserRole.SUPPLIER
                ? 'Нет доступных заказов в данный момент'
                : 'В этом разделе пока нет заказов'}
            </p>
          </div>
        ) : (
          <>
            <OrdersTable 
              orders={currentOrders} 
              currentUserRole={currentUser?.role}
              onStatusChange={handleStatusChange}
              onNoteClick={(note) => setNoteModal({ note })}
            />
            
            {/* Модальное окно для изменения статуса */}
            {statusModal && (
              <div className="modal-overlay" onClick={() => setStatusModal(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2 className="modal-title">Изменить статус заказа</h2>
                  <div className="modal-status-options">
                    <button
                      className={`modal-status-btn ${statusModal.currentStatus === OrderStatus.IN_PROGRESS ? 'active' : ''}`}
                      onClick={() => handleStatusSelect(OrderStatus.IN_PROGRESS)}
                      disabled={statusModal.currentStatus === OrderStatus.IN_PROGRESS}
                    >
                      В работе
                    </button>
                    <button
                      className={`modal-status-btn ${statusModal.currentStatus === OrderStatus.COMPLETED ? 'active' : ''}`}
                      onClick={() => handleStatusSelect(OrderStatus.COMPLETED)}
                      disabled={statusModal.currentStatus === OrderStatus.COMPLETED}
                    >
                      Завершен
                    </button>
                    <button
                      className={`modal-status-btn ${statusModal.currentStatus === OrderStatus.CANCELLED ? 'active' : ''}`}
                      onClick={() => handleStatusSelect(OrderStatus.CANCELLED)}
                      disabled={statusModal.currentStatus === OrderStatus.CANCELLED}
                    >
                      Отменен
                    </button>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setStatusModal(null)}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {/* Модальное окно для заметки */}
            {noteModal && (
              <div className="modal-overlay" onClick={() => setNoteModal(null)}>
                <div className="modal-content modal-note-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2 className="modal-title">Заметка к заказу</h2>
                    <button
                      className="modal-close-icon"
                      onClick={() => setNoteModal(null)}
                      aria-label="Закрыть"
                    >
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="modal-note-text">{noteModal.note}</div>
                  <div className="modal-note-actions">
                    <button
                      className="modal-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(noteModal.note);
                        setCopiedToast(true);
                        setTimeout(() => setCopiedToast(false), 2000);
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copiedToast ? 'Скопировано!' : 'Копировать'}
                    </button>
                    <button
                      className="modal-close-btn"
                      onClick={() => setNoteModal(null)}
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
