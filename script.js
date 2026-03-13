let tasks = JSON.parse(localStorage.getItem('taskpad_db')) || [];

const DOM = {
    form: document.getElementById('task-form'),
    modal: document.getElementById('task-modal'),
    lists: document.querySelectorAll('.task-list'),
    inputs: {
        title: document.getElementById('task-title'),
        desc: document.getElementById('task-desc'),
        priority: document.getElementById('task-priority'),
        deadline: document.getElementById('task-deadline')
    }
};

function saveAndRender() {
    localStorage.setItem('taskpad_db', JSON.stringify(tasks));
    render();
}

function render() {
    DOM.lists.forEach(list => list.innerHTML = '');

    tasks.forEach(task => {
        const isOverdue = task.deadline && new Date(task.deadline) < new Date().setHours(0,0,0,0) && task.status !== 'done';
        const progress = calculateProgress(task.subtasks);
        
        const card = document.createElement('li');
        card.className = `card ${isOverdue ? 'overdue' : ''}`;
        card.draggable = true;
        card.style.borderLeftColor = `var(--${task.priority})`;

        card.innerHTML = `
            <div onclick="editTask('${task.id}')">
                <div class="card-header">
                    <strong>${task.title}</strong>
                    ${isOverdue ? '<span class="badge-atraso">Atrasado</span>' : ''}
                </div>
                <p style="font-size: 0.85rem; color: #4a5568">${task.desc}</p>
                ${task.deadline ? `<small class="date-tag">📅 ${formatDate(task.deadline)}</small>` : ''}
                <div class="progress-container"><div class="progress-bar" style="width: ${progress}%"></div></div>
            </div>
            <div class="sub-area">
                ${task.subtasks.map(s => `
                    <div class="sub-item ${s.done ? 'checked' : ''}" onclick="toggleSub('${task.id}', ${s.id})">
                        ${s.done ? '✅' : '⬜'} ${s.text}
                    </div>
                `).join('')}
                <button class="btn-add-sub" onclick="addSub('${task.id}')">+ Subtarefa</button>
            </div>
            <div style="text-align: right; margin-top: 10px;">
                <button onclick="deleteTask('${task.id}')" style="background:none; border:none; cursor:pointer">🗑️</button>
            </div>
        `;

        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
            card.dataset.id = task.id;
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));

        document.querySelector(`[data-status="${task.status}"]`).appendChild(card);
    });
}

// --- Funções de Lógica ---
function calculateProgress(subs) {
    if (!subs.length) return 0;
    return Math.round((subs.filter(s => s.done).length / subs.length) * 100);
}

function addSub(taskId) {
    const text = prompt("Descrição da subtarefa:");
    if (!text) return;
    tasks.find(t => t.id === taskId).subtasks.push({ id: Date.now(), text, done: false });
    saveAndRender();
}

function toggleSub(taskId, subId) {
    const sub = tasks.find(t => t.id === taskId).subtasks.find(s => s.id === subId);
    sub.done = !sub.done;
    saveAndRender();
}

function deleteTask(id) {
    if (confirm("Excluir tarefa?")) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }
}

// --- Drag & Drop ---
DOM.lists.forEach(list => {
    list.addEventListener('dragover', e => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        list.appendChild(dragging);
    });

    list.addEventListener('drop', () => {
        const id = document.querySelector('.dragging').dataset.id;
        tasks = tasks.map(t => t.id === id ? {...t, status: list.dataset.status} : t);
        saveAndRender();
    });
});

// --- Modal ---
DOM.form.onsubmit = (e) => {
    e.preventDefault();
    const id = DOM.form.dataset.editId || Date.now().toString();
    const taskData = {
        id,
        title: DOM.inputs.title.value,
        desc: DOM.inputs.desc.value,
        priority: DOM.inputs.priority.value,
        deadline: DOM.inputs.deadline.value,
        status: DOM.form.dataset.editStatus || 'todo',
        subtasks: DOM.form.dataset.editId ? tasks.find(t => t.id === id).subtasks : []
    };

    if (DOM.form.dataset.editId) tasks = tasks.map(t => t.id === id ? taskData : t);
    else tasks.push(taskData);

    closeModal();
    saveAndRender();
};

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    DOM.inputs.title.value = task.title;
    DOM.inputs.desc.value = task.desc;
    DOM.inputs.priority.value = task.priority;
    DOM.inputs.deadline.value = task.deadline;
    DOM.form.dataset.editId = id;
    DOM.form.dataset.editStatus = task.status;
    document.getElementById('modal-title').innerText = "Editar Tarefa";
    DOM.modal.classList.add('active');
}

function openModal() { DOM.modal.classList.add('active'); document.getElementById('modal-title').innerText = "Nova Tarefa"; }
function closeModal() { DOM.modal.classList.remove('active'); DOM.form.reset(); delete DOM.form.dataset.editId; }

function formatDate(d) { return d.split('-').reverse().join('/'); }

document.getElementById('open-modal').onclick = openModal;
document.getElementById('close-modal').onclick = closeModal;

render();
