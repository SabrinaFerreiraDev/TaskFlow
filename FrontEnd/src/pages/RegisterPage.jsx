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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthPending } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    const errors = {};

    if (!email) {
      errors.email = "O email é obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Informe um email válido.";
    }

    if (!password) {
      errors.password = "A senha é obrigatória.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirme sua senha.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem.";
    }

    if (Object.keys(errors).length > 0) {
      setFormError(Object.values(errors)[0]);
      return;
    }

    setFormError("");
    setSuccessMessage("");

    const result = await register(email, password);

    if (!result.ok) {
      setFormError(Array.isArray(result.error) ? result.error[0] : result.error || "Não foi possível criar a conta.");
      return;
    }

    setSuccessMessage("Conta criada com sucesso.");
    navigate("/login");
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
          <span className="eyebrow">Primeiros passos</span>
          <h1>Criar conta</h1>
          <p>Comece a organizar seus planos com um ambiente mais claro e focado.</p>
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
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Crie uma senha"
              aria-label="Senha"
            />
          </label>

          <label className="field auth-field">
            <span>Confirmar senha</span>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              placeholder="Repita sua senha"
              aria-label="Confirmar senha"
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
            {isAuthPending ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Já tenho conta</Link>
        </div>
      </section>
    </main>
  );
}
