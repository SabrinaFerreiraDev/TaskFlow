import api, { getRefreshToken } from "./api.js";

export async function registerUser(email, password) {
  return api.post("/users", {
    email,
    password,
  });
}

export async function loginUser(email, password) {
  return api.post("/auth/login", {
    email,
    password,
  });
}

export async function refreshSessionToken(refreshToken) {
  return api.post("/auth/refresh", {
    refreshToken: refreshToken || getRefreshToken(),
  });
}

export async function getCurrentUser() {
  return api.get("/auth/me");
}

export async function logoutUser() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return { data: {} };
  }

  return api.post("/auth/logout", { refreshToken });
}
