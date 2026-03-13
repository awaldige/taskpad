document.addEventListener('DOMContentLoaded', () => {
    let tasks = JSON.parse(localStorage.getItem('taskpad_pro_final')) || [];
    let searchTerm = "";
    let tempSubtasks = []; 

    const modal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const subEditorList = document.getElementById('subtasks-editor-list');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const openModalBtn = document.getElementById('open-modal');

    // TEMA
    const applyTheme = (theme) => {
        document.body.setAttribute('data-theme', theme);
        themeToggle.innerText = theme === 'dark' ? '☀️' : '🌓';
        localStorage.setItem('theme', theme);
    };

    applyTheme(localStorage.getItem('theme') || 'light');

    themeToggle.onclick = () => {
        const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    };

    // CORE
    const save = () => {
        localStorage.setItem('taskpad_pro_final', JSON.stringify(tasks));
        render();
    };

    const calculateProgress = (subs) => {
        if (!subs || subs.length === 0) return 0;
        return Math.round((subs.filter(s => s.done).length / subs.length) * 100);
    };

    function render() {
        const todoList = document.getElementById('todo-list');
        const doneList = document.getElementById('done-list');
        todoList.innerHTML = doneList.innerHTML = '';

        const filtered = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

        filtered.forEach(task => {
            const progress = calculateProgress(task.subtasks);
            const card = document.createElement('li');
            card.className = `card ${task.deadline && new Date(task.deadline) < new Date().setHours(0,0,0,0) && task.status === 'todo' ? 'overdue' : ''}`;
            card.style.borderLeftColor = `var(--${task.priority})`;

            card.innerHTML = `
                <div class="card-clickable">
                    <strong>${task.title}</strong>
                    <div class="progress-container"><div class="progress-bar" style="width: ${progress}%"></div></div>
                </div>
                <div class="subs-list">
                    ${task.subtasks.map(s => `<div class="sub-item ${s.done ? 'checked' : ''}" data-sid="${s.id}">${s.done ? '✅' : '⬜'} ${s.text}</div>`).join('')}
                </div>
                <div class="card-actions">
                    <div class="action-btns-group">
                        <button class="btn-edit-task">✏️</button>
                        <button class="btn-delete-task">🗑️</button>
                    </div>
                    <button class="btn-toggle-status ${task.status === 'done' ? 'undo' : ''}">
                        ${task.status === 'done' ? 'Refazer' : 'Concluir'}
                    </button>
                </div>
            `;

            card.querySelector('.card-clickable').onclick = () => editTask(task.id);
            card.querySelector('.btn-edit-task').onclick = () => editTask(task.id);
            card.querySelector('.btn-delete-task').onclick = () => { if(confirm("Excluir?")) { tasks = tasks.filter(t => t.id !== task.id); save(); }};
            card.querySelector('.btn-toggle-status').onclick = () => { task.status = task.status === 'todo' ? 'done' : 'todo'; save(); };
            card.querySelectorAll('.sub-item').forEach(item => {
                item.onclick = () => {
                    const sub = task.subtasks.find(s => s.id == item.dataset.sid);
                    sub.done = !sub.done;
                    save();
                };
            });

            document.getElementById(`${task.status}-list`).appendChild(card);
        });
        document.getElementById('count-todo').innerText = tasks.filter(t => t.status === 'todo').length;
        document.getElementById('count-done').innerText = tasks.filter(t => t.status === 'done').length;
    }

    // MODAL
    function renderSubEditor() {
        subEditorList.innerHTML = '';
        tempSubtasks.forEach((sub, i) => {
            const div = document.createElement('div');
            div.className = 'sub-edit-row';
            div.innerHTML = `<input type="text" value="${sub.text}" class="input-sub-edit" placeholder="Subtarefa..."><button type="button" class="btn-sub-del">❌</button>`;
            div.querySelector('input').onchange = (e) => tempSubtasks[i].text = e.target.value;
            div.querySelector('.btn-sub-del').onclick = () => { tempSubtasks.splice(i, 1); renderSubEditor(); };
            subEditorList.appendChild(div);
        });
    }

    document.getElementById('add-sub-field').onclick = () => { tempSubtasks.push({ id: Date.now(), text: "", done: false }); renderSubEditor(); };

    const editTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if(!task) return;
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-deadline').value = task.deadline || "";
        tempSubtasks = [...task.subtasks.map(s => ({...s}))];
        renderSubEditor();
        modal.classList.add('active');
    };

    taskForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('task-id').value;
        const data = {
            title: document.getElementById('task-title').value,
            priority: document.getElementById('task-priority').value,
            deadline: document.getElementById('task-deadline').value,
            subtasks: tempSubtasks.filter(s => s.text.trim() !== "")
        };
        if(id) Object.assign(tasks.find(t => t.id === id), data);
        else tasks.push({ ...data, id: Date.now().toString(), status: 'todo' });
        close();
        save();
    };

    const close = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        modal.classList.remove('active');
    };

    openModalBtn.onclick = () => { taskForm.reset(); document.getElementById('task-id').value = ""; tempSubtasks = []; renderSubEditor(); modal.classList.add('active'); };
    document.getElementById('close-modal').onclick = close;
    document.getElementById('close-modal-x').onclick = close;
    searchInput.oninput = (e) => { searchTerm = e.target.value; render(); };

    render();
});
