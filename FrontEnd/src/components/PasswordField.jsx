import { useState } from "react";

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-1.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.6A3 3 0 0 1 13.5 9a3 3 0 0 1 3.9 4.3M9.1 5.7A12.2 12.2 0 0 1 12 5c6.5 0 10 7 10 7a18.1 18.1 0 0 1-5.5 6.3M6.2 6.2A16.9 16.9 0 0 0 2 12s3.5 7 10 7a11.8 11.8 0 0 0 5.2-1.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

export default function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  disabled,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((current) => !current);
  };

  return (
    <label className={`field auth-field ${error ? "has-error" : ""}`} htmlFor={id}>
      <span>{label}</span>

      <div className={`password-field ${error ? "has-error" : ""}`}>
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-label={label}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        <button
          type="button"
          className="password-toggle"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          title={showPassword ? "Ocultar senha" : "Mostrar senha"}
          onClick={togglePassword}
          disabled={disabled}
        >
          <EyeIcon visible={showPassword} />
        </button>
      </div>

      {error && (
        <span id={`${id}-error`} className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
