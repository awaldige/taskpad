let tasks = JSON.parse(localStorage.getItem('taskpad_lite')) || [];

function save() {
    localStorage.setItem('taskpad_lite', JSON.stringify(tasks));
    render();
}

function render() {
    document.getElementById('todo-list').innerHTML = '';
    document.getElementById('done-list').innerHTML = '';

    tasks.forEach(task => {
        const progress = calculateProgress(task.subtasks);
        const isOverdue = task.deadline && new Date(task.deadline) < new Date().setHours(0,0,0,0) && task.status !== 'done';
        
        const card = document.createElement('li');
        card.className = `card ${isOverdue ? 'overdue' : ''}`;
        card.style.borderLeftColor = `var(--${task.priority})`;

        card.innerHTML = `
            <div>
                <strong style="display:block; margin-bottom:5px;">${task.title}</strong>
                ${task.deadline ? `<small>📅 ${task.deadline.split('-').reverse().join('/')}</small>` : ''}
                
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>

            <div class="subs">
                ${task.subtasks.map(s => `
                    <div class="sub-item ${s.done ? 'checked' : ''}" onclick="toggleSub('${task.id}', ${s.id})">
                        ${s.done ? '✅' : '⬜'} ${s.text}
                    </div>
                `).join('')}
                <button onclick="addSub('${task.id}')" style="font-size:0.7rem; cursor:pointer; background:none; border:1px dashed #ccc; width:100%; margin-top:5px;">+ Subtarefa</button>
            </div>

            <div class="card-actions">
                <button onclick="deleteTask('${task.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button>
                <button class="btn-check ${task.status === 'done' ? 'undo' : ''}" onclick="toggleStatus('${task.id}')">
                    ${task.status === 'done' ? 'Refazer' : 'Concluir ✔'}
                </button>
            </div>
        `;

        document.getElementById(`${task.status}-list`).appendChild(card);
    });
}

function calculateProgress(subs) {
    if (!subs.length) return 0;
    return Math.round((subs.filter(s => s.done).length / subs.length) * 100);
}

function toggleStatus(id) {
    const task = tasks.find(t => t.id === id);
    task.status = task.status === 'todo' ? 'done' : 'todo';
    save();
}

function addSub(taskId) {
    const text = prompt("Nome da atividade:");
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
    if (confirm("Excluir?")) {
        tasks = tasks.filter(t => t.id !== id);
        save();
    }
}

// Modal e Form
const modal = document.getElementById('task-modal');
document.getElementById('open-modal').onclick = () => modal.classList.add('active');
document.getElementById('close-modal').onclick = () => modal.classList.remove('active');

document.getElementById('task-form').onsubmit = (e) => {
    e.preventDefault();
    tasks.push({
        id: Date.now().toString(),
        title: document.getElementById('task-title').value,
        priority: document.getElementById('task-priority').value,
        deadline: document.getElementById('task-deadline').value,
        status: 'todo',
        subtasks: []
    });
    modal.classList.remove('active');
    e.target.reset();
    save();
};

render();
