import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
    </span>
  );
}

const settingsSections = [
  { id: "conta", label: "Conta" },
  { id: "aparencia", label: "Aparência" },
  { id: "preferencias", label: "Preferências" },
  { id: "notificacoes", label: "Notificações" },
  { id: "seguranca", label: "Segurança" },
];

const defaultPreferences = {
  theme: "dark",
  density: "normal",
  taskView: "lista",
  fontSize: "normal",
  categoryDefault: "Estudos",
  priorityDefault: "Média",
  sortDefault: "mais-recentes",
  showCompleted: true,
  confirmDelete: true,
  appNotifications: true,
  deadlineAlerts: true,
  overdueAlerts: false,
  productivitySummary: true,
};

function LabelToggle({ label, value, onChange, description }) {
  return (
    <label className="settings-toggle-row">
      <div>
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </div>
      <button
        type="button"
        className={`toggle ${value ? "is-on" : ""}`}
        aria-pressed={value}
        onClick={() => onChange(!value)}
      >
        <span />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("conta");
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [saveState, setSaveState] = useState("idle");

  const email = user?.email || "usuario@taskflow.com";
  const initials = (email || "U").trim().charAt(0).toUpperCase();
  const statusLabel = user ? "Ativa" : "Não autenticado";

  const content = useMemo(() => {
    switch (activeSection) {
      case "conta":
        return (
          <section className="settings-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Conta</span>
                <h2>Informações da conta</h2>
              </div>
            </div>

            <div className="settings-identity-card">
              <div className="profile-avatar settings-avatar">{initials}</div>
              <div>
                <span className="settings-label">Usuário</span>
                <strong>{email}</strong>
                <small>{statusLabel}</small>
              </div>
            </div>

            <div className="settings-list-grid">
              <div className="settings-detail-card">
                <span className="settings-label">Email</span>
                <strong>{email}</strong>
              </div>
              <div className="settings-detail-card">
                <span className="settings-label">Status da conta</span>
                <strong>{statusLabel}</strong>
              </div>
              <div className="settings-detail-card">
                <span className="settings-label">Sessão</span>
                <strong>Disponível no frontend</strong>
              </div>
              <div className="settings-detail-card">
                <span className="settings-label">Data de criação</span>
                <strong>Não disponível</strong>
              </div>
            </div>

            <div className="action-stack">
              <button type="button" className="secondary-button settings-button" disabled>
                Alterar email
              </button>
              <button type="button" className="secondary-button settings-button" disabled>
                Alterar senha
              </button>
              <button type="button" className="danger-button settings-button" disabled>
                Excluir conta
              </button>
            </div>
          </section>
        );

      case "aparencia":
        return (
          <section className="settings-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Aparência</span>
                <h2>Personalização visual</h2>
              </div>
            </div>

            <div className="settings-option-group">
              <span className="settings-label">Tema</span>
              <div className="segmented-control">
                {[
                  { value: "dark", label: "Escuro" },
                  { value: "light", label: "Claro" },
                  { value: "system", label: "Sistema" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={preferences.theme === item.value ? "selected" : ""}
                    onClick={() => setPreferences((current) => ({ ...current, theme: item.value }))}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-option-group">
              <span className="settings-label">Densidade</span>
              <div className="segmented-control">
                {[
                  { value: "compact", label: "Compacta" },
                  { value: "normal", label: "Normal" },
                  { value: "comfortable", label: "Espaçosa" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={preferences.density === item.value ? "selected" : ""}
                    onClick={() => setPreferences((current) => ({ ...current, density: item.value }))}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-option-group">
              <span className="settings-label">Visualização das tarefas</span>
              <div className="segmented-control">
                {[
                  { value: "lista", label: "Lista" },
                  { value: "grade", label: "Grade" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={preferences.taskView === item.value ? "selected" : ""}
                    onClick={() => setPreferences((current) => ({ ...current, taskView: item.value }))}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-option-group">
              <span className="settings-label">Tamanho da interface</span>
              <div className="segmented-control">
                {[
                  { value: "small", label: "Pequeno" },
                  { value: "normal", label: "Normal" },
                  { value: "large", label: "Grande" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={preferences.fontSize === item.value ? "selected" : ""}
                    onClick={() => setPreferences((current) => ({ ...current, fontSize: item.value }))}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        );

      case "preferencias":
        return (
          <section className="settings-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Preferências</span>
                <h2>Comportamento das tarefas</h2>
              </div>
            </div>

            <div className="settings-form-grid">
              <label className="settings-field">
                <span>Categoria padrão</span>
                <select
                  value={preferences.categoryDefault}
                  onChange={(event) => setPreferences((current) => ({ ...current, categoryDefault: event.target.value }))}
                >
                  <option>Estudos</option>
                  <option>Trabalho</option>
                  <option>Pessoal</option>
                  <option>Casa</option>
                </select>
              </label>

              <label className="settings-field">
                <span>Prioridade padrão</span>
                <select
                  value={preferences.priorityDefault}
                  onChange={(event) => setPreferences((current) => ({ ...current, priorityDefault: event.target.value }))}
                >
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </label>

              <label className="settings-field">
                <span>Ordenação padrão</span>
                <select
                  value={preferences.sortDefault}
                  onChange={(event) => setPreferences((current) => ({ ...current, sortDefault: event.target.value }))}
                >
                  <option value="mais-recentes">Mais recentes</option>
                  <option value="mais-antigas">Mais antigas</option>
                  <option value="prioridade">Prioridade</option>
                  <option value="data">Data</option>
                </select>
              </label>
            </div>

            <div className="toggle-stack">
              <LabelToggle
                label="Exibir tarefas concluídas"
                value={preferences.showCompleted}
                onChange={(value) => setPreferences((current) => ({ ...current, showCompleted: value }))}
              />
              <LabelToggle
                label="Confirmar antes de excluir"
                value={preferences.confirmDelete}
                onChange={(value) => setPreferences((current) => ({ ...current, confirmDelete: value }))}
              />
            </div>
          </section>
        );

      case "notificacoes":
        return (
          <section className="settings-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Notificações</span>
                <h2>Alertas e lembretes</h2>
              </div>
            </div>

            <div className="toggle-stack">
              <LabelToggle
                label="Notificações no aplicativo"
                value={preferences.appNotifications}
                onChange={(value) => setPreferences((current) => ({ ...current, appNotifications: value }))}
              />
              <LabelToggle
                label="Tarefas próximas do prazo"
                value={preferences.deadlineAlerts}
                onChange={(value) => setPreferences((current) => ({ ...current, deadlineAlerts: value }))}
              />
              <LabelToggle
                label="Tarefas atrasadas"
                value={preferences.overdueAlerts}
                onChange={(value) => setPreferences((current) => ({ ...current, overdueAlerts: value }))}
              />
              <LabelToggle
                label="Resumo de produtividade"
                value={preferences.productivitySummary}
                onChange={(value) => setPreferences((current) => ({ ...current, productivitySummary: value }))}
              />
              <div className="future-row">
                <div>
                  <strong>Notificações por email</strong>
                  <span>Disponível em breve</span>
                </div>
                <button type="button" className="future-pill" disabled>
                  Em breve
                </button>
              </div>
            </div>
          </section>
        );

      case "seguranca":
        return (
          <section className="settings-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Segurança</span>
                <h2>Segurança da conta</h2>
              </div>
            </div>

            <div className="security-card">
              <div className="session-meta-header">
                <span className="settings-label">Sessão atual</span>
                <span className="status-badge">Ativa</span>
              </div>

              <div className="session-identity">
                <strong>{email}</strong>
                <span>Estado da sessão: ativo</span>
              </div>

              <div className="security-actions">
                <button type="button" className="primary-button settings-button" onClick={() => logout().then(() => navigate("/login"))}>
                  Encerrar sessão
                </button>
                <button type="button" className="secondary-button settings-button" disabled>
                  Encerrar todas as sessões
                </button>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  }, [activeSection, email, initials, preferences, statusLabel, navigate, logout]);

  useEffect(() => {
    document.body.classList.toggle("theme", preferences.theme === "dark");
    document.body.dataset.density = preferences.density;
    document.body.dataset.fontSize = preferences.fontSize;
    document.body.dataset.taskView = preferences.taskView;

    return () => {
      document.body.classList.remove("theme");
      delete document.body.dataset.density;
      delete document.body.dataset.fontSize;
      delete document.body.dataset.taskView;
    };
  }, [preferences]);

  function handleSave() {
    setSaveState("saving");
    window.setTimeout(() => {
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1800);
    }, 600);
  }

  return (
    <div className="app-shell settings-shell">
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
          <button type="button" className="nav-link-button" onClick={() => navigate("/profile")}>
            Perfil
          </button>
          <button type="button" className="nav-link-button active" aria-current="page">
            Configurações
          </button>
        </nav>

        <div className="header-actions">
          <button type="button" className="secondary-button small-button" onClick={() => navigate("/home")}>
            Voltar
          </button>
        </div>
      </header>

      <main className="settings-main">
        <header className="settings-header-block">
          <div>
            <span className="eyebrow">Configurações</span>
            <h1>Configurações</h1>
          </div>
          <p>Gerencie sua conta, preferências e segurança.</p>
        </header>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            <div className="settings-user-summary">
              <div className="profile-avatar settings-avatar">{initials}</div>
              <div>
                <strong>{email}</strong>
                <span>{statusLabel}</span>
              </div>
            </div>

            <nav className="settings-nav" aria-label="Seções de configurações">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={activeSection === section.id ? "active" : ""}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="settings-content">
            {content}

            <div className="settings-footer">
              <div className={`save-feedback ${saveState}`} aria-live="polite">
                {saveState === "saving" && "Salvando..."}
                {saveState === "saved" && "Preferências salvas"}
                {saveState === "idle" && "Nenhuma alteração pendente"}
              </div>

              <button type="button" className="primary-button settings-save" onClick={handleSave} disabled={saveState === "saving"}>
                {saveState === "saving" ? "Salvando..." : "Salvar preferências"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
