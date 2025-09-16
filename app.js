// Obtener elementos
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const completedList = document.getElementById("completedList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilterType = "all";
let currentFilterPriority = "all";
let currentSortDate = "none";

// Guardar en localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Función para renderizar tareas
function renderTasks() {
  taskList.innerHTML = "";
  completedList.innerHTML = "";

  let filteredTasks = tasks.filter((t) => {
    const matchType =
      currentFilterType === "all" || t.subjectType === currentFilterType;
    const matchPriority =
      currentFilterPriority === "all" || t.priority === currentFilterPriority;
    return matchType && matchPriority;
  });

  // Ordenar
  if (currentSortDate !== "none") {
    filteredTasks.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : null;
      const dateB = b.dueDate ? new Date(b.dueDate) : null;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return currentSortDate === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  // Renderizar pendientes y completadas en secciones distintas
  filteredTasks.forEach((t, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
      <div>
        <h3 class="${t.completed ? "completed" : ""}">${escapeHtml(t.title)}</h3>
        <div class="task-meta">
          <span class="badge ${t.priority}">${capitalize(t.priority)}</span>
          <span>${escapeHtml(t.course)}</span>
          <span class="badge type-${t.subjectType}">
            ${t.subjectType === "electiva" ? "Electiva" : "Pénsum"}
          </span>
          ${t.dueDate ? `<span>Vence: ${formatDate(t.dueDate)}</span>` : ""}
          ${t.notes ? `<span title="${escapeHtml(t.notes)}">Notas</span>` : ""}
        </div>
      </div>
      <div class="task-actions">
        <button data-index="${index}" class="complete-btn">
          ${t.completed ? "✔️ Hecha" : "✅ Completar"}
        </button>
        <button data-index="${index}" class="delete-btn">🗑 Eliminar</button>
      </div>
    `;

    if (t.completed) {
      completedList.appendChild(li);
    } else {
      taskList.appendChild(li);
    }
  });

  // Eventos completar
  document.querySelectorAll(".complete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const i = e.target.dataset.index;
      tasks[i].completed = !tasks[i].completed;
      saveTasks();
      renderTasks();
    });
  });

  // Eventos eliminar
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const i = e.target.dataset.index;
      tasks.splice(i, 1);
      saveTasks();
      renderTasks();
    });
  });
}

// Evento submit
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleInput = document.getElementById("title");
  const courseInput = document.getElementById("course");
  const dueInput = document.getElementById("due");
  const priorityInput = document.getElementById("priority");
  const notesInput = document.getElementById("notes");
  const subjectTypeInput = document.getElementById("subjectType");

  const payload = {
    title: titleInput.value.trim(),
    course: courseInput.value.trim(),
    dueDate: dueInput.value || "",
    priority: priorityInput.value,
    notes: notesInput.value.trim(),
    subjectType: subjectTypeInput.value,
    completed: false,
  };

  tasks.push(payload);
  saveTasks();
  renderTasks();
  taskForm.reset();
});

// Filtros
document.getElementById("filterType").addEventListener("change", (e) => {
  currentFilterType = e.target.value;
  renderTasks();
});

document.getElementById("filterPriority").addEventListener("change", (e) => {
  currentFilterPriority = e.target.value;
  renderTasks();
});

document.getElementById("sortDate").addEventListener("change", (e) => {
  currentSortDate = e.target.value;
  renderTasks();
});

// Utilidades
function formatDate(date) {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Inicializar
renderTasks();
