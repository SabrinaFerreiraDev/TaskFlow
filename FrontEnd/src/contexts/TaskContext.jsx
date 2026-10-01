import { createContext, useEffect, useState } from "react";
import api, { getApiErrorMessages, isConnectionError, isOfflineMode } from "../services/api.js";

export const TaskContext = createContext();

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredTheme = () => {
  if (typeof window === "undefined") return "system";
  const savedTheme = localStorage.getItem("taskflow-theme");
  return savedTheme && ["light", "dark", "system"].includes(savedTheme) ? savedTheme : "system";
};

const applyTheme = (mode) => {
  if (typeof document === "undefined") return;

  const resolvedTheme = mode === "system" ? getSystemTheme() : mode;
  document.body.classList.toggle("theme", resolvedTheme === "dark");
  document.body.dataset.theme = resolvedTheme;
  document.body.style.colorScheme = resolvedTheme;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pending, setPending] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [themeMode, setThemeMode] = useState(getStoredTheme);
  const pendentes = tasks.filter((task) => !task.completed);
  const concluidas = tasks.filter((task) => task.completed);
  const favoritas = tasks.filter((task) => task.favorite);
  const tarefasFiltradas = tasks.filter((task) => filtro === "pendentes" ? !task.completed : filtro === "concluidas" ? task.completed : filtro === "favoritas" ? task.favorite : true);

  useEffect(() => {
    async function getTasks() {
      if (isOfflineMode) {
        setTasks([]);
        setError("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get("/tasks");
        setTasks(response.data);
      } catch (requestError) {
        if (isConnectionError(requestError)) {
          setTasks([]);
          setError("");
          return;
        }

        setError(getApiErrorMessages(requestError, "Não foi possível carregar suas tarefas."));
      } finally {
        setLoading(false);
      }
    }
    getTasks();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("taskflow-theme", themeMode);
    applyTheme(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== "system" || typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => applyTheme("system");

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, [themeMode]);

  const setBusy = (key, value) => setPending((current) => ({ ...current, [key]: value }));
  const notify = (type, message) => setFeedback({ id: Date.now(), type, message });
  const failed = (requestError, fallback) => ({ ok: false, error: getApiErrorMessages(requestError, fallback) });

  const themes = () => {
    setThemeMode((current) => {
      const actual = current === "system" ? getSystemTheme() : current;
      return actual === "dark" ? "light" : "dark";
    });
  };

  async function addTask(task) {
    if (isOfflineMode) {
      const newTask = {
        id: Date.now(),
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        completed: false,
        favorite: false,
      };
      setBusy("create", true);
      setTasks((current) => [...current, newTask]);
      notify("success", "Tarefa criada");
      setBusy("create", false);
      return { ok: true, data: newTask };
    }

    setBusy("create", true);
    try {
      const response = await api.post("/tasks", task);
      setTasks((current) => [...current, response.data]);
      notify("success", "Tarefa criada");
      return { ok: true, data: response.data };
    } catch (requestError) {
      const result = failed(requestError, "Não foi possível criar a tarefa."); notify("error", result.error); return result;
    } finally { setBusy("create", false); }
  }

  async function addfavorite(task) {
    if (isOfflineMode) {
      const key = `favorite-${task.id}`; setBusy(key, true);
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, favorite: !item.favorite } : item));
      notify("success", task.favorite ? "Removida dos favoritos" : "Adicionada aos favoritos");
      setBusy(key, false);
      return { ok: true, data: { ...task, favorite: !task.favorite } };
    }

    const key = `favorite-${task.id}`; setBusy(key, true);
    try {
      const response = await api.patch(`/tasks/${task.id}/favorite`, { favorite: !task.favorite });
      setTasks((current) => current.map((item) => item.id === response.data.id ? response.data : item));
      notify("success", response.data.favorite ? "Adicionada aos favoritos" : "Removida dos favoritos"); return { ok: true, data: response.data };
    } catch (requestError) { const result = failed(requestError, "Não foi possível atualizar os favoritos."); notify("error", result.error); return result;
    } finally { setBusy(key, false); }
  }

  async function removeTask(task) {
    if (isOfflineMode) {
      const key = `delete-${task.id}`; setBusy(key, true);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      notify("success", "Tarefa excluída");
      setBusy(key, false);
      return { ok: true };
    }

    const key = `delete-${task.id}`; setBusy(key, true);
    try { await api.delete(`/tasks/${task.id}`); setTasks((current) => current.filter((item) => item.id !== task.id)); notify("success", "Tarefa excluída"); return { ok: true };
    } catch (requestError) { const result = failed(requestError, "Não foi possível excluir a tarefa."); notify("error", result.error); return result;
    } finally { setBusy(key, false); }
  }

  function editTask(task) { setEditingTask(task); }

  async function updateTask(updatedTask) {
    if (isOfflineMode) {
      const key = `update-${updatedTask.id}`; setBusy(key, true);
      setTasks((current) => current.map((task) => task.id === updatedTask.id ? updatedTask : task));
      notify("success", "Tarefa atualizada");
      setBusy(key, false);
      return { ok: true, data: updatedTask };
    }

    const key = `update-${updatedTask.id}`; setBusy(key, true);
    try {
      const response = await api.patch(`/tasks/${updatedTask.id}`, { title: updatedTask.title, description: updatedTask.description, category: updatedTask.category, priority: updatedTask.priority });
      setTasks((current) => current.map((task) => task.id === response.data.id ? response.data : task)); notify("success", "Tarefa atualizada"); return { ok: true, data: response.data };
    } catch (requestError) { const result = failed(requestError, "Não foi possível editar a tarefa."); notify("error", result.error); return result;
    } finally { setBusy(key, false); }
  }

  async function handleTaskCompletion(task) {
    if (isOfflineMode) {
      const key = `complete-${task.id}`; setBusy(key, true);
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item));
      notify("success", task.completed ? "Tarefa marcada como pendente" : "Tarefa concluída");
      setBusy(key, false);
      return { ok: true, data: { ...task, completed: !task.completed } };
    }

    const key = `complete-${task.id}`; setBusy(key, true);
    try {
      const response = await api.patch(`/tasks/${task.id}/completed`, { completed: !task.completed });
      setTasks((current) => current.map((item) => item.id === response.data.id ? response.data : item)); notify("success", response.data.completed ? "Tarefa concluída" : "Tarefa marcada como pendente"); return { ok: true, data: response.data };
    } catch (requestError) { const result = failed(requestError, "Não foi possível atualizar a tarefa."); notify("error", result.error); return result;
    } finally { setBusy(key, false); }
  }

  return <TaskContext.Provider value={{ tasks, loading, error, setError, feedback, setFeedback, isBusy: (key) => Boolean(pending[key]), addTask, addfavorite, removeTask, pendentes, concluidas, favoritas, themes, themeMode, setThemeMode, handleTaskCompletion, filtro, setFiltro, tarefasFiltradas, editTask, editingTask, setEditingTask, updateTask }}>{children}</TaskContext.Provider>;
};
