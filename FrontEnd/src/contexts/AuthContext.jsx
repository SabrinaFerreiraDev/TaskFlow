import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSessionStorage,
  getApiErrorMessages,
  getStoredSession,
  isConnectionError,
  isOfflineMode,
  saveSession,
  updateSession,
} from "../services/api.js";
import { loginUser, registerUser, getCurrentUser } from "../services/authService.js";

const AuthContext = createContext(null);

const safeValidationMessages = new Set([
  "Informe um e-mail válido",
  "A senha deve ter pelo menos 8 caracteres",
  "A senha deve ter no máximo 128 caracteres",
  "O email é obrigatório.",
  "A senha é obrigatória.",
  "Confirme sua senha.",
  "As senhas não coincidem.",
]);

function getAuthError(requestError, operation) {
  const status = requestError?.response?.status;
  const responseMessage = requestError?.response?.data?.message;

  if (operation === "login" && status === 401) {
    return { message: "E-mail ou senha incorretos." };
  }

  if (operation === "register" && status === 409) {
    return { message: "Este e-mail já está cadastrado.", code: "EMAIL_EXISTS" };
  }

  if (isConnectionError(requestError) || !requestError?.response) {
    return { message: "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente." };
  }

  const issues = requestError?.response?.data?.issues;
  const issueMessages = Array.isArray(issues)
    ? issues.map((issue) => issue?.message).filter((message) => safeValidationMessages.has(message))
    : [];
  const safeMessages = [...new Set(issueMessages ?? [])];

  if (safeMessages.length) {
    return { message: safeMessages.join(" ") };
  }

  if (safeValidationMessages.has(responseMessage)) {
    return { message: responseMessage };
  }

  return {
    message: status >= 500
      ? "Não foi possível concluir a operação no momento. Tente novamente."
      : operation === "login"
        ? "Não foi possível entrar na sua conta. Verifique os dados e tente novamente."
        : "Não foi possível criar a conta. Verifique os dados e tente novamente.",
  };
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

export function AuthProvider({ children }) {
  const storedSession = getStoredSession();
  const [user, setUser] = useState(storedSession.user ?? null);
  const [authStatus, setAuthStatus] = useState(storedSession.accessToken ? "restoring" : "unauthenticated");
  const [isAuthPending, setIsAuthPending] = useState(false);
  const [sessionError, setSessionError] = useState("");

  function clearSession() {
    setUser(null);
    setAuthStatus("unauthenticated");
    setSessionError("");
    clearSessionStorage();
  }

  function persistSession(sessionData) {
    const previous = getStoredSession();
    const nextSession = updateSession({
      accessToken: sessionData?.accessToken ?? previous.accessToken ?? "",
      refreshToken: sessionData?.refreshToken ?? previous.refreshToken ?? "",
      user: sessionData?.user ?? previous.user ?? null,
    });

    setUser(nextSession.user ?? null);
    setAuthStatus(nextSession.accessToken || nextSession.user ? "authenticated" : "unauthenticated");
    saveSession(nextSession);
    return nextSession;
  }

  async function login(email, password) {
    if (isOfflineMode) {
      const nextUser = { email: email.trim() || "demo@taskflow.com" };
      setUser(nextUser);
      setAuthStatus("authenticated");
      setSessionError("");
      return { ok: true, data: nextUser };
    }

    setIsAuthPending(true);
    setSessionError("");

    try {
      const response = await loginUser(email, password);
      const payload = response?.data ?? {};
      if (!payload?.accessToken || !payload?.user?.id) {
        throw new Error("Resposta de autenticação inválida");
      }
      const nextUser = payload.user ?? { email: email.trim() };

      persistSession({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: nextUser,
      });

      return { ok: true, data: nextUser };
    } catch (requestError) {
      const result = getAuthError(requestError, "login");
      setSessionError(result.message);
      return { ok: false, error: result.message };
    } finally {
      setIsAuthPending(false);
    }
  }

  async function register(email, password) {
    if (isOfflineMode) {
      return { ok: true, data: { email: email.trim() || "demo@taskflow.com" } };
    }

    setIsAuthPending(true);
    setSessionError("");

    try {
      const response = await registerUser(email, password);
      if (!response?.data?.user?.id) {
        throw new Error("Resposta de cadastro inválida");
      }
      return { ok: true, data: response.data };
    } catch (requestError) {
      const result = getAuthError(requestError, "register");
      setSessionError(result.message);
      return { ok: false, error: result.message, code: result.code };
    } finally {
      setIsAuthPending(false);
    }
  }

  async function logout() {
    if (isOfflineMode) {
      clearSession();
      return;
    }

    setIsAuthPending(true);

    clearSession();
    setIsAuthPending(false);
  }

  async function restoreSession() {
    if (isOfflineMode) {
      setUser(null);
      setAuthStatus("unauthenticated");
      setSessionError("");
      return { ok: true, data: null };
    }

    const session = getStoredSession();
    if (!session.accessToken) {
      clearSession();
      return { ok: false, error: "Token de acesso ausente." };
    }

    setIsAuthPending(true);
    setSessionError("");

    try {
      const response = await getCurrentUser();
      const nextUser = response?.data ?? null;
      persistSession({ accessToken: session.accessToken, user: nextUser });

      setAuthStatus("authenticated");
      return { ok: true, data: nextUser };
    } catch (requestError) {
      const result = getApiErrorMessages(requestError, "Sessão indisponível no momento.");
      clearSession();
      setSessionError(Array.isArray(result) ? result[0] : result);
      return { ok: false, error: result };
    } finally {
      setIsAuthPending(false);
    }
  }

  async function loadCurrentUser() {
    if (isOfflineMode) {
      setUser(null);
      setAuthStatus("unauthenticated");
      setSessionError("");
      return { ok: true, data: null };
    }

    const session = getStoredSession();
    if (!session.accessToken) {
      clearSession();
      return { ok: false, error: "Token de acesso ausente." };
    }

    setIsAuthPending(true);

    try {
      const response = await getCurrentUser();
      const nextUser = response?.data ?? session.user ?? null;
      setUser(nextUser);
      setAuthStatus(nextUser ? "authenticated" : "unauthenticated");
      return { ok: true, data: nextUser };
    } catch (requestError) {
      const result = getApiErrorMessages(requestError, "Sessão indisponível no momento.");
      clearSession();
      setSessionError(Array.isArray(result) ? result[0] : result);
      return { ok: false, error: result };
    } finally {
      setIsAuthPending(false);
    }
  }

  useEffect(() => {
    void restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      authStatus,
      isAuthPending,
      sessionError,
      setUser,
      login,
      register,
      logout,
      loadCurrentUser,
      restoreSession,
    }),
    [user, authStatus, isAuthPending, sessionError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
