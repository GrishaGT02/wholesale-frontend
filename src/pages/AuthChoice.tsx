import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthChoice.css';

export function AuthChoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'buyer';
  const roleName = role === 'buyer' ? 'Заказчик' : 'Поставщик';

  const handleLogin = () => {
    navigate(`/login?role=${role}`);
  };

  const handleRegister = () => {
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="auth-choice-container">
      <div className="auth-choice-card">
        <div className="auth-choice-header">
          <h2 className="auth-choice-title">Вы выбрали: {roleName}</h2>
          <p className="auth-choice-subtitle">Войдите в свой аккаунт или зарегистрируйтесь</p>
        </div>

        <div className="auth-choice-buttons">
          <button
            className="auth-choice-button auth-choice-button-login"
            onClick={handleLogin}
          >
            Войти
          </button>
          <button
            className="auth-choice-button auth-choice-button-register"
            onClick={handleRegister}
          >
            Зарегистрироваться
          </button>
        </div>

        <div className="auth-choice-back">
          <button
            className="auth-choice-back-button"
            onClick={() => navigate('/')}
          >
            ← Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}

