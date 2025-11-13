import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Header } from '../components/Header';
import { UserRole } from '../types';
import './Profile.css';

export function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authAPI.getMe(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { email?: string; username?: string; organization_name?: string; inn?: string }) =>
      authAPI.updateProfile(data),
    onSuccess: () => {
      // Токен уже обновлен в api.ts, если username изменился
      // Просто обновляем данные пользователя
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setSuccess('Профиль успешно обновлен!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      // Обработка разных типов ошибок
      if (err.response?.status === 401) {
        // 401 может быть из-за невалидного токена или ошибки валидации
        // Проверяем детали ошибки
        const errorDetail = err.response?.data?.detail || '';
        if (errorDetail.includes('Не удалось подтвердить') || errorDetail.includes('credentials') || !errorDetail) {
          // Токен действительно невалидный - перенаправляем на логин
          localStorage.removeItem('access_token');
          navigate('/login');
        } else {
          // Это ошибка валидации или другая ошибка - показываем сообщение
          setError(errorDetail || 'Ошибка при обновлении профиля. Проверьте данные.');
        }
      } else if (err.response?.status === 404) {
        // Пользователь не найден - возможно токен невалидный
        localStorage.removeItem('access_token');
        navigate('/login');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.detail || 'Ошибка валидации данных');
      } else if (err.response?.status === 500) {
        setError('Ошибка сервера. Попробуйте позже.');
      } else {
        setError(err.response?.data?.detail || 'Ошибка при обновлении профиля');
      }
      setSuccess('');
    },
  });

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    organization_name: '',
    inn: '',
  });

  // Заполняем форму данными пользователя
  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email || '',
        username: currentUser.username || '',
        organization_name: currentUser.organization_name || '',
        inn: currentUser.inn || '',
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валидация
    if (!formData.username.trim()) {
      setError('Имя пользователя обязательно');
      return;
    }

    if (currentUser?.role === UserRole.SUPPLIER && !formData.email.trim()) {
      setError('Email обязателен для поставщиков');
      return;
    }

    // Отправляем только измененные поля
    const updateData: { email?: string; username?: string; organization_name?: string; inn?: string } = {};
    
    if (formData.email !== (currentUser?.email || '')) {
      updateData.email = formData.email || undefined;
    }
    if (formData.username !== (currentUser?.username || '')) {
      updateData.username = formData.username;
    }
    if (formData.organization_name !== (currentUser?.organization_name || '')) {
      updateData.organization_name = formData.organization_name || undefined;
    }
    if (formData.inn !== (currentUser?.inn || '')) {
      updateData.inn = formData.inn || undefined;
    }

    if (Object.keys(updateData).length === 0) {
      setError('Нет изменений для сохранения');
      return;
    }

    updateProfileMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="profile">
        <Header />
        <div className="profile-loading">
          <div className="dashboard-spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="profile">
        <Header />
        <div className="profile-error">
          <p>Не удалось загрузить данные профиля</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <Header />
      <div className="profile-content">
        <div className="profile-header">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            ← Назад к заказам
          </button>
          <h1 className="profile-title">Личный кабинет</h1>
          <p className="profile-subtitle">Управление вашими данными</p>
        </div>

        <div className="profile-card">
          <form className="profile-form" onSubmit={handleSubmit}>
            {error && (
              <div className="form-error">
                <strong>Ошибка:</strong> {error}
              </div>
            )}

            {success && (
              <div className="form-success">
                <strong>Успешно:</strong> {success}
              </div>
            )}

            <div className="profile-section">
              <h2 className="profile-section-title">Основная информация</h2>
              
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Имя пользователя *
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  className="form-input"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={updateProfileMutation.isPending}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email {currentUser.role === UserRole.SUPPLIER && '*'}
                </label>
                <input
                  id="email"
                  type="email"
                  required={currentUser.role === UserRole.SUPPLIER}
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={updateProfileMutation.isPending}
                  placeholder="example@email.com"
                />
                {currentUser.role === UserRole.SUPPLIER && (
                  <p className="form-hint">Email обязателен для поставщиков</p>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h2 className="profile-section-title">Организационная информация</h2>
              
              <div className="form-group">
                <label htmlFor="organization_name" className="form-label">
                  Наименование организации / ФИО
                </label>
                <input
                  id="organization_name"
                  type="text"
                  className="form-input"
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  disabled={updateProfileMutation.isPending}
                  placeholder="Название организации или ФИО для ИП"
                />
              </div>

              <div className="form-group">
                <label htmlFor="inn" className="form-label">
                  ИНН
                </label>
                <input
                  id="inn"
                  type="text"
                  className="form-input"
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  disabled={updateProfileMutation.isPending}
                  placeholder="ИНН организации"
                />
              </div>
            </div>

            <div className="profile-section">
              <h2 className="profile-section-title">Дополнительная информация</h2>
              
              <div className="profile-info-row">
                <span className="profile-info-label">Роль:</span>
                <span className="profile-info-value">
                  {currentUser.role === UserRole.BUYER ? 'Заказчик' : 
                   currentUser.role === UserRole.SUPPLIER ? 'Поставщик' : 'Администратор'}
                </span>
              </div>

              <div className="profile-info-row">
                <span className="profile-info-label">Дата регистрации:</span>
                <span className="profile-info-value">
                  {new Date(currentUser.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
                disabled={updateProfileMutation.isPending}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

