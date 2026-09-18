import { createContext, useEffect, useState } from "react";
import api, { getApiErrorMessages } from "../services/api.js";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pending, setPending] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const pendentes = tasks.filter((task) => !task.completed);
  const concluidas = tasks.filter((task) => task.completed);
  const favoritas = tasks.filter((task) => task.favorite);
  const tarefasFiltradas = tasks.filter((task) => filtro === "pendentes" ? !task.completed : filtro === "concluidas" ? task.completed : filtro === "favoritas" ? task.favorite : true);

  useEffect(() => {
    async function getTasks() {
      try {
        setLoading(true);
        const response = await api.get("/tasks");
        setTasks(response.data);
      } catch (requestError) {
        setError(getApiErrorMessages(requestError, "Não foi possível carregar suas tarefas."));
      } finally {
        setLoading(false);
      }
    }
    getTasks();
  }, []);

  const setBusy = (key, value) => setPending((current) => ({ ...current, [key]: value }));
  const notify = (type, message) => setFeedback({ id: Date.now(), type, message });
  const failed = (requestError, fallback) => ({ ok: false, error: getApiErrorMessages(requestError, fallback) });

  async function addTask(task) {
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
    const key = `favorite-${task.id}`; setBusy(key, true);
    try {
      const response = await api.patch(`/tasks/${task.id}/favorite`, { favorite: !task.favorite });
      setTasks((current) => current.map((item) => item.id === response.data.id ? response.data : item));
      notify("success", response.data.favorite ? "Adicionada aos favoritos" : "Removida dos favoritos"); return { ok: true, data: response.data };
    } catch (requestError) { const result = failed(requestError, "Não foi possível atualizar os favoritos."); notify("error", result.error); return result;
    } finally { setBusy(key, false); }
  }

  async function removeTask(task) {
    const key = `delete-${task.id}`; setBusy(key, true);
    try { await api.delete(`/tasks/${task.id}`); setTasks((current) => current.filter((item) => item.id !== task.id)); notify("success", "Tarefa excluída"); return { ok: true };
    } catch (requestError) { const result = failed(requestError, "Não foi possível excluir a tarefa."); notify("error", result.error); return result;
    } finally { setBusy(key, false); }
  }

  function editTask(task) { setEditingTask(task); }

  async function updateTask(updatedTask) {
    const key = `update-${updatedTask.id}`; setBusy(key, true);
    try {
      const response = await api.patch(`/tasks/${updatedTask.id}`, { title: updatedTask.title, description: updatedTask.description, category: updatedTask.category, priority: updatedTask.priority });
      setTasks((current) => current.map((task) => task.id === response.data.id ? response.data : task)); notify("success", "Tarefa atualizada"); return { ok: true, data: response.data };
    } catch (requestError) { const result = failed(requestError, "Não foi possível editar a tarefa."); notify("error", result.error); return result;
    } finally { setBusy(key, false); }
  }

  async function handleTaskCompletion(task) {
    const key = `complete-${task.id}`; setBusy(key, true);
    try {
      const response = await api.patch(`/tasks/${task.id}/completed`, { completed: !task.completed });
      setTasks((current) => current.map((item) => item.id === response.data.id ? response.data : item)); notify("success", response.data.completed ? "Tarefa concluída" : "Tarefa marcada como pendente"); return { ok: true, data: response.data };
    } catch (requestError) { const result = failed(requestError, "Não foi possível atualizar a tarefa."); notify("error", result.error); return result;
    } finally { setBusy(key, false); }
  }

  const themes = () => document.body.classList.toggle("theme");
  return <TaskContext.Provider value={{ tasks, loading, error, setError, feedback, setFeedback, isBusy: (key) => Boolean(pending[key]), addTask, addfavorite, removeTask, pendentes, concluidas, favoritas, themes, handleTaskCompletion, filtro, setFiltro, tarefasFiltradas, editTask, editingTask, setEditingTask, updateTask }}>{children}</TaskContext.Provider>;
};
