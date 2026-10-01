import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

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
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) {
      setFormError("Informe seu email e senha para continuar.");
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
          <span className="eyebrow">Bem-vindo de volta</span>
          <h1>Entrar</h1>
          <p>Acesse seu painel de tarefas e continue do ponto em que parou.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="field auth-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="seu@email.com"
              aria-label="Email"
            />
          </label>

          <label className="field auth-field">
            <span>Senha</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Digite sua senha"
              aria-label="Senha"
            />
          </label>

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
