let tasks = JSON.parse(localStorage.getItem('taskpad_final')) || [];
let searchTerm = "";

function save() {
    localStorage.setItem('taskpad_final', JSON.stringify(tasks));
    render();
}

function render() {
    const todoList = document.getElementById('todo-list');
    const doneList = document.getElementById('done-list');
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    // Filtrar por busca
    const filteredTasks = tasks.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredTasks.forEach(task => {
        const progress = calculateProgress(task.subtasks);
        
        // Lógica de Atraso: Verifica se a data passou e não está concluída
        const today = new Date().setHours(0,0,0,0);
        const taskDate = task.deadline ? new Date(task.deadline).getTime() : null;
        const isOverdue = taskDate && taskDate < today && task.status === 'todo';
        
        const card = document.createElement('li');
        card.className = `card ${isOverdue ? 'overdue' : ''}`;
        card.style.borderLeftColor = `var(--${task.priority})`;

        card.innerHTML = `
            <div>
                <strong style="font-size: 1.1rem;">${task.title}</strong>
                ${isOverdue ? '<span class="overdue-label">⚠️ ATRASADA</span>' : ''}
                <div style="margin-top: 5px;">
                    ${task.deadline ? `<small style="color:var(--text-gray)">📅 Prazo: ${task.deadline.split('-').reverse().join('/')}</small>` : ''}
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>

            <div class="subs-area">
                ${task.subtasks.map(s => `
                    <div class="sub-item ${s.done ? 'checked' : ''}" onclick="toggleSub('${task.id}', ${s.id})">
                        ${s.done ? '✅' : '⬜'} ${s.text}
                    </div>
                `).join('')}
                <button onclick="addSub('${task.id}')" style="background:none; border:1px dashed #cbd5e0; width:100%; padding:5px; margin-top:5px; border-radius:6px; cursor:pointer; color:var(--text-gray); font-size:0.75rem;">+ Nova Subtarefa</button>
            </div>

            <div class="card-actions">
                <div>
                    <button class="btn-icon" onclick="editTask('${task.id}')">✏️</button>
                    <button class="btn-icon" onclick="deleteTask('${task.id}')">🗑️</button>
                </div>
                <button class="btn-check ${task.status === 'done' ? 'undo' : ''}" onclick="toggleStatus('${task.id}')">
                    ${task.status === 'done' ? 'Refazer' : 'Concluir'}
                </button>
            </div>
        `;

        document.getElementById(`${task.status}-list`).appendChild(card);
    });

    updateCounters();
}

function updateCounters() {
    document.getElementById('count-todo').innerText = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('count-done').innerText = tasks.filter(t => t.status === 'done').length;
}

function calculateProgress(subs) {
    if (!subs.length) return 0;
    return Math.round((subs.filter(s => s.done).length / subs.length) * 100);
}

// Evento de Busca
document.getElementById('search-input').oninput = (e) => {
    searchTerm = e.target.value;
    render();
};

// Funções de Gerenciamento (Edit, Toggle, Delete)
function toggleStatus(id) {
    const task = tasks.find(t => t.id === id);
    task.status = task.status === 'todo' ? 'done' : 'todo';
    save();
}

function addSub(taskId) {
    const text = prompt("Atividade da subtarefa:");
    if (text) {
        tasks.find(t => t.id === taskId).subtasks.push({ id: Date.now(), text, done: false });
        save();
    }
}

function toggleSub(taskId, subId) {
    const sub = tasks.find(t => t.id === taskId).subtasks.find(s => s.id === subId);
    sub.done = !sub.done;
    save();
}

function deleteTask(id) {
    if (confirm("Excluir esta tarefa permanentemente?")) {
        tasks = tasks.filter(t => t.id !== id);
        save();
    }
}

// Modal Logic
const modal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');

document.getElementById('open-modal').onclick = () => {
    taskForm.reset();
    document.getElementById('task-id').value = "";
    document.getElementById('modal-title').innerText = "Nova Tarefa";
    modal.classList.add('active');
};

document.getElementById('close-modal').onclick = () => modal.classList.remove('active');

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-deadline').value = task.deadline || "";
    document.getElementById('modal-title').innerText = "Editar Tarefa";
    modal.classList.add('active');
}

taskForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const priority = document.getElementById('task-priority').value;
    const deadline = document.getElementById('task-deadline').value;

    if (id) {
        const task = tasks.find(t => t.id === id);
        task.title = title;
        task.priority = priority;
        task.deadline = deadline;
    } else {
        tasks.push({ id: Date.now().toString(), title, priority, deadline, status: 'todo', subtasks: [] });
    }
    
    modal.classList.remove('active');
    save();
};

render();
