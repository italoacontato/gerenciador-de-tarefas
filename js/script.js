
/* ========================================
   ELEMENTOS DO HTML
======================================== */

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskPriority = document.getElementById("task-priority");
const taskDeadline = document.getElementById("task-deadline");
const taskList = document.getElementById("task-list");

const totalTasks = document.getElementById("total-tasks");
const completedTasks = document.getElementById("completed-tasks");
const pendingTasks = document.getElementById("pending-tasks");
const overdueTasks = document.getElementById("overdue-tasks");

const progressPercentage = document.getElementById("progress-percentage");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

const currentDate = document.getElementById("current-date");

/* ELEMENTOS DO MODAL */

const taskModal = document.getElementById("task-modal");
const modalIcon = document.getElementById("modal-icon");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");

const modalInputGroup = document.getElementById("modal-input-group");
const modalPriorityGroup = document.getElementById("modal-priority-group");
const modalDeadlineGroup = document.getElementById("modal-deadline-group");

const modalTaskInput = document.getElementById("modal-task-input");
const modalTaskPriority = document.getElementById("modal-task-priority");
const modalTaskDeadline = document.getElementById("modal-task-deadline");

const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalConfirmBtn = document.getElementById("modal-confirm-btn");


/* ========================================
   DADOS E CONFIGURAÇÕES
======================================== */

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));

    tasks = Array.isArray(savedTasks) ? savedTasks : [];

} catch (error) {
    tasks = [];
}

let currentFilter = "all";
let modalMode = "";
let selectedTaskId = null;


/* ========================================
   SALVAR TAREFAS
======================================== */

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


/* ========================================
   DATA ATUAL
======================================== */

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function updateCurrentDate() {
    if (!currentDate) return;

    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


/* ========================================
   VERIFICAR TAREFA ATRASADA
======================================== */

function isTaskOverdue(task) {
    return (
        task.deadline &&
        task.deadline < getToday() &&
        !task.completed
    );
}


/* ========================================
   ADICIONAR TAREFA
======================================== */

function addTask(event) {
    event.preventDefault();

    const title = taskInput.value.trim();
    const priority = taskPriority.value;
    const deadline = taskDeadline.value;

    if (!title) {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        priority: priority,
        deadline: deadline,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();
    updateDashboard();

    taskForm.reset();
    taskInput.focus();
}


/* ========================================
   FORMATAR PRIORIDADE
======================================== */

function formatPriority(priority) {
    const priorities = {
        alta: "Alta",
        media: "Média",
        baixa: "Baixa"
    };

    return priorities[priority] || priority;
}


/* ========================================
   FORMATAR DATA
======================================== */

function formatDate(date) {
    if (!date) {
        return "Sem prazo definido";
    }

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
}


/* ========================================
   ABRIR MODAL
======================================== */

function openModal() {
    taskModal.classList.add("active");
    taskModal.setAttribute("aria-hidden", "false");
}


/* ========================================
   FECHAR MODAL
======================================== */

function closeModal() {
    taskModal.classList.remove("active");
    taskModal.setAttribute("aria-hidden", "true");

    modalTaskInput.value = "";
    modalTaskDeadline.value = "";
    modalTaskPriority.value = "alta";

    modalMode = "";
    selectedTaskId = null;
}


/* ========================================
   EDITAR TAREFA
======================================== */

function editTask(id) {
    const task = tasks.find(
        task => task.id === Number(id)
    );

    if (!task) return;

    modalMode = "edit";
    selectedTaskId = task.id;

    modalTitle.textContent = "Editar tarefa";
    modalMessage.textContent = "Altere os dados da sua tarefa.";

    modalIcon.classList.remove("delete");
    modalIcon.innerHTML = '<i class="bi bi-pencil-square"></i>';

    modalInputGroup.style.display = "flex";
    modalPriorityGroup.style.display = "flex";
    modalDeadlineGroup.style.display = "flex";

    modalTaskInput.value = task.title;
    modalTaskPriority.value = task.priority || "media";
    modalTaskDeadline.value = task.deadline || "";

    modalConfirmBtn.textContent = "Salvar alterações";

    openModal();
    modalTaskInput.focus();
}


/* ========================================
   EXCLUIR TAREFA
======================================== */

function deleteTask(id) {
    const task = tasks.find(
        task => task.id === Number(id)
    );

    if (!task) return;

    modalMode = "delete";
    selectedTaskId = task.id;

    modalTitle.textContent = "Excluir tarefa";

    modalMessage.textContent =
        "Tem certeza de que deseja excluir esta tarefa? Essa ação não poderá ser desfeita.";

    modalIcon.classList.add("delete");
    modalIcon.innerHTML = '<i class="bi bi-trash"></i>';

    modalInputGroup.style.display = "none";
    modalPriorityGroup.style.display = "none";
    modalDeadlineGroup.style.display = "none";

    modalConfirmBtn.textContent = "Excluir tarefa";

    openModal();
}


/* ========================================
   CONFIRMAR AÇÃO DO MODAL
======================================== */

function confirmModalAction() {

    if (modalMode === "edit") {

        const title = modalTaskInput.value.trim();

        if (!title) {
            modalTaskInput.focus();
            return;
        }

        const task = tasks.find(
            task => task.id === selectedTaskId
        );

        if (!task) return;

        task.title = title;
        task.priority = modalTaskPriority.value;
        task.deadline = modalTaskDeadline.value;

    } else if (modalMode === "delete") {

        tasks = tasks.filter(
            task => task.id !== selectedTaskId
        );

    } else {
        return;
    }

    saveTasks();
    renderTasks();
    updateDashboard();

    closeModal();
}


/* ========================================
   CONCLUIR OU REABRIR TAREFA
======================================== */

function toggleTask(id) {
    const task = tasks.find(
        task => task.id === Number(id)
    );

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
    updateDashboard();
}


/* ========================================
   FILTRAR TAREFAS
======================================== */

function filterTasks(filter) {
    currentFilter = filter;

    document.querySelectorAll("[data-filter]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );
    });

    renderTasks();
}


/* ========================================
   ATUALIZAR PAINEL
======================================== */

function updateDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = tasks.filter(
        task => !task.completed
    ).length;

    const overdue = tasks.filter(
        task => isTaskOverdue(task)
    ).length;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    overdueTasks.textContent = overdue;

    progressPercentage.textContent = `${percentage}%`;
    progressFill.style.width = `${percentage}%`;

    progressText.textContent =
        `${completed} de ${total} tarefas concluídas`;
}


