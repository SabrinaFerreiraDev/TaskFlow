import { useNavigate } from "react-router-dom";
import { Header } from "../App.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const email = user?.email || "usuario@taskflow.com";
  const initials = email.trim().charAt(0).toUpperCase();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell profile-shell">
      <Header />
      <main className="profile-main">
        <header className="page-heading">
          <div>
            <span className="eyebrow">Conta</span>
            <h1>Perfil</h1>
            <p>Veja as informações disponíveis na sua conta TaskFlow.</p>
          </div>
        </header>

        <section className="profile-panel" aria-labelledby="profile-identity-title">
          <div className="profile-identity">
            <div className="profile-avatar" aria-label={`Avatar de ${email}`}>{initials}</div>
            <div>
              <span className="eyebrow">Identidade</span>
              <h2 id="profile-identity-title">{email}</h2>
              <p>Conta ativa no TaskFlow</p>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-copy"><h2>Informações da conta</h2><p>Estes são os dados disponíveis para esta conta.</p></div>
            <dl className="profile-details">
              <div><dt>Email</dt><dd>{email}</dd></div>
              <div><dt>Status</dt><dd><span className="status-badge">Ativa</span></dd></div>
            </dl>
          </div>

          <div className="profile-section profile-security">
            <div className="section-copy"><h2>Segurança</h2><p>Gerencie a sessão atual nas configurações da conta.</p></div>
            <button type="button" className="secondary-button" onClick={() => navigate("/settings")}>Abrir configurações</button>
          </div>

          <div className="profile-actions" aria-label="Ações do perfil">
            <button type="button" className="primary-button" onClick={() => navigate("/home")}>Ir para tarefas</button>
            <button type="button" className="danger-button" onClick={handleLogout}>Sair da conta</button>
          </div>
        </section>
      </main>
    </div>
  );
}
