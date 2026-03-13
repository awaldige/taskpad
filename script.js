let tasks = JSON.parse(localStorage.getItem('taskpad_pro_final')) || [];
let searchTerm = "";

const modal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const subSection = document.getElementById('subtasks-edit-section');
const subEditorList = document.getElementById('subtasks-editor-list');

// --- TEMA ---
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.innerText = savedTheme === 'dark' ? '☀️' : '🌓';

themeToggle.onclick = () => {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerText = newTheme === 'dark' ? '☀️' : '🌓';
};

// --- CORE ---
function save() {
    localStorage.setItem('taskpad_pro_final', JSON.stringify(tasks));
    render();
}

function render() {
    const lists = { todo: document.getElementById('todo-list'), done: document.getElementById('done-list') };
    lists.todo.innerHTML = ''; lists.done.innerHTML = '';

    const filtered = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    filtered.forEach(task => {
        const progress = calculateProgress(task.subtasks);
        const isOverdue = task.deadline && new Date(task.deadline) < new Date().setHours(0,0,0,0) && task.status === 'todo';
        
        const card = document.createElement('li');
        card.className = `card ${isOverdue ? 'overdue' : ''}`;
        card.style.borderLeftColor = `var(--${task.priority})`;

        card.innerHTML = `
            <div onclick="editTask('${task.id}')" style="cursor:pointer">
                <strong>${task.title}</strong>
                ${isOverdue ? '<br><span class="overdue-label">⚠️ ATRASADA</span>' : ''}
                <div class="progress-container"><div class="progress-bar" style="width: ${progress}%"></div></div>
            </div>
            <div class="subs">
                ${task.subtasks.map(s => `
                    <div class="sub-item ${s.done ? 'checked' : ''}" onclick="toggleSub('${task.id}', ${s.id})">
                        ${s.done ? '✅' : '⬜'} ${s.text}
                    </div>
                `).join('')}
                <button onclick="addSubDirect('${task.id}')" style="background:none; border:1px dashed var(--border); width:100%; padding:5px; margin-top:5px; border-radius:5px; cursor:pointer; color:var(--text-gray); font-size:0.75rem">+ Rápido</button>
            </div>
            <div class="card-actions">
                <div style="display:flex; gap:10px">
                    <button class="btn-icon" onclick="editTask('${task.id}')">✏️</button>
                    <button class="btn-icon" onclick="deleteTask('${task.id}')">🗑️</button>
                </div>
                <button class="btn-check ${task.status === 'done' ? 'undo' : ''}" onclick="toggleStatus('${task.id}')">
                    ${task.status === 'done' ? 'Refazer' : 'Concluir'}
                </button>
            </div>
        `;
        lists[task.status].appendChild(card);
    });
    updateCounters();
}

const calculateProgress = (subs) => subs.length ? Math.round((subs.filter(s => s.done).length / subs.length) * 100) : 0;

function updateCounters() {
    document.getElementById('count-todo').innerText = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('count-done').innerText = tasks.filter(t => t.status === 'done').length;
}

function toggleStatus(id) {
    const task = tasks.find(t => t.id === id);
    task.status = task.status === 'todo' ? 'done' : 'todo';
    save();
}

function addSubDirect(taskId) {
    const text = prompt("Nome da subtarefa:");
    if (text) { tasks.find(t => t.id === taskId).subtasks.push({ id: Date.now(), text, done: false }); save(); }
}

function toggleSub(taskId, subId) {
    const task = tasks.find(t => t.id === taskId);
    const sub = task.subtasks.find(s => s.id === subId);
    sub.done = !sub.done;
    save();
}

function deleteTask(id) { if (confirm("Excluir tarefa permanentemente?")) { tasks = tasks.filter(t => t.id !== id); save(); } }

// --- MODAL & EDIÇÃO DE SUBTAREFAS ---
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-deadline').value = task.deadline || "";
    
    // Abrir seção de subtarefas no modal
    subSection.style.display = 'block';
    renderSubEditor(task);
    
    modal.classList.add('active');
}

function renderSubEditor(task) {
    subEditorList.innerHTML = '';
    task.subtasks.forEach(sub => {
        const div = document.createElement('div');
        div.className = 'sub-edit-row';
        div.innerHTML = `
            <input type="text" value="${sub.text}" onchange="updateSubText('${task.id}', ${sub.id}, this.value)">
            <button type="button" onclick="removeSub('${task.id}', ${sub.id})" style="border:none; background:none; cursor:pointer">❌</button>
        `;
        subEditorList.appendChild(div);
    });
}

function updateSubText(taskId, subId, newText) {
    const task = tasks.find(t => t.id === taskId);
    const sub = task.subtasks.find(s => s.id === subId);
    sub.text = newText;
    // Sem save() aqui para não fechar o modal/renderizar tudo enquanto digita
}

function removeSub(taskId, subId) {
    const task = tasks.find(t => t.id === taskId);
    task.subtasks = task.subtasks.filter(s => s.id !== subId);
    renderSubEditor(task);
}

document.getElementById('open-modal').onclick = () => { 
    taskForm.reset(); 
    document.getElementById('task-id').value = ""; 
    subSection.style.display = 'none';
    modal.classList.add('active'); 
};

document.getElementById('close-modal').onclick = document.getElementById('close-modal-x').onclick = () => modal.classList.remove('active');

taskForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const data = { 
        title: document.getElementById('task-title').value, 
        priority: document.getElementById('task-priority').value, 
        deadline: document.getElementById('task-deadline').value 
    };
    
    if (id) { 
        const task = tasks.find(t => t.id === id);
        Object.assign(task, data);
    } else { 
        tasks.push({ ...data, id: Date.now().toString(), status: 'todo', subtasks: [] }); 
    }
    modal.classList.remove('active'); 
    save();
};

document.getElementById('search-input').oninput = (e) => { searchTerm = e.target.value; render(); };

render();