/* ========================================
   PROTEGER TEXTO INSERIDO PELO USUÁRIO
======================================== */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


/* ========================================
   MOSTRAR TAREFAS
======================================== */

function renderTasks() {

    let filteredTasks = [...tasks];

    if (currentFilter === "pending") {
        filteredTasks = filteredTasks.filter(
            task => !task.completed
        );
    }

    if (currentFilter === "completed") {
        filteredTasks = filteredTasks.filter(
            task => task.completed
        );
    }

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-message">
                <i class="bi bi-clipboard-x"></i>
                <p>Nenhuma tarefa encontrada.</p>
            </div>
        `;

        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {

        const overdue = isTaskOverdue(task);

        return `
            <div class="task-item ${overdue ? "is-overdue" : ""} ${task.completed ? "completed" : ""}">

                <div class="task-info">

                    <label class="task-label">

                        <input
                            type="checkbox"
                            class="task-checkbox"
                            ${task.completed ? "checked" : ""}
                            onchange="toggleTask(${Number(task.id)})"
                        >

                        <span class="task-title">
                            ${escapeHTML(task.title)}
                        </span>

                    </label>

                    ${overdue ? `
                        <span class="overdue-alert">
                            <i class="bi bi-exclamation-circle"></i>
                            ATRASADA
                        </span>
                    ` : ""}

                    <div class="task-details">

                        <span class="task-priority priority-${escapeHTML(task.priority)}">
                            ${formatPriority(task.priority)}
                        </span>

                        <span class="task-deadline ${overdue ? "is-overdue" : ""}">

                            <i class="bi bi-calendar"></i>

                            ${formatDate(task.deadline)}

                        </span>

                    </div>

                </div>

                <div class="task-actions">

                    <button
                        type="button"
                        class="edit-task-btn"
                        onclick="editTask(${Number(task.id)})"
                        aria-label="Editar tarefa"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="delete-task-btn"
                        onclick="deleteTask(${Number(task.id)})"
                        aria-label="Excluir tarefa"
                    >
                        <i class="bi bi-trash"></i>
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


/* ========================================
   EVENTOS DO MODAL
======================================== */

modalCancelBtn.addEventListener("click", closeModal);

modalConfirmBtn.addEventListener("click", confirmModalAction);

taskModal.addEventListener("click", event => {

    if (event.target === taskModal) {
        closeModal();
    }

});

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        taskModal.classList.contains("active")
    ) {
        closeModal();
    }

    if (
        event.key === "Enter" &&
        modalMode === "edit" &&
        taskModal.classList.contains("active") &&
        event.target === modalTaskInput
    ) {
        confirmModalAction();
    }

});


/* ========================================
   EVENTOS DOS FILTROS
======================================== */

document.querySelectorAll("[data-filter]").forEach(button => {

    button.addEventListener("click", () => {
        filterTasks(button.dataset.filter);
    });

});


/* ========================================
   EVENTO DO FORMULÁRIO
======================================== */

taskForm.addEventListener("submit", addTask);


/* ========================================
   INICIALIZAÇÃO
======================================== */

updateCurrentDate();
renderTasks();
updateDashboard();



/* ========================================
   ALTERNAR TEMA CLARO E ESCURO
======================================== */

const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);

    if (theme === "dark") {
        themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';

        themeToggle.setAttribute(
            "aria-label",
            "Ativar tema claro"
        );
    } else {
        themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';

        themeToggle.setAttribute(
            "aria-label",
            "Ativar tema escuro"
        );
    }
}

// Carregar tema salvo
const savedTheme = localStorage.getItem("theme") || "light";

applyTheme(savedTheme);

// Alternar tema ao clicar
themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");

    const newTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(newTheme);

    localStorage.setItem("theme", newTheme);
});

/* ========================================
   ATUALIZAR ANO DO RODAPÉ
======================================== */

const currentYear = document.getElementById("current-year");

currentYear.textContent = new Date().getFullYear();
