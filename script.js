// ===============================
// DADOS
// ===============================

let tasks = JSON.parse(localStorage.getItem("taskpad")) || [];

let editing = null;
let subtasksTemp = [];

const modal = document.getElementById("modal");


// ===============================
// SALVAR LOCALSTORAGE
// ===============================

function save() {
  localStorage.setItem("taskpad", JSON.stringify(tasks));
  render();
}


// ===============================
// CALCULAR PROGRESSO
// ===============================

function progress(task) {

  if (!task.subtasks || task.subtasks.length === 0) return 0;

  let done = task.subtasks.filter(s => s.done).length;

  return Math.round((done / task.subtasks.length) * 100);

}


// ===============================
// RENDER TAREFAS
// ===============================

function render() {

  const todo = document.getElementById("todo");
  const done = document.getElementById("done");

  todo.innerHTML = "";
  done.innerHTML = "";

  const filter = document.getElementById("priority-filter").value;

  tasks.forEach(task => {

    if (filter !== "all" && task.priority !== filter) return;

    const card = document.createElement("div");

    card.className = "card";
    card.draggable = true;
    card.dataset.id = task.id;

    const prog = progress(task);

    // verificar atraso
    let overdue = "";

    if (task.deadline) {

      let today = new Date().toISOString().split("T")[0];

      if (task.deadline < today && task.status === "todo") {
        overdue = "overdue";
      }

    }

    card.classList.add(overdue);

    card.innerHTML = `
      <strong>${task.title}</strong>

      <div>Prioridade: ${task.priority}</div>

      ${task.deadline ? `<small>Prazo: ${task.deadline}</small>` : ""}

      <div class="progress">
        <div class="progress-bar" style="width:${prog}%"></div>
      </div>

      <div style="margin-top:8px">
        <button onclick="editTask('${task.id}')">Editar</button>
        <button onclick="deleteTask('${task.id}')">Excluir</button>
      </div>
    `;

    card.addEventListener("dragstart", dragStart);

    if (task.status === "todo") {
      todo.appendChild(card);
    } else {
      done.appendChild(card);
    }

  });

  updateCounts();

  checkTodayDeadlines();

}


// ===============================
// CONTADORES
// ===============================

function updateCounts() {

  const todoCount = tasks.filter(t => t.status === "todo").length;
  const doneCount = tasks.filter(t => t.status === "done").length;

  console.log("Pendentes:", todoCount);
  console.log("Concluídas:", doneCount);

}


// ===============================
// DRAG START
// ===============================

function dragStart(e) {
  e.dataTransfer.setData("id", e.target.dataset.id);
}


// ===============================
// DROP ZONES
// ===============================

document.querySelectorAll(".dropzone").forEach(zone => {

  zone.addEventListener("dragover", e => {
    e.preventDefault();
  });

  zone.addEventListener("drop", e => {

    const id = e.dataTransfer.getData("id");

    const task = tasks.find(t => t.id == id);

    task.status = zone.id === "todo" ? "todo" : "done";

    save();

  });

});


// ===============================
// EXCLUIR
// ===============================

function deleteTask(id) {

  if (!confirm("Excluir tarefa?")) return;

  tasks = tasks.filter(t => t.id != id);

  save();

}


// ===============================
// EDITAR
// ===============================

function editTask(id) {

  const task = tasks.find(t => t.id == id);

  editing = id;

  document.getElementById("task-title").value = task.title;
  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-deadline").value = task.deadline || "";

  subtasksTemp = [...task.subtasks];

  renderSubtasks();

  modal.style.display = "flex";

}


// ===============================
// RENDER SUBTAREFAS
// ===============================

function renderSubtasks() {

  const list = document.getElementById("subtasks");

  list.innerHTML = "";

  subtasksTemp.forEach((s, i) => {

    const div = document.createElement("div");

    div.innerHTML = `
      <input type="checkbox" ${s.done ? "checked" : ""} 
      onclick="toggleSub(${i})">

      ${s.text}

      <button onclick="removeSub(${i})">x</button>
    `;

    list.appendChild(div);

  });

}


// ===============================
// TOGGLE SUBTAREFA
// ===============================

function toggleSub(i) {

  subtasksTemp[i].done = !subtasksTemp[i].done;

  renderSubtasks();

}


// ===============================
// REMOVER SUBTAREFA
// ===============================

function removeSub(i) {

  subtasksTemp.splice(i, 1);

  renderSubtasks();

}


// ===============================
// ADICIONAR SUBTAREFA
// ===============================

document.getElementById("add-sub").addEventListener("click", () => {

  const input = document.getElementById("new-subtask");

  const text = input.value.trim();

  if (!text) return;

  subtasksTemp.push({
    text,
    done: false
  });

  input.value = "";

  renderSubtasks();

});


// ===============================
// NOVA TAREFA
// ===============================

document.getElementById("new-task").addEventListener("click", () => {

  editing = null;

  subtasksTemp = [];

  document.getElementById("task-title").value = "";
  document.getElementById("task-deadline").value = "";

  renderSubtasks();

  modal.style.display = "flex";

});


// ===============================
// SALVAR TAREFA
// ===============================

document.getElementById("save-task").addEventListener("click", () => {

  const title = document.getElementById("task-title").value.trim();

  if (!title) {

    alert("Digite um título");

    return;

  }

  const data = {
    title: title,
    priority: document.getElementById("task-priority").value,
    deadline: document.getElementById("task-deadline").value
  };

  if (editing) {

    const task = tasks.find(t => t.id == editing);

    task.title = data.title;
    task.priority = data.priority;
    task.deadline = data.deadline;
    task.subtasks = subtasksTemp;

  } else {

    tasks.push({
      id: Date.now().toString(),
      title: data.title,
      priority: data.priority,
      deadline: data.deadline,
      status: "todo",
      subtasks: [...subtasksTemp]
    });

  }

  modal.style.display = "none";

  save();

});


// ===============================
// CANCELAR
// ===============================

document.getElementById("cancel-task")
.addEventListener("click", () => {

  modal.style.display = "none";

});


// ===============================
// FILTRO PRIORIDADE
// ===============================

document.getElementById("priority-filter")
.addEventListener("change", render);


// ===============================
// ALERTA PRAZOS HOJE
// ===============================

function checkTodayDeadlines() {

  let today = new Date().toISOString().split("T")[0];

  tasks.forEach(t => {

    if (t.deadline === today && t.status === "todo") {

      console.log("⚠ Tarefa vence hoje:", t.title);

    }

  });

}


// ===============================
// INICIAR
// ===============================

render();
