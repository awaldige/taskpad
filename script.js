let tasks = JSON.parse(localStorage.getItem('taskpad_pro_final')) || [];

let searchTerm = "";

const modal = document.getElementById('task-modal');

const taskForm = document.getElementById('task-form');

const subSection = document.getElementById('subtasks-edit-section');

const subEditorList = document.getElementById('subtasks-editor-list');

/* TEMA */

const themeToggle = document.getElementById('theme-toggle');

const savedTheme = localStorage.getItem('theme') || 'light';

document.body.setAttribute('data-theme', savedTheme);

themeToggle.innerText = savedTheme === 'dark' ? '☀️' : '🌓';

themeToggle.onclick = () => {

const newTheme =
document.body.getAttribute('data-theme') === 'dark'
? 'light'
: 'dark';

document.body.setAttribute('data-theme', newTheme);

localStorage.setItem('theme', newTheme);

themeToggle.innerText =
newTheme === 'dark'
? '☀️'
: '🌓';

};

/* SAVE */

function save(){

localStorage.setItem('taskpad_pro_final', JSON.stringify(tasks));

render();

}

/* RENDER */

function render(){

const lists = {
todo: document.getElementById('todo-list'),
done: document.getElementById('done-list')
};

lists.todo.innerHTML="";
lists.done.innerHTML="";

let filtered = tasks.filter(t =>
t.title.toLowerCase().includes(searchTerm.toLowerCase())
);

/* ORDENAR */

const order = {high:1,medium:2,low:3};

filtered.sort((a,b)=>{

if(order[a.priority]!==order[b.priority])
return order[a.priority]-order[b.priority];

if(a.deadline && b.deadline)
return new Date(a.deadline)-new Date(b.deadline);

return 0;

});

if(filtered.length===0){

lists.todo.innerHTML="<p style='opacity:.6'>Nenhuma tarefa encontrada</p>";

}

filtered.forEach(task=>{

const progress = calculateProgress(task.subtasks);

const isOverdue =
task.deadline &&
new Date(task.deadline) < new Date().setHours(0,0,0,0) &&
task.status==="todo";

const card=document.createElement('li');

card.className=`card ${isOverdue?'overdue':''}`;

card.style.borderLeftColor=`var(--${task.priority})`;

card.innerHTML=`

<div onclick="editTask('${task.id}')" style="cursor:pointer">

<strong>${task.title}</strong>

${isOverdue?'<br><span class="overdue-label">⚠️ ATRASADA</span>':''}

<div style="font-size:.7rem;color:var(--text-gray)">
${progress}% concluído
</div>

<div class="progress-container">
<div class="progress-bar" style="width:${progress}%"></div>
</div>

</div>

<div class="subs">

${task.subtasks.map(s=>`

<div class="sub-item ${s.done?'checked':''}"
onclick="toggleSub('${task.id}',${s.id})">

${s.done?'✅':'⬜'} ${s.text}

</div>

`).join('')}

<button onclick="addSubDirect('${task.id}')"
style="background:none;border:1px dashed var(--border);width:100%;padding:5px;margin-top:5px;border-radius:5px;cursor:pointer;color:var(--text-gray);font-size:.75rem">

+ Rápido

</button>

</div>

<div class="card-actions">

<div style="display:flex;gap:10px">

<button class="btn-icon"
onclick="editTask('${task.id}')">✏️</button>

<button class="btn-icon"
onclick="deleteTask('${task.id}')">🗑️</button>

</div>

<button class="btn-check
${task.status==='done'?'undo':''}"

onclick="toggleStatus('${task.id}')">

${task.status==='done'?'Refazer':'Concluir'}

</button>

</div>
`;

lists[task.status].appendChild(card);

});

updateCounters();

}

const calculateProgress = (subs)=>
subs.length
?Math.round((subs.filter(s=>s.done).length/subs.length)*100)
:0;

/* COUNTERS */

function updateCounters(){

document.getElementById('count-todo').innerText =
tasks.filter(t=>t.status==='todo').length;

document.getElementById('count-done').innerText =
tasks.filter(t=>t.status==='done').length;

}

/* STATUS */

function toggleStatus(id){

const task=tasks.find(t=>t.id===id);

task.status=
task.status==='todo'
?'done'
:'todo';

save();

}

/* SUB */

function addSubDirect(taskId){

const text=prompt("Nome da subtarefa:");

if(text){

tasks.find(t=>t.id===taskId)
.subtasks.push({
id:Date.now(),
text,
done:false
});

save();

}

}

function toggleSub(taskId,subId){

const task=tasks.find(t=>t.id===taskId);

const sub=task.subtasks.find(s=>s.id===subId);

sub.done=!sub.done;

save();

}

/* DELETE */

function deleteTask(id){

if(!confirm("⚠️ Deseja excluir esta tarefa?")) return;

tasks = tasks.filter(t=>t.id!==id);

save();

}

/* BUSCA */

document.getElementById('search-input').oninput = (e)=>{

searchTerm=e.target.value;

render();

};

/* MODAL */

document.getElementById('open-modal').onclick = ()=>{

taskForm.reset();

document.getElementById('task-id').value="";

subSection.style.display='none';

modal.classList.add('active');

};

document.getElementById('close-modal').onclick =
document.getElementById('close-modal-x').onclick =
()=> modal.classList.remove('active');

/* ATALHO */

document.addEventListener("keydown",e=>{

if(e.key==="n" && !modal.classList.contains("active")){

taskForm.reset();

modal.classList.add("active");

}

});

/* INIT */

render();
