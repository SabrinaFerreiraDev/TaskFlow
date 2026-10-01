import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSessionStorage,
  getApiErrorMessages,
  getStoredSession,
  isOfflineMode,
  saveSession,
  updateSession,
} from "../services/api.js";
import { loginUser, logoutUser, registerUser, getCurrentUser, refreshSessionToken } from "../services/authService.js";

const AuthContext = createContext(null);

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
  const [authStatus, setAuthStatus] = useState(storedSession.refreshToken ? "restoring" : "unauthenticated");
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
      const nextUser = payload.user ?? { email: email.trim() };

      persistSession({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: nextUser,
      });

      return { ok: true, data: payload };
    } catch (requestError) {
      const result = getApiErrorMessages(requestError, "Não foi possível entrar na sua conta.");
      setUser(null);
      setAuthStatus("unauthenticated");
      setSessionError(Array.isArray(result) ? result[0] : result);
      return { ok: false, error: result };
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
      return { ok: true, data: response.data };
    } catch (requestError) {
      const result = getApiErrorMessages(requestError, "Não foi possível criar a conta.");
      setSessionError(Array.isArray(result) ? result[0] : result);
      return { ok: false, error: result };
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

    try {
      await logoutUser();
    } catch (requestError) {
      const result = getApiErrorMessages(requestError, "Não foi possível encerrar a sessão.");
      setSessionError(Array.isArray(result) ? result[0] : result);
    } finally {
      clearSession();
      setIsAuthPending(false);
    }
  }

  async function restoreSession() {
    if (isOfflineMode) {
      setUser(null);
      setAuthStatus("unauthenticated");
      setSessionError("");
      return { ok: true, data: null };
    }

    const session = getStoredSession();
    if (!session.refreshToken) {
      clearSession();
      return { ok: false, error: "Refresh token ausente." };
    }

    setIsAuthPending(true);
    setSessionError("");

    try {
      const response = await refreshSessionToken(session.refreshToken);
      const payload = response?.data ?? {};
      const nextUser = payload.user ?? session.user ?? null;

      if (!payload.accessToken) {
        clearSession();
        return { ok: false, error: "Não foi possível restaurar a sessão." };
      }

      persistSession({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken ?? session.refreshToken,
        user: nextUser,
      });

      setAuthStatus("authenticated");
      return { ok: true, data: payload };
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
    if (!session.refreshToken) {
      clearSession();
      return { ok: false, error: "Refresh token ausente." };
    }

    setIsAuthPending(true);

    try {
      const response = await getCurrentUser();
      const nextUser = response?.data ?? session.user ?? null;
      setUser(nextUser);
      setAuthStatus(nextUser ? "authenticated" : "unauthenticated");
      return { ok: true, data: nextUser };
    } catch (requestError) {
      const refreshResult = await restoreSession();
      if (refreshResult.ok) {
        return { ok: true, data: getStoredSession().user };
      }

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
