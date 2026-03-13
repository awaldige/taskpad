// --- ESTADO DA APLICAÇÃO ---
let tasks = JSON.parse(localStorage.getItem('taskpad_data')) || [];

const DOM = {
    modal: document.getElementById('task-modal'),
    form: document.getElementById('task-form'),
    taskTitle: document.getElementById('task-title'),
    taskDesc: document.getElementById('task-desc'),
    columns: {
        todo: document.getElementById('todo-list'),
        doing: document.getElementById('doing-list'),
        done: document.getElementById('done-list')
    },
    openModalBtn: document.getElementById('open-modal'),
    closeModalBtn: document.getElementById('close-modal')
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    setupDragAndDrop();
    checkDeadlines();
});

// --- GERENCIAMENTO DE TAREFAS ---

function openModal(editId = null) {
    DOM.modal.classList.add('active');
    DOM.modal.setAttribute('aria-hidden', 'false');
    
    if (editId) {
        const task = tasks.find(t => t.id === editId);
        DOM.taskTitle.value = task.title;
        DOM.taskDesc.value = task.desc;
        DOM.form.dataset.editId = editId;
        document.getElementById('modal-title').innerText = "Editar Tarefa";
    } else {
        DOM.form.reset();
        delete DOM.form.dataset.editId;
        document.getElementById('modal-title').innerText = "Nova Tarefa";
    }
}

function closeModal() {
    DOM.modal.classList.remove('active');
    DOM.modal.setAttribute('aria-hidden', 'true');
}

DOM.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = DOM.form.dataset.editId;
    
    const taskData = {
        id: editId || Date.now().toString(),
        title: DOM.taskTitle.value,
        desc: DOM.taskDesc.value,
        status: editId ? tasks.find(t => t.id === editId).status : 'todo',
        subtasks: editId ? tasks.find(t => t.id === editId).subtasks : [],
        priority: 'media', // Pode ser expandido para um select
        createdAt: new Date().toISOString()
    };

    if (editId) {
        tasks = tasks.map(t => t.id === editId ? taskData : t);
    } else {
        tasks.push(taskData);
    }

    saveAndRender();
    closeModal();
});

function deleteTask(id) {
    if(confirm('Deseja excluir esta tarefa?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }
}

// --- SUBTAREFAS E PROGRESSO ---

function addSubtask(taskId) {
    const text = prompt("Nome da subtarefa:");
    if (!text) return;
    
    tasks = tasks.map(t => {
        if (t.id === taskId) {
            t.subtasks.push({ id: Date.now(), text, completed: false });
        }
        return t;
    });
    saveAndRender();
}

function toggleSubtask(taskId, subId) {
    tasks = tasks.map(t => {
        if (t.id === taskId) {
            t.subtasks = t.subtasks.map(s => s.id === subId ? {...s, completed: !s.completed} : s);
        }
        return t;
    });
    saveAndRender();
}

function calculateProgress(subtasks) {
    if (subtasks.length === 0) return 0;
    const done = subtasks.filter(s => s.completed).length;
    return Math.round((done / subtasks.length) * 100);
}

// --- DRAG & DROP ---

function setupDragAndDrop() {
    const lists = document.querySelectorAll('.task-list');
    
    lists.forEach(list => {
        list.addEventListener('dragover', e => {
            e.preventDefault();
            list.classList.add('drag-over');
        });

        list.addEventListener('dragleave', () => list.classList.remove('drag-over'));

        list.addEventListener('drop', e => {
            const id = e.dataTransfer.getData('text/plain');
            const newStatus = list.dataset.status;
            
            tasks = tasks.map(t => t.id === id ? {...t, status: newStatus} : t);
            list.classList.remove('drag-over');
            saveAndRender();
        });
    });
}

// --- RENDERIZAÇÃO ---

function renderTasks() {
    // Limpar listas
    Object.values(DOM.columns).forEach(col => col.innerHTML = '');

    tasks.forEach(task => {
        const progress = calculateProgress(task.subtasks);
        
        const card = document.createElement('li');
        card.className = 'card';
        card.draggable = true;
        card.innerHTML = `
            <div onclick="openModal('${task.id}')">
                <strong>${task.title}</strong>
                <p>${task.desc}</p>
                
                ${task.subtasks.length > 0 ? `
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <small>${progress}% concluído</small>
                ` : ''}
            </div>

            <ul class="subtask-list">
                ${task.subtasks.map(s => `
                    <li class="${s.completed ? 'done' : ''}" onclick="toggleSubtask('${task.id}', ${s.id})">
                        ${s.completed ? '✅' : '⬜'} ${s.text}
                    </li>
                `).join('')}
            </ul>

            <div class="card-actions">
                <button class="btn-act" onclick="addSubtask('${task.id}')" title="Add Subtarefa">➕</button>
                <button class="btn-act" onclick="deleteTask('${task.id}')" title="Excluir">🗑️</button>
            </div>
        `;

        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', task.id);
            card.style.opacity = '0.5';
        });

        card.addEventListener('dragend', () => card.style.opacity = '1');

        DOM.columns[task.status].appendChild(card);
    });
}

function saveAndRender() {
    localStorage.setItem('taskpad_data', JSON.stringify(tasks));
    renderTasks();
}

// --- NOTIFICAÇÕES E PRAZOS ---
function checkDeadlines() {
    // Exemplo simplificado: Notifica se houver tarefas "todo" ao abrir
    const pending = tasks.filter(t => t.status === 'todo').length;
    if (pending > 0 && "Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("TaskPad", { body: `Você tem ${pending} tarefas pendentes para hoje!` });
            }
        });
    }
}

// Listeners auxiliares
DOM.openModalBtn.onclick = () => openModal();
DOM.closeModalBtn.onclick = closeModal;
