
/* ========================================
   ELEMENTOS DO HTML
======================================== */

const taskForm = document.getElementById("task-form");

const taskInput = document.getElementById("task-input");

const taskPriority = document.getElementById("task-priority");

const taskDeadline = document.getElementById("task-deadline");

const taskList = document.getElementById("task-list");

const filterButtons = document.querySelectorAll(".filter-btn");

// Cartões de resumo
const totalTasks = document.getElementById("total-tasks");

const completedTasks = document.getElementById("completed-tasks");

const pendingTasks = document.getElementById("pending-tasks");

const overdueTasks = document.getElementById("overdue-tasks");

// Barra de progresso
const progressPercentage = document.getElementById("progress-percentage");

const progressFill = document.getElementById("progress-fill");

const progressText = document.getElementById("progress-text");


/* ========================================
   ARMAZENAMENTO DAS TAREFAS
======================================== */

// Recupera as tarefas salvas no navegador
let tasks = [];

try {

    const savedTasks = localStorage.getItem("tasks");

    tasks = savedTasks ? JSON.parse(savedTasks) : [];

    // Garante que os dados recuperados sejam um array
    if (!Array.isArray(tasks)) {
        tasks = [];
    }

} catch (error) {

    console.error("Erro ao recuperar tarefas:", error);

    tasks = [];

}

// Filtro atual
let currentFilter = "all";


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


/* ========================================
   ADICIONAR TAREFAS
======================================== */

function addTask(event) {
    event.preventDefault();

    const title = taskInput.value.trim();
    const priority = taskPriority.value;
    const deadline = taskDeadline.value;

    if (title === "") {
        alert("Por favor, digite o nome da tarefa.");
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

    // Limpa os campos após adicionar a tarefa
    taskForm.reset();

    // Deixa o cursor novamente no campo de tarefa
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
   EDITAR TAREFAS
======================================== */

function editTask(id) {

    const task = tasks.find(function (item) {

        return item.id === id;

    });

    if (!task) return;

    const newTitle = prompt(
        "Digite o novo nome da tarefa:",
        task.title
    );

    if (newTitle === null) return;

    if (newTitle.trim() === "") {

        alert("O nome da tarefa não pode ficar vazio.");

        return;

    }

    task.title = newTitle.trim();

    saveTasks();

    renderTasks();

    updateDashboard();

}


/* ========================================
   EXCLUIR TAREFAS
======================================== */

function deleteTask(id) {

    const task = tasks.find(function (item) {

        return item.id === id;

    });

    if (!task) return;

    const confirmation = confirm(
        `Deseja realmente excluir a tarefa "${task.title}"?`
    );

    if (!confirmation) return;

    tasks = tasks.filter(function (item) {

        return item.id !== id;

    });

    saveTasks();

    renderTasks();

    updateDashboard();

}


/* ========================================
   CONCLUIR TAREFAS
======================================== */

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
    updateDashboard();
}


/* ========================================
   FILTRAR TAREFAS
======================================== */

function filterTasks(filter) {

    currentFilter = filter;

    filterButtons.forEach(function (button) {

        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );

    });

    renderTasks();

}


/* ========================================
   ATUALIZAR PAINEL DE RESUMO
======================================== */

function updateDashboard() {
    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    const today = getToday();

    const overdue = tasks.filter(task => {
        return !task.completed &&
            task.deadline !== "" &&
            task.deadline < today;
    }).length;

    // Atualiza os cartões
    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
    overdueTasks.textContent = overdue;

    // Calcula o progresso
    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressPercentage.textContent = `${percentage}%`;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${completed} de ${total} tarefas concluídas`;
}


/* ========================================
   EXIBIR TAREFAS NA TELA
======================================== */

function renderTasks() {

    taskList.innerHTML = "";

    // Aplica os filtros
    const filteredTasks = tasks.filter(function (task) {

        if (currentFilter === "pending") {

            return !task.completed;

        }

        if (currentFilter === "completed") {

            return task.completed;

        }

        return true;

    });


    // Verifica se existem tarefas
    if (filteredTasks.length === 0) {

        const emptyMessage = document.createElement("div");

        emptyMessage.className = "empty-message";

        const icon = document.createElement("i");

        const paragraph = document.createElement("p");


        if (tasks.length === 0) {

            icon.className = "bi bi-clipboard-x";

            paragraph.textContent =
                "Nenhuma tarefa cadastrada.";

        } else if (currentFilter === "pending") {

            icon.className = "bi bi-check-circle";

            paragraph.textContent =
                "Nenhuma tarefa pendente.";

        } else if (currentFilter === "completed") {

            icon.className = "bi bi-clipboard-check";

            paragraph.textContent =
                "Nenhuma tarefa concluída.";

        }


        emptyMessage.appendChild(icon);

        emptyMessage.appendChild(paragraph);

        taskList.appendChild(emptyMessage);

        return;

    }


    // Percorre as tarefas
    filteredTasks.forEach(function (task) {

        const taskItem = document.createElement("div");

        taskItem.className = "task-item";


        if (task.completed) {

            taskItem.classList.add("completed");

        }


        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.className = "task-checkbox";

        checkbox.checked = task.completed;

        checkbox.setAttribute(
            "aria-label",
            "Marcar tarefa como concluída"
        );

        checkbox.addEventListener("change", function () {

            toggleTask(task.id);

        });


        // Nome
        const taskTitle = document.createElement("h3");

        taskTitle.className = "task-title";

        taskTitle.textContent = task.title;


        // Prioridade
        const taskPriorityElement = document.createElement("span");

        taskPriorityElement.className =
            `task-priority priority-${task.priority}`;

        taskPriorityElement.textContent =
            formatPriority(task.priority);


        // Prazo
        const taskDeadlineElement = document.createElement("span");

        taskDeadlineElement.className = "task-deadline";

        taskDeadlineElement.textContent =
            formatDate(task.deadline);


        // Ações
        const taskActions = document.createElement("div");

        taskActions.className = "task-actions";


        // Botão editar
        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.className = "edit-task-btn";

        editButton.innerHTML =
            '<i class="bi bi-pencil-fill"></i>';

        editButton.title = "Editar tarefa";

        editButton.addEventListener("click", function () {

            editTask(task.id);

        });


        // Botão excluir
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className = "delete-task-btn";

        deleteButton.innerHTML =
            '<i class="bi bi-trash-fill"></i>';

        deleteButton.title = "Excluir tarefa";

        deleteButton.addEventListener("click", function () {

            deleteTask(task.id);

        });


        // Organiza os botões
        taskActions.appendChild(editButton);

        taskActions.appendChild(deleteButton);


        // Monta o cartão
        taskItem.appendChild(checkbox);

        taskItem.appendChild(taskTitle);

        taskItem.appendChild(taskPriorityElement);

        taskItem.appendChild(taskDeadlineElement);

        taskItem.appendChild(taskActions);


        // Adiciona à lista
        taskList.appendChild(taskItem);

    });

}


/* ========================================
   EVENTOS DOS FILTROS
======================================== */

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        filterTasks(button.dataset.filter);

    });

});


/* ========================================
   EVENTO DO FORMULÁRIO
======================================== */

taskForm.addEventListener("submit", addTask);


/* ========================================
   INICIALIZAÇÃO DO SISTEMA
======================================== */

// Exibe as tarefas salvas
renderTasks();

// Atualiza os cartões e o progresso
updateDashboard();
