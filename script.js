let tasks = JSON.parse(localStorage.getItem("taskpad")) || [];

let tempSubtasks=[];

const modal = document.getElementById("task-modal");

const taskForm = document.getElementById("task-form");

/* THEME */

const themeToggle = document.getElementById("theme-toggle");

themeToggle.onclick=()=>{

const current=document.body.getAttribute("data-theme");

document.body.setAttribute(
"data-theme",
current==="dark"?"light":"dark"
);

};

/* SAVE */

function save(){

localStorage.setItem("taskpad",JSON.stringify(tasks));

render();

}

/* SUBTAREFAS FORM */

function renderSubtasksForm(){

const list=document.getElementById("subtasks-list");

list.innerHTML="";

tempSubtasks.forEach((sub,i)=>{

const div=document.createElement("div");

div.className="subtask-item";

div.innerHTML=`
<span>${sub.text}</span>
<button onclick="removeTempSub(${i})">❌</button>
`;

list.appendChild(div);

});

}

document.getElementById("add-subtask").onclick=()=>{

const input=document.getElementById("new-subtask");

const text=input.value.trim();

if(!text) return;

tempSubtasks.push({
id:Date.now(),
text,
done:false
});

input.value="";

renderSubtasksForm();

};

function removeTempSub(i){

tempSubtasks.splice(i,1);

renderSubtasksForm();

}

/* RENDER */

function render(){

const todo=document.getElementById("todo-list");

const done=document.getElementById("done-list");

todo.innerHTML="";
done.innerHTML="";

tasks.forEach(task=>{

const li=document.createElement("li");

li.className="card";

li.style.borderColor=`var(--${task.priority})`;

li.innerHTML=`

<h3>${task.title}</h3>

${task.subtasks.map(s=>

`<div class="sub-item ${s.done?"done":""}"
onclick="toggleSub('${task.id}',${s.id})">

${s.done?"✅":"⬜"} ${s.text}

</div>`

).join("")}

<div class="card-actions">

<div class="card-buttons">

<button class="btn-icon"
onclick="editTask('${task.id}')">✏️</button>

<button class="btn-icon"
onclick="deleteTask('${task.id}')">🗑</button>

</div>

<button class="btn-check"
onclick="toggleStatus('${task.id}')">

${task.status==="done"?"Refazer":"Concluir"}

</button>

</div>

`;

(task.status==="todo"?todo:done).appendChild(li);

});

document.getElementById("count-todo").innerText=
tasks.filter(t=>t.status==="todo").length;

document.getElementById("count-done").innerText=
tasks.filter(t=>t.status==="done").length;

}

/* CRUD */

function toggleStatus(id){

const task=tasks.find(t=>t.id===id);

task.status=task.status==="todo"?"done":"todo";

save();

}

function deleteTask(id){

if(!confirm("Excluir tarefa?")) return;

tasks=tasks.filter(t=>t.id!==id);

save();

}

function toggleSub(taskId,subId){

const task=tasks.find(t=>t.id===taskId);

const sub=task.subtasks.find(s=>s.id===subId);

sub.done=!sub.done;

save();

}

/* EDIT */

function editTask(id){

const task=tasks.find(t=>t.id===id);

document.getElementById("task-id").value=task.id;

document.getElementById("task-title").value=task.title;

document.getElementById("task-priority").value=task.priority;

document.getElementById("task-deadline").value=task.deadline||"";

tempSubtasks=[...task.subtasks];

renderSubtasksForm();

modal.classList.add("active");

}

/* MODAL */

document.getElementById("open-modal").onclick=()=>{

taskForm.reset();

document.getElementById("task-id").value="";

tempSubtasks=[];

renderSubtasksForm();

modal.classList.add("active");

};

document.getElementById("close-modal").onclick=
document.getElementById("close-modal-x").onclick=
()=> modal.classList.remove("active");

/* FORM */

taskForm.onsubmit=e=>{

e.preventDefault();

const id=document.getElementById("task-id").value;

const data={
title:document.getElementById("task-title").value,
priority:document.getElementById("task-priority").value,
deadline:document.getElementById("task-deadline").value
};

if(id){

const task=tasks.find(t=>t.id===id);

Object.assign(task,data);

task.subtasks=[...tempSubtasks];

}else{

tasks.push({
...data,
id:Date.now().toString(),
status:"todo",
subtasks:[...tempSubtasks]
});

}

modal.classList.remove("active");

tempSubtasks=[];

save();

};

render();
