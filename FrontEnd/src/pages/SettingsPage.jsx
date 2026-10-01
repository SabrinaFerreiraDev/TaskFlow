import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../App.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { TaskContext } from "../contexts/TaskContext.jsx";

const sections = ["Conta", "Aparência", "Preferências", "Notificações", "Segurança", "Zona de perigo"];
const defaults = { category: "Estudos", priority: "Média", sort: "recentes", completed: true, confirm: true, app: true, deadline: true, overdue: false, summary: true };

function Toggle({ label, checked, onChange, description }) {
  return <div className="settings-toggle-row"><div><strong>{label}</strong>{description && <span>{description}</span>}</div><button type="button" className={`toggle ${checked ? "is-on" : ""}`} aria-pressed={checked} onClick={() => onChange(!checked)}><span /><span className="sr-only">{checked ? "Desativar" : "Ativar"} {label}</span></button></div>;
}
function Choices({ value, onChange, options }) {
  return <div className="segmented-control">{options.map((item) => <button key={item.value} type="button" className={item.value === value ? "selected" : ""} aria-pressed={item.value === value} onClick={() => onChange(item.value)}>{item.label}</button>)}</div>;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useContext(TaskContext);
  const [active, setActive] = useState("Conta");
  const [prefs, setPrefs] = useState(defaults);
  const [saveState, setSaveState] = useState("idle");
  const email = user?.email || "usuario@taskflow.com";
  const initials = email.trim().charAt(0).toUpperCase();
  const update = (key) => (value) => setPrefs((current) => ({ ...current, [key]: value }));

  const content = useMemo(() => {
    if (active === "Conta") return <><div className="section-copy"><h2>Informações da conta</h2><p>Consulte os dados disponíveis para sua conta.</p></div><div className="settings-identity-card"><div className="profile-avatar settings-avatar">{initials}</div><div><span className="settings-label">Conta</span><strong>{email}</strong><small>Ativa</small></div></div><dl className="settings-details"><div><dt>Email</dt><dd>{email}</dd></div><div><dt>Status da conta</dt><dd><span className="status-badge">Ativa</span></dd></div></dl></>;
    if (active === "Aparência") return <><div className="section-copy"><h2>Aparência</h2><p>Escolha como o TaskFlow aparece em todos os ambientes.</p></div><div className="settings-option-group"><span className="settings-label">Tema</span><Choices value={themeMode} onChange={setThemeMode} options={[{ value: "light", label: "Claro" }, { value: "dark", label: "Escuro" }, { value: "system", label: "Sistema" }]} /><p className="field-hint">A escolha é salva e não muda ao navegar entre páginas.</p></div></>;
    if (active === "Preferências") return <><div className="section-copy"><h2>Preferências</h2><p>Defina as opções padrão para organizar suas tarefas.</p></div><div className="settings-form-grid"><label className="settings-field"><span>Categoria padrão</span><select value={prefs.category} onChange={(e) => update("category")(e.target.value)}><option>Estudos</option><option>Trabalho</option><option>Pessoal</option></select></label><label className="settings-field"><span>Prioridade padrão</span><select value={prefs.priority} onChange={(e) => update("priority")(e.target.value)}><option>Alta</option><option>Média</option><option>Baixa</option></select></label><label className="settings-field"><span>Ordenação padrão</span><select value={prefs.sort} onChange={(e) => update("sort")(e.target.value)}><option value="recentes">Mais recentes</option><option value="antigas">Mais antigas</option><option value="prioridade">Prioridade</option></select></label></div><div className="toggle-stack"><Toggle label="Exibir tarefas concluídas" checked={prefs.completed} onChange={update("completed")} /><Toggle label="Confirmar antes de excluir" checked={prefs.confirm} onChange={update("confirm")} /></div></>;
    if (active === "Notificações") return <><div className="section-copy"><h2>Notificações</h2><p>Controle os alertas que aparecem enquanto usa o app.</p></div><div className="toggle-stack"><Toggle label="Notificações no aplicativo" checked={prefs.app} onChange={update("app")} /><Toggle label="Tarefas próximas do prazo" checked={prefs.deadline} onChange={update("deadline")} /><Toggle label="Tarefas atrasadas" checked={prefs.overdue} onChange={update("overdue")} /><Toggle label="Resumo de produtividade" checked={prefs.summary} onChange={update("summary")} /></div></>;
    if (active === "Segurança") return <><div className="section-copy"><h2>Segurança</h2><p>Gerencie o acesso da sessão em uso.</p></div><div className="security-card"><div className="session-meta-header"><span className="settings-label">Sessão atual</span><span className="status-badge">Ativa</span></div><div className="session-identity"><strong>{email}</strong><span>Sessão autenticada neste dispositivo.</span></div><button type="button" className="secondary-button settings-button" onClick={() => logout().then(() => navigate("/login"))}>Encerrar sessão</button></div></>;
    return <><div className="section-copy"><h2>Zona de perigo</h2><p>Ações irreversíveis da conta ficam concentradas aqui.</p></div><div className="danger-zone"><strong>Excluir conta</strong><p id="delete-account-note">Esta ação não está disponível porque não há uma operação correspondente no sistema.</p><button type="button" className="danger-button" disabled aria-describedby="delete-account-note">Excluir conta</button></div></>;
  }, [active, email, initials, navigate, logout, prefs, themeMode, setThemeMode]);

  function save() { setSaveState("saving"); window.setTimeout(() => { setSaveState("saved"); window.setTimeout(() => setSaveState("idle"), 1800); }, 600); }
  return <div className="app-shell settings-shell"><Header /><main className="settings-main"><header className="page-heading settings-header-block"><div><span className="eyebrow">Preferências</span><h1>Configurações</h1><p>Gerencie sua conta e personalize sua experiência no TaskFlow.</p></div><div className="page-user"><span className="profile-avatar settings-avatar">{initials}</span><span>{email}</span></div></header><div className="settings-layout"><aside className="settings-sidebar"><nav className="settings-nav" aria-label="Seções de configurações">{sections.map((section) => <button key={section} type="button" className={active === section ? "active" : ""} onClick={() => setActive(section)}>{section}</button>)}</nav></aside><section className="settings-content"><div className="settings-section">{content}</div><div className="settings-footer"><span className={`save-feedback ${saveState}`} aria-live="polite">{saveState === "saving" ? "Salvando..." : saveState === "saved" ? "Preferências salvas" : "Preferências locais desta tela"}</span><button type="button" className="primary-button settings-save" onClick={save} disabled={saveState === "saving"}>{saveState === "saving" ? "Salvando..." : "Salvar preferências"}</button></div></section></div></main></div>;
}
