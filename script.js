document.addEventListener('DOMContentLoaded', () => {
    // 1. Estado da Aplicação
    let tasks = JSON.parse(localStorage.getItem('taskpad_pro_final')) || [];
    let searchTerm = "";

    // 2. Seleção de Elementos
    const modal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const subSection = document.getElementById('subtasks-edit-section');
    const subEditorList = document.getElementById('subtasks-editor-list');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const openModalBtn = document.getElementById('open-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const closeModalX = document.getElementById('close-modal-x');

    // 3. Inicialização de Tema
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.innerText = savedTheme === 'dark' ? '☀️' : '🌓';

    themeToggle.onclick = () => {
        const current = document.body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        themeToggle.innerText = next === 'dark' ? '☀️' : '🌓';
    };

    // 4. Funções Principais
    const save = () => {
        localStorage.setItem('taskpad_pro_final', JSON.stringify(tasks));
        render();
    };

    const calculateProgress = (subs) => {
        if (!subs || subs.length === 0) return 0;
        const done = subs.filter(s => s.done).length;
        return Math.round((done / subs.length) * 100);
    };

    const updateCounters = () => {
        document.getElementById('count-todo').innerText = tasks.filter(t => t.status === 'todo').length;
        document.getElementById('count-done').innerText = tasks.filter(t => t.status === 'done').length;
    };

    // 5. Renderização dos Cards
    function render() {
        const todoList = document.getElementById('todo-list');
        const doneList = document.getElementById('done-list');
        todoList.innerHTML = ''; 
        doneList.innerHTML = '';

        const filtered = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

        filtered.forEach(task => {
            const progress = calculateProgress(task.subtasks);
            const isOverdue = task.deadline && new Date(task.deadline) < new Date().setHours(0,0,0,0) && task.status === 'todo';
            
            const card = document.createElement('li');
            card.className = `card ${isOverdue ? 'overdue' : ''}`;
            card.style.borderLeftColor = `var(--${task.priority})`;

            card.innerHTML = `
                <div class="card-clickable">
                    <strong>${task.title}</strong>
                    ${isOverdue ? '<br><span class="overdue-label">⚠️ ATRASADA</span>' : ''}
                    <div class="progress-container"><div class="progress-bar" style="width: ${progress}%"></div></div>
                </div>
                <div class="subs-list">
                    ${task.subtasks.map(s => `
                        <div class="sub-item ${s.done ? 'checked' : ''}" data-subid="${s.id}">
                            ${s.done ? '✅' : '⬜'} ${s.text}
                        </div>
                    `).join('')}
                    <button class="btn-quick-add">+ Rápido</button>
                </div>
                <div class="card-actions">
                    <div style="display:flex; gap:10px">
                        <button class="btn-edit-task">✏️</button>
                        <button class="btn-delete-task">🗑️</button>
                    </div>
                    <button class="btn-toggle-status ${task.status === 'done' ? 'undo' : ''}">
                        ${task.status === 'done' ? 'Refazer' : 'Concluir'}
                    </button>
                </div>
            `;

            // Atribuição de Eventos aos botões do Card
            card.querySelector('.card-clickable').onclick = () => editTask(task.id);
            card.querySelector('.btn-edit-task').onclick = () => editTask(task.id);
            card.querySelector('.btn-delete-task').onclick = () => {
                if(confirm("Excluir tarefa?")) { tasks = tasks.filter(t => t.id !== task.id); save(); }
            };
            card.querySelector('.btn-toggle-status').onclick = () => {
                task.status = task.status === 'todo' ? 'done' : 'todo';
                save();
            };
            card.querySelector('.btn-quick-add').onclick = () => {
                const txt = prompt("Nova subtarefa:");
                if(txt) { task.subtasks.push({ id: Date.now(), text: txt, done: false }); save(); }
            };
            card.querySelectorAll('.sub-item').forEach(item => {
                item.onclick = () => {
                    const sid = item.getAttribute('data-subid');
                    const sub = task.subtasks.find(s => s.id == sid);
                    sub.done = !sub.done;
                    save();
                };
            });

            document.getElementById(`${task.status}-list`).appendChild(card);
        });
        updateCounters();
    }

    // 6. Modal e Edição
    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if(!task) return;

        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-deadline').value = task.deadline || "";
        
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
                <input type="text" value="${sub.text}" class="input-sub-edit">
                <button type="button" class="btn-sub-del">❌</button>
            `;
            div.querySelector('.input-sub-edit').onchange = (e) => { sub.text = e.target.value; };
            div.querySelector('.btn-sub-del').onclick = () => {
                task.subtasks = task.subtasks.filter(s => s.id !== sub.id);
                renderSubEditor(task);
            };
            subEditorList.appendChild(div);
        });
    }

    // 7. Eventos de Formulário
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

    openModalBtn.onclick = () => {
        taskForm.reset();
        document.getElementById('task-id').value = "";
        subSection.style.display = 'none';
        modal.classList.add('active');
    };

    const close = () => modal.classList.remove('active');
    closeModalBtn.onclick = close;
    closeModalX.onclick = close;

    searchInput.oninput = (e) => {
        searchTerm = e.target.value;
        render();
    };

    render();
});
