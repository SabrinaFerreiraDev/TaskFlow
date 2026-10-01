import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import PasswordField from "../components/PasswordField.jsx";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
    </span>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthPending } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim();
    const password = form.password;
    const nextErrors = { email: "", password: "" };

    if (!email) {
      nextErrors.email = "Informe seu email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Informe um email válido.";
    }

    if (!password) {
      nextErrors.password = "Informe sua senha.";
    }

    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      setFormError("Revise os campos destacados.");
      return;
    }

    setFormError("");
    setSuccessMessage("");

    const result = await login(email, password);

    if (!result.ok) {
      setFormError(Array.isArray(result.error) ? result.error[0] : result.error || "Não foi possível entrar.");
      return;
    }

    setSuccessMessage("Login realizado com sucesso.");
    navigate("/home");
  }

  return (
    <main className="auth-screen auth-shell">
      <section className="auth-panel">
        <Link to="/" className="brand auth-brand" aria-label="Voltar para a apresentação">
          <BrandMark />
          <span>
            Task<span>Flow</span>
          </span>
        </Link>

        <div className="auth-intro">
          <div className="auth-badges" aria-label="Destaques de acesso seguro">
            <span className="auth-badge">Acesso seguro</span>
            <span className="auth-badge muted">TaskFlow</span>
          </div>
          <span className="eyebrow">Bem-vindo de volta</span>
          <h1>Entrar</h1>
          <p>Acesse seu painel de tarefas e continue do ponto em que parou.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className={`field auth-field ${fieldErrors.email ? "has-error" : ""}`} htmlFor="login-email">
            <span>Email</span>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }));
                setFieldErrors((current) => ({ ...current, email: "" }));
              }}
              placeholder="seu@email.com"
              aria-label="Email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
              className={fieldErrors.email ? "input-error" : ""}
            />
            {fieldErrors.email && (
              <span id="login-email-error" className="field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </label>

          <PasswordField
            id="login-password"
            label="Senha"
            name="password"
            value={form.password}
            onChange={(event) => {
              setForm((current) => ({ ...current, password: event.target.value }));
              setFieldErrors((current) => ({ ...current, password: "" }));
            }}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            error={fieldErrors.password}
            disabled={isAuthPending}
          />

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          {successMessage && (
            <p className="form-success" role="status">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={isAuthPending}
          >
            {isAuthPending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/register">Criar conta</Link>
          <button type="button" className="link-button" disabled>
            Esqueci minha senha
          </button>
        </div>
      </section>
    </main>
  );
}
