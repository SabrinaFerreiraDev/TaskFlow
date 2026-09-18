import { useContext, useEffect, useState } from "react";
import "./App.css";
import { TaskContext } from "./contexts/TaskContext.jsx";

function MessageList({ messages }) {
  const items = Array.isArray(messages) ? messages : [messages];
  return items.length > 1 ? <ul>{items.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}</ul> : <span>{items[0]}</span>;
}

function FeedbackToast() {
  const { feedback, setFeedback } = useContext(TaskContext);
  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(null), feedback.type === "error" ? 6500 : 3500);
    return () => window.clearTimeout(timeout);
  }, [feedback, setFeedback]);
  if (!feedback) return null;
  return <div className={`toast toast-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
    <span className="toast-icon" aria-hidden="true">{feedback.type === "error" ? "!" : "✓"}</span>
    <MessageList messages={feedback.message} />
    <button type="button" onClick={() => setFeedback(null)} aria-label="Fechar notificação">×</button>
  </div>;
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
    </span>
  );
}

function Header({ onFavorites }) {
  const { favoritas, themes } = useContext(TaskContext);
  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="TaskFlow início">
        <BrandMark />
        <span>
          Task<span>Flow</span>
        </span>
      </a>
      <nav className="main-nav" aria-label="Navegação principal">
        <a className="active" href="#tasks">
          Tarefas
        </a>
      </nav>
      <div className="header-actions">
        <button
          className="icon-button theme-button"
          type="button"
          aria-label="Alternar tema"
          title="Alternar tema"
          onClick={themes}
        >
          ◐
        </button>
        <button
          className="favorites-button"
          type="button"
          aria-label="Ver favoritas"
          onClick={onFavorites}
        >
          <span aria-hidden="true">☆</span>
          <span className="favorites-count">{favoritas.length}</span>
        </button>
        <div className="avatar" aria-label="Perfil de Bruna">
          B
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value, detail, icon, accent }) {
  return (
    <article className={`stat-card ${accent}`}>
      <div className="stat-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function Stats() {
  const { tasks, pendentes, concluidas, favoritas } = useContext(TaskContext);
  return (
    <section className="stats-grid" aria-label="Resumo das tarefas">
      <StatCard
        label="Total de tarefas"
        value={tasks.length}
        detail="No seu painel"
        icon="▦"
        accent="coral"
      />
      <StatCard
        label="Pendentes"
        value={pendentes.length}
        detail={`${tasks.length ? Math.round((pendentes.length / tasks.length) * 100) : 0}% do total`}
        icon="◷"
        accent="yellow"
      />
      <StatCard
        label="Concluídas"
        value={concluidas.length}
        detail={`${tasks.length ? Math.round((concluidas.length / tasks.length) * 100) : 0}%`}
        icon="✓"
        accent="mint"
      />
      <StatCard
        label="Favoritas"
        value={favoritas.length}
        detail="Para dar atenção"
        icon="☆"
        accent="blue"
      />
    </section>
  );
}

function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Estudos");
  const [priority, setPriority] = useState("Média");
  const { addTask, isBusy } = useContext(TaskContext);
  const [formError, setFormError] = useState("");

  async function handleAddTask() {
    const newTask = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
    };

    const result = await addTask(newTask);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setTitle("");
    setDescription("");
    setCategory("Estudos");
    setPriority("Média");
    setFormError("");
  }

  return (
    <section className="task-form panel" aria-labelledby="new-task-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Organize seu próximo passo</span>
          <h2 id="new-task-title">Nova tarefa</h2>
        </div>
        <span className="form-step">
          01 <i /> 02
        </span>
      </div>
      <div className="form-grid">
        <label className="field field-title">
          <span>Título da tarefa</span>
          <input
            type="text"
            maxLength={50}
            value={title}
            placeholder="Ex: estudar React"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="field field-description">
          <span>
            Descrição <em>Opcional</em>
          </span>
          <input
            type="text"
            maxLength={30}
            value={description}
            placeholder="Adicione mais detalhes para sua tarefa"
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Prioridade</span>
          <select
            value={priority}
            aria-label="Prioridade"
            onChange={(event) => setPriority(event.target.value)}
          >
            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
          </select>
        </label>
        <label className="field">
          <span>Categoria</span>
          <select
            value={category}
            aria-label="Categoria"
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>Estudos</option>
            <option>React</option>
            <option>Prática</option>
          </select>
        </label>
      </div>
      {formError && <p className="form-error" role="alert"><MessageList messages={formError} /></p>}
      <button className="primary-button" type="button" onClick={handleAddTask} disabled={isBusy("create")}>
        <span>{isBusy("create") ? "…" : "+"}</span> {isBusy("create") ? "Criando…" : "Adicionar tarefa"}
      </button>
    </section>
  );
}
function EditTaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [category, setCategory] = useState(task.category);
  const [priority, setPriority] = useState(task.priority);
  const [formError, setFormError] = useState("");

  const { isBusy } = useContext(TaskContext);

  async function handleUpdateTask() {
    const updatedTask = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
    };

    const result = await onSave(updatedTask);
    if (!result.ok) setFormError(result.error);
  }

  return (
    <div className="edit-modal">
      <section
        className="task-form panel edit-form"
        aria-labelledby="edit-task-title"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">Atualize seu próximo passo</span>

            <h2 id="edit-task-title">Editar tarefa</h2>
          </div>

          <button
            className="close-button"
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            ×
          </button>
        </div>

        <div className="form-grid">
          <label className="field field-title">
            <span>Título da tarefa</span>

            <input
              type="text"
              maxLength={50}
              value={title}
              placeholder="Ex: estudar React"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="field field-description">
            <span>
              Descrição <em>Opcional</em>
            </span>

            <input
              type="text"
              maxLength={30}
              value={description}
              placeholder="Adicione mais detalhes para sua tarefa"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Prioridade</span>

            <select
              value={priority}
              aria-label="Prioridade"
              onChange={(event) => setPriority(event.target.value)}
            >
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
            </select>
          </label>

          <label className="field">
            <span>Categoria</span>

            <select
              value={category}
              aria-label="Categoria"
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Estudos</option>
              <option>React</option>
              <option>Prática</option>
            </select>
          </label>
        </div>
        {formError && <p className="form-error" role="alert"><MessageList messages={formError} /></p>}

        <div className="edit-form-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={handleUpdateTask}
            disabled={isBusy(`update-${task.id}`)}
          >
            Salvar alterações
          </button>
        </div>
      </section>
    </div>
  );
}

function TaskFilters({ searchTerm, onSearchChange }) {
  // const { pendentesTask, pendentes, concluidas, favoritas, tasks} = useContext(TaskContext);
  const { tasks, pendentes, concluidas, favoritas, setFiltro, filtro } =
    useContext(TaskContext);

  return (
    <section className="filters-row" aria-label="Filtros de tarefas">
      <div className="filter-tabs">
        <button
          className={filtro === "todas" ? "selected" : ""}
          type="button"
          onClick={() => setFiltro("todas")}
        >
          Todas <b>{tasks.length}</b>
        </button>
        <button
          type="button"
          onClick={() => setFiltro("pendentes")}
          className={filtro === "pendentes" ? "selected" : ""}
        >
          Pendentes <b>{pendentes.length}</b>
        </button>
        <button
          type="button"
          onClick={() => setFiltro("concluidas")}
          className={filtro === "concluidas" ? "selected" : ""}
        >
          Concluídas <b>{concluidas.length}</b>
        </button>
        <button
          type="button"
          onClick={() => setFiltro("favoritas")}
          className={filtro === "favoritas" ? "selected" : ""}
        >
          Favoritas <b>{favoritas.length}</b>
        </button>
      </div>
      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Buscar tarefas..."
          aria-label="Buscar tarefas"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
    </section>
  );
}

function TaskCard({ task }) {
  const { addfavorite, removeTask, handleTaskCompletion, editTask, isBusy } =
    useContext(TaskContext);
  return (
    <article className={`task-card ${task.completed ? "is-completed" : ""}`}>
      <label className="task-check" aria-label={`Marcar ${task.title}`}>
        <input
          type="checkbox"
          checked={task.completed}
          aria-label={`Concluir ${task.title}`}
          onChange={() => handleTaskCompletion(task)}
          disabled={isBusy(`complete-${task.id}`)}
        />
        <span />
      </label>
      <div className="task-content">
        <div className="task-title-row">
          <h3>{task.title}</h3>
          {task.favorite && (
            <span className="star-filled" aria-label="Favorita">
              ★
            </span>
          )}
        </div>
        <p>{task.description}</p>
        <div className="task-meta">
          <span className="category-tag">{task.category}</span>
          <span className={`priority ${task.priority.toLowerCase()}`}>
            <i /> {task.priority}
          </span>
          <span className="task-date">
            ◷ {new Date(task.createdAt).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
      <div className="task-actions">
        <button
          type="button"
          aria-label={`Editar ${task.title}`}
          onClick={() => editTask(task)}
          title="Editar"
        >
          ↗
        </button>
        <button
          type="button"
          aria-label={`Excluir ${task.title}`}
          title="Excluir"
          onClick={() => removeTask(task)}
          disabled={isBusy(`delete-${task.id}`)}
        >
          ⌫
        </button>
        <button
          className={task.favorite ? "is-favorite" : ""}
          type="button"
          aria-label={`Favoritar ${task.title}`}
          aria-pressed={task.favorite}
          title="Favoritar"
          onClick={() => addfavorite(task)}
          disabled={isBusy(`favorite-${task.id}`)}
        >
          {task.favorite ? "★" : "☆"}
        </button>
      </div>
    </article>
  );
}

function TaskList({ searchTerm, sortNewest, onToggleSort }) {
  const { tarefasFiltradas, editingTask, setEditingTask, updateTask } =
    useContext(TaskContext);
  const visibleTasks = tarefasFiltradas
    .filter((task) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      if (!normalizedSearch) return true;
      return `${task.title} ${task.description} ${task.category}`
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .sort((firstTask, secondTask) => {
      const firstDate = new Date(firstTask.createdAt).getTime();
      const secondDate = new Date(secondTask.createdAt).getTime();
      return sortNewest ? secondDate - firstDate : firstDate - secondDate;
    });

  return (
    <section className="task-list" id="tasks" aria-labelledby="task-list-title">
      <div className="list-heading">
        <div>
          <span className="eyebrow">Visão geral</span>
          <h2 id="task-list-title">Suas tarefas</h2>
        </div>

        <button className="sort-button" type="button" onClick={onToggleSort}>
          {sortNewest ? "Mais recentes" : "Mais antigas"} <span>⌄</span>
        </button>
      </div>

      <div className="tasks-stack">
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {!visibleTasks.length && (
        <section className="filter-empty panel" aria-live="polite">
          <strong>Nenhuma tarefa encontrada</strong>
          <p>Tente outro termo ou selecione um filtro diferente.</p>
        </section>
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={async (updatedTask) => {
            const result = await updateTask(updatedTask);
            if (result.ok) setEditingTask(null);
            return result;
          }}
        />
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <section className="empty-state panel" aria-labelledby="empty-title">
      <div className="empty-illustration" aria-hidden="true">
        <span>✓</span>
      </div>
      <span className="eyebrow">Tudo limpo por aqui</span>
      <h2 id="empty-title">Você ainda não possui tarefas.</h2>
      <p>Comece adicionando uma tarefa para acompanhar seus estudos.</p>
      <button
        className="secondary-button"
        type="button"
        onClick={() => document.querySelector(".task-form input")?.focus()}
      >
        <span>+</span> Criar nova tarefa
      </button>
    </section>
  );
}

function App() {
  const { tasks, concluidas, loading, error, setError, setFiltro } =
    useContext(TaskContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const progress =
    tasks.length > 0 ? (concluidas.length / tasks.length).toFixed(2) * 100 : 0;
  const data = new Date();

  const dataFormatada = data
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();

  return (
    <div className="app-shell" id="top">
      <Header onFavorites={() => setFiltro("favoritas")} />
      <main>
        {error && (
          <div className="error-banner" role="alert">
            <MessageList messages={error} />
            <button type="button" onClick={() => setError("")} aria-label="Fechar mensagem">
              ×
            </button>
          </div>
        )}
        <section className="hero-heading" aria-labelledby="page-title">
          <div>
            <span className="greeting">{dataFormatada}</span>
            <h1 id="page-title">
              Minhas tarefas <span>✦</span>
            </h1>
            <p>Um passo de cada vez. Continue avançando no seu ritmo.</p>
          </div>
          <div className="progress-note">
            <span>Foco da semana</span>
            <strong>{progress}%</strong>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>
        <Stats />
        <TaskForm />
        <TaskFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        {loading ? (
          <section className="loading-state" aria-live="polite">
            <span className="loading-spinner" aria-hidden="true" />
            Carregando suas tarefas...
          </section>
        ) : tasks.length ? (
          <TaskList
            searchTerm={searchTerm}
            sortNewest={sortNewest}
            onToggleSort={() => setSortNewest((current) => !current)}
          />
        ) : (
          <EmptyState />
        )}
      </main>
      <footer>
        <BrandMark /> <span>TaskFlow</span>
        <span className="footer-note">
          Feito para organizar ideias e realizar planos.
        </span>
      </footer>
      <FeedbackToast />
    </div>
  );
}

export default App;
