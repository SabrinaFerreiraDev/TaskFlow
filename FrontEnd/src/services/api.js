import axios from "axios";

const STORAGE_KEY = "taskflow_session";

export const isOfflineMode = !import.meta.env.VITE_API_URL;

export function getStoredSession() {
  if (typeof window === "undefined") return { accessToken: "", refreshToken: "", user: null };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: "", refreshToken: "", user: null };

    const data = JSON.parse(raw);
    return {
      accessToken: data?.accessToken || "",
      refreshToken: data?.refreshToken || "",
      user: data?.user || null,
    };
  } catch {
    return { accessToken: "", refreshToken: "", user: null };
  }
}

export function saveSession(nextSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
}

export function clearSessionStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken() {
  return getStoredSession().accessToken || "";
}

export function getRefreshToken() {
  return getStoredSession().refreshToken || "";
}

export function updateSession(nextSession) {
  const previous = getStoredSession();
  const merged = {
    accessToken: nextSession.accessToken ?? previous.accessToken ?? "",
    refreshToken: nextSession.refreshToken ?? previous.refreshToken ?? "",
    user: nextSession.user ?? previous.user ?? null,
  };

  saveSession(merged);
  return merged;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || undefined,
  timeout: 15000,
});

export function isConnectionError(error) {
  return Boolean(
    error && (
      error.code === "ECONNREFUSED" ||
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_CONNECTION_REFUSED" ||
      error.message?.includes("ERR_CONNECTION_REFUSED") ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("Network Error")
    )
  );
}

let refreshInProgress = false;
let refreshQueue = [];

const processRefreshQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });

  refreshQueue = [];
};

api.interceptors.request.use((config) => {
  const publicRoutes = ["/auth/login", "/auth/refresh", "/auth/logout"];
  const isPublicRoute = publicRoutes.some((route) => config.url?.includes(route));

  if (!isPublicRoute) {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
    const isLogoutRequest = originalRequest?.url?.includes("/auth/logout");

    if (error.response?.status !== 401 || isRefreshRequest || isLogoutRequest || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSessionStorage();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (refreshInProgress) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((refreshError) => Promise.reject(refreshError));
    }

    refreshInProgress = true;

    try {
      const response = await axios.post(
        `${api.defaults.baseURL || ""}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      const accessToken = response?.data?.accessToken;
      if (!accessToken) {
        throw new Error("Access token ausente na resposta do refresh.");
      }

      const session = getStoredSession();
      const nextSession = updateSession({
        ...session,
        accessToken,
        user: response?.data?.user ?? session.user,
      });

      processRefreshQueue(null, nextSession.accessToken);
      originalRequest._retry = true;
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${nextSession.accessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError, null);
      clearSessionStorage();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      refreshInProgress = false;
    }
  },
);

function collectMessages(value, messages = []) {
  if (!value) return messages;

  if (typeof value === "string") {
    const message = value.trim();
    if (message) messages.push(message);
    return messages;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectMessages(item, messages));
    return messages;
  }

  if (typeof value === "object") {
    const knownKeys = ["message", "error", "errors", "issues", "details"];
    const initialCount = messages.length;
    knownKeys.forEach((key) => {
      if (value[key]) collectMessages(value[key], messages);
    });
    if (messages.length === initialCount) {
      Object.values(value).forEach((item) => collectMessages(item, messages));
    }
  }

  return messages;
}

export function getApiErrorMessages(error, fallback = "Não foi possível concluir a operação.") {
  const messages = collectMessages(error?.response?.data);
  return [...new Set(messages)].length ? [...new Set(messages)] : [fallback];
}

export default api;
