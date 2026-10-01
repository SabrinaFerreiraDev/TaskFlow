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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthPending } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "", confirmPassword: "" });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;
    const nextErrors = { email: "", password: "", confirmPassword: "" };

    if (!email) {
      nextErrors.email = "O email é obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Informe um email válido.";
    }

    if (!password) {
      nextErrors.password = "A senha é obrigatória.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirme sua senha.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "As senhas não coincidem.";
    }

    setFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password || nextErrors.confirmPassword) {
      setFormError("Revise os campos destacados.");
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
          <div className="auth-badges" aria-label="Destaques de criação de conta">
            <span className="auth-badge">Nova conta</span>
            <span className="auth-badge muted">TaskFlow</span>
          </div>
          <span className="eyebrow">Primeiros passos</span>
          <h1>Criar conta</h1>
          <p>Comece a organizar seus planos com um ambiente mais claro e focado.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className={`field auth-field ${fieldErrors.email ? "has-error" : ""}`} htmlFor="register-email">
            <span>Email</span>
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              disabled={isAuthPending}
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }));
                setFieldErrors((current) => ({ ...current, email: "" }));
              }}
              placeholder="seu@email.com"
              aria-label="Email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
              className={fieldErrors.email ? "input-error" : ""}
            />
            {fieldErrors.email && (
              <span id="register-email-error" className="field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </label>

          <PasswordField
            id="register-password"
            label="Senha"
            name="password"
            value={form.password}
            onChange={(event) => {
              setForm((current) => ({ ...current, password: event.target.value }));
              setFieldErrors((current) => ({ ...current, password: "" }));
            }}
            placeholder="Crie uma senha"
            autoComplete="new-password"
            error={fieldErrors.password}
            disabled={isAuthPending}
          />

          <PasswordField
            id="register-confirm-password"
            label="Confirmar senha"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={(event) => {
              setForm((current) => ({ ...current, confirmPassword: event.target.value }));
              setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
            }}
            placeholder="Repita sua senha"
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
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
