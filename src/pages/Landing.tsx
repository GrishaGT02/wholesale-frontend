import { useNavigate } from 'react-router-dom';
import './Landing.css';

export function Landing() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'buyer' | 'supplier') => {
    navigate(`/auth?role=${role}`);
  };

  return (
    <div className="landing-container">
      {/* Анимированный фон */}
      <div className="landing-background">
        <div className="landing-blob landing-blob-1"></div>
        <div className="landing-blob landing-blob-2"></div>
        <div className="landing-blob landing-blob-3"></div>
      </div>

      {/* Декоративные элементы */}
      <div className="landing-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="landing-particle" style={{ 
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>

      <div className="landing-content">
        {/* Приветственный текст */}
        <div className="landing-welcome">
          <div className="landing-welcome-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <p className="landing-welcome-text">
            Добро пожаловать на портал <strong>China-Space</strong>! Здесь у вас есть возможность разместить заявку на оптовую доставку товаров из Китая, а также зарегистрироваться как поставщик и найти новых клиентов
          </p>
        </div>

        {/* Название сайта */}
        <div className="landing-title">
          <h1 className="landing-title-main">
            <span className="landing-title-gradient">China</span>
            <span className="landing-title-dash">-</span>
            <span className="landing-title-gradient">Space</span>
          </h1>
          <div className="landing-title-underline"></div>
        </div>

        {/* Кнопки */}
        <div className="landing-buttons">
          <button
            className="landing-button landing-button-buyer"
            onClick={() => handleRoleSelect('buyer')}
          >
            <div className="landing-button-content">
              <svg className="landing-button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Заказчик</span>
            </div>
            <div className="landing-button-shine"></div>
          </button>
          <button
            className="landing-button landing-button-supplier"
            onClick={() => handleRoleSelect('supplier')}
          >
            <div className="landing-button-content">
              <svg className="landing-button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7h-4M4 7h4m0 0v12m0-12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Поставщик</span>
            </div>
            <div className="landing-button-shine"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

