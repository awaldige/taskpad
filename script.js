let tasks = JSON.parse(localStorage.getItem("taskpad_pro")) || [];

let searchTerm="";

const modal = document.getElementById("task-modal");

const taskForm = document.getElementById("task-form");

const subSection = document.getElementById("subtasks-edit-section");

const subEditorList = document.getElementById("subtasks-editor-list");

/* TEMA */

const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme") || "light";

document.body.setAttribute("data-theme", savedTheme);

themeToggle.onclick=()=>{

const newTheme =
document.body.getAttribute("data-theme")==="dark"
?"light":"dark";

document.body.setAttribute("data-theme",newTheme);

localStorage.setItem("theme",newTheme);

};

/* SAVE */

function save(){

localStorage.setItem("taskpad_pro",JSON.stringify(tasks));

render();

}

/* PROGRESSO */

function calculateProgress(subs){

if(!subs.length) return 0;

return Math.round(
subs.filter(s=>s.done).length / subs.length * 100
);

}

/* RENDER */

function render(){

const todoList = document.getElementById("todo-list");

const doneList = document.getElementById("done-list");

todoList.innerHTML="";
doneList.innerHTML="";

let filtered = tasks.filter(t=>
t.title.toLowerCase().includes(searchTerm.toLowerCase())
);

const order = {high:1,medium:2,low:3};

filtered.sort((a,b)=> order[a.priority]-order[b.priority]);

if(filtered.length===0){

todoList.innerHTML="<p>Nenhuma tarefa</p>";

}

filtered.forEach(task=>{

const progress = calculateProgress(task.subtasks);

const card = document.createElement("li");

card.className="card";

card.style.borderLeftColor=`var(--${task.priority})`;

card.innerHTML=`

<div onclick="editTask('${task.id}')">

<strong>${task.title}</strong>

<div style="font-size:.7rem;color:var(--text-gray)">
${progress}% concluído
</div>

<div class="progress-container">
<div class="progress-bar" style="width:${progress}%"></div>
</div>

</div>

<div>

${task.subtasks.map(s=>

`<div class="sub-item ${s.done?"checked":""}"
onclick="toggleSub('${task.id}',${s.id})">

${s.done?"✅":"⬜"} ${s.text}

</div>`

).join("")}

<button onclick="addSubDirect('${task.id}')">
+ subtarefa
</button>

</div>

<div class="card-actions">

<div class="card-buttons">

<button class="btn-icon"
onclick="editTask('${task.id}')">✏️</button>

<button class="btn-icon"
onclick="deleteTask('${task.id}')">🗑</button>

</div>

<button class="btn-check
${task.status==="done"?"undo":""}"

onclick="toggleStatus('${task.id}')">

${task.status==="done"?"Refazer":"Concluir"}

</button>

</div>

`;

(task.status==="todo"?todoList:doneList)
.appendChild(card);

});

document.getElementById("count-todo").innerText =
tasks.filter(t=>t.status==="todo").length;

document.getElementById("count-done").innerText =
tasks.filter(t=>t.status==="done").length;

}

/* STATUS */

function toggleStatus(id){

const task = tasks.find(t=>t.id===id);

task.status = task.status==="todo"?"done":"todo";

save();

}

/* DELETE */

function deleteTask(id){

if(!confirm("Excluir tarefa?")) return;

tasks = tasks.filter(t=>t.id!==id);

save();

}

/* SUBTAREFAS */

function toggleSub(taskId,subId){

const task = tasks.find(t=>t.id===taskId);

const sub = task.subtasks.find(s=>s.id===subId);

sub.done=!sub.done;

save();

}

function addSubDirect(taskId){

const text = prompt("Nome da subtarefa");

if(!text) return;

tasks.find(t=>t.id===taskId)
.subtasks.push({
id:Date.now(),
text,
done:false
});

save();

}

/* EDITAR */

function editTask(id){

const task = tasks.find(t=>t.id===id);

document.getElementById("task-id").value = task.id;

document.getElementById("task-title").value = task.title;

document.getElementById("task-priority").value = task.priority;

document.getElementById("task-deadline").value = task.deadline||"";

subSection.style.display="block";

renderSubEditor(task);

modal.classList.add("active");

}

function renderSubEditor(task){

subEditorList.innerHTML="";

task.subtasks.forEach(sub=>{

const row = document.createElement("div");

row.className="sub-edit-row";

row.innerHTML=`

<input value="${sub.text}"
onchange="updateSubText('${task.id}',${sub.id},this.value)">

<button onclick="removeSub('${task.id}',${sub.id})">❌</button>

`;

subEditorList.appendChild(row);

});

}

function updateSubText(taskId,subId,text){

const task = tasks.find(t=>t.id===taskId);

const sub = task.subtasks.find(s=>s.id===subId);

sub.text=text;

save();

}

function removeSub(taskId,subId){

const task = tasks.find(t=>t.id===taskId);

task.subtasks = task.subtasks.filter(s=>s.id!==subId);

renderSubEditor(task);

save();

}

/* MODAL */

document.getElementById("open-modal").onclick=()=>{

taskForm.reset();

document.getElementById("task-id").value="";

subSection.style.display="none";

modal.classList.add("active");

};

document.getElementById("close-modal").onclick=
document.getElementById("close-modal-x").onclick=
()=> modal.classList.remove("active");

/* FORM */

taskForm.onsubmit=e=>{

e.preventDefault();

const id = document.getElementById("task-id").value;

const data={

title:document.getElementById("task-title").value,

priority:document.getElementById("task-priority").value,

deadline:document.getElementById("task-deadline").value

};

if(id){

const task = tasks.find(t=>t.id===id);

Object.assign(task,data);

}else{

tasks.push({
...data,
id:Date.now().toString(),
status:"todo",
subtasks:[]
});

}

modal.classList.remove("active");

save();

};

/* BUSCA */

document.getElementById("search-input").oninput=e=>{

searchTerm=e.target.value;

render();

};

/* ATALHO */

document.addEventListener("keydown",e=>{

if(e.key==="n" && !modal.classList.contains("active")){

taskForm.reset();

modal.classList.add("active");

}

});

render();
