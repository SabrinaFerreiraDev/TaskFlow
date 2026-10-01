import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
    </span>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const email = user?.email || "usuario@taskflow.com";
  const initials = (email || "U").trim().charAt(0).toUpperCase();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell profile-shell">
      <header className="topbar profile-topbar">
        <div className="brand" aria-label="TaskFlow início">
          <BrandMark />
          <span>
            Task<span>Flow</span>
          </span>
        </div>

        <nav className="main-nav" aria-label="Navegação principal">
          <button type="button" className="nav-link-button" onClick={() => navigate("/home")}>
            Tarefas
          </button>
          <button type="button" className="nav-link-button active" aria-current="page">
            Perfil
          </button>
          <button type="button" className="nav-link-button" onClick={() => navigate("/settings")}>
            Configurações
          </button>
        </nav>

        <div className="header-actions">
          <button type="button" className="secondary-button small-button" onClick={() => navigate("/home")}>
            Voltar
          </button>
        </div>
      </header>

      <main className="profile-main">
        <section className="profile-panel">
          <div className="profile-header">
            <div className="profile-avatar" aria-label="Avatar do usuário">
              {initials}
            </div>

            <div>
              <span className="eyebrow">Sua conta</span>
              <h1>Perfil</h1>
            </div>
          </div>

          <div className="profile-grid">
            <article className="profile-card">
              <span className="profile-label">Email</span>
              <strong>{email}</strong>
            </article>

            <article className="profile-card">
              <span className="profile-label">Status da conta</span>
              <strong>Pronto para autenticação futura</strong>
            </article>

            <article className="profile-card">
              <span className="profile-label">Função</span>
              <strong>Em breve</strong>
            </article>

            <article className="profile-card">
              <span className="profile-label">Sessão</span>
              <strong>Visual apenas no frontend</strong>
            </article>
          </div>

          <div className="profile-actions">
            <button type="button" className="primary-button" onClick={() => navigate("/home")}>
              Ir para tarefas
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate("/settings")}>
              Configurações
            </button>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
