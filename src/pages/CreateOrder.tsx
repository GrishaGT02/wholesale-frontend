import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { Header } from '../components/Header';
import './CreateOrder.css';

export function CreateOrder() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    product_name: '',
    delivery_volume: '',
    purchase_budget: '',
    product_description: '',
    deadline_at: '',
    cost: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.product_name) {
      setError('Наименование товара обязательно');
      return;
    }

    if (!formData.deadline_at) {
      setError('Сроки доставки обязательны');
      return;
    }

    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      setError('Стоимость должна быть больше 0');
      return;
    }

    setLoading(true);

    try {
      await ordersAPI.create({
        title: formData.title || formData.product_name,
        product_name: formData.product_name,
        delivery_volume: formData.delivery_volume || undefined,
        purchase_budget: formData.purchase_budget ? parseFloat(formData.purchase_budget) : undefined,
        product_description: formData.product_description || undefined,
        deadline_at: new Date(formData.deadline_at).toISOString(),
        cost: parseFloat(formData.cost),
        note: formData.note || undefined,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Ошибка создания заказа');
    } finally {
      setLoading(false);
    }
  };

  // Получить минимальную дату (сегодня)
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="create-order">
      <Header />
      <div className="create-order-content">
        <div className="create-order-header">
          <h1 className="create-order-title">Создать заказ</h1>
          <p className="create-order-subtitle">Заполните форму для размещения заказа на поставку товаров</p>
        </div>

        <form className="create-order-form" onSubmit={handleSubmit}>
          {error && (
            <div className="form-error">
              <strong>Ошибка:</strong> {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product_name" className="form-label">
                Наименование товара *
              </label>
              <input
                id="product_name"
                type="text"
                required
                className="form-input"
                placeholder="Название товара"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Краткое название заказа
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="Краткое описание"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="delivery_volume" className="form-label">
                Объем поставки
              </label>
              <input
                id="delivery_volume"
                type="text"
                className="form-input"
                placeholder="Например: 1000 шт, 50 кг"
                value={formData.delivery_volume}
                onChange={(e) => setFormData({ ...formData, delivery_volume: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchase_budget" className="form-label">
                Бюджет закупки
              </label>
              <input
                id="purchase_budget"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
                value={formData.purchase_budget}
                onChange={(e) => setFormData({ ...formData, purchase_budget: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product_description" className="form-label">
              Описание товара
            </label>
            <textarea
              id="product_description"
              className="form-input form-textarea"
              rows={4}
              placeholder="Подробное описание товара, требования к качеству, упаковке и т.д."
              value={formData.product_description}
              onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="deadline_at" className="form-label">
                Сроки доставки *
              </label>
              <input
                id="deadline_at"
                type="datetime-local"
                required
                min={minDate}
                className="form-input"
                value={formData.deadline_at}
                onChange={(e) => setFormData({ ...formData, deadline_at: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cost" className="form-label">
                Стоимость *
              </label>
              <input
                id="cost"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="form-input"
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="note" className="form-label">
              Заметка (дополнительная информация)
            </label>
            <textarea
              id="note"
              className="form-input form-textarea"
              rows={3}
              placeholder="Любая дополнительная информация"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="button-loading">
                  <svg className="spinner" style={{ width: '20px', height: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Создание...
                </span>
              ) : (
                'Создать заказ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

