import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

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
