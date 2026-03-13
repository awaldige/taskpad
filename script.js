let tasks = JSON.parse(localStorage.getItem("taskpad")) || [];

function save(){
localStorage.setItem("taskpad",JSON.stringify(tasks));
render();
}

function render(){

const todo=document.getElementById("todo-list");
const done=document.getElementById("done-list");

todo.innerHTML="";
done.innerHTML="";

tasks.forEach(task=>{

const div=document.createElement("div");

div.className="card";

div.innerHTML=`
<strong>${task.title}</strong>
<br>
<button onclick="toggle('${task.id}')">
${task.status==="done"?"Refazer":"Concluir"}
</button>
`;

(task.status==="todo"?todo:done).appendChild(div);

});

}

function toggle(id){

const task=tasks.find(t=>t.id===id);

task.status=task.status==="todo"?"done":"todo";

save();

}

document.getElementById("new-task").onclick=()=>{

const title=prompt("Nova tarefa");

if(!title) return;

tasks.push({

id:Date.now().toString(),
title,
status:"todo"

});

save();

}

render();
