import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { UserRole } from '../types';
import './Register.css';

export function Register() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [formData, setFormData] = useState({
    role: (roleParam === 'supplier' ? 'supplier' : 'buyer') as UserRole,
    email: '',
    username: '',
    organization_name: '',
    inn: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (roleParam === 'supplier' || roleParam === 'buyer') {
      setFormData(prev => ({ ...prev, role: roleParam as UserRole }));
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    // Email обязателен для поставщиков
    if (formData.role === 'supplier' && !formData.email) {
      setError('Email обязателен для поставщиков');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register({
        email: formData.email || undefined,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        organization_name: formData.organization_name || undefined,
        inn: formData.inn || undefined,
      });
      // После регистрации сразу логинимся
      await authAPI.login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="register-title">Регистрация</h2>
          <p className="register-subtitle">Создайте аккаунт для работы с заказами</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {error && (
            <div className="form-error">
              <strong>Ошибка:</strong> {error}
            </div>
          )}

          <div className="register-form-group">
            <label className="form-label">Я регистрируюсь как:</label>
            <div className="register-role-selector">
              <label className="register-role-option">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={formData.role === 'buyer'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                />
                <span>Заказчик</span>
              </label>
              <label className="register-role-option">
                <input
                  type="radio"
                  name="role"
                  value="supplier"
                  checked={formData.role === 'supplier'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                />
                <span>Поставщик</span>
              </label>
            </div>
          </div>

          <div className="register-form-group">
            <label htmlFor="organization_name" className="form-label">
              Название организации / ФИО (для ИП)
            </label>
            <input
              id="organization_name"
              name="organization_name"
              type="text"
              className="register-input"
              placeholder="ООО Рога и Копыта"
              value={formData.organization_name}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="inn" className="form-label">ИНН</label>
            <input
              id="inn"
              name="inn"
              type="text"
              className="register-input"
              placeholder="1234567890"
              value={formData.inn}
              onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email" className="form-label">
              Email {formData.role === 'supplier' && '*'}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required={formData.role === 'supplier'}
              className="register-input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {formData.role === 'supplier' && (
              <small className="form-hint">Обязательно для поставщиков</small>
            )}
          </div>

          <div className="register-form-group">
            <label htmlFor="username" className="form-label">Имя пользователя</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="register-input"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password" className="form-label">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="register-input"
              placeholder="Минимум 6 символов"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="confirmPassword" className="form-label">Подтвердите пароль</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="register-input"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-button"
          >
            {loading ? (
              <span className="login-button-loading">
                <svg className="spinner" style={{ width: '20px', height: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Регистрация...
              </span>
            ) : (
              'Зарегистрироваться'
            )}
          </button>

          <div className="register-link">
            Уже есть аккаунт?{' '}
            <Link to={roleParam ? `/login?role=${roleParam}` : '/login'}>Войти</Link>
          </div>
          {roleParam && (
            <div className="register-link" style={{ marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                }}
              >
                ← Вернуться на главную
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

