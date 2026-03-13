document.addEventListener('DOMContentLoaded', () => {
    let tasks = JSON.parse(localStorage.getItem('taskpad_pro_final')) || [];
    let tempSubtasks = [];

    const modal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const subEditorList = document.getElementById('subtasks-editor-list');

    // Funções de Persistência
    const save = () => {
        localStorage.setItem('taskpad_pro_final', JSON.stringify(tasks));
        render();
    };

    // Renderizar Editor de Subtarefas no Modal
    function renderSubEditor() {
        subEditorList.innerHTML = '';
        tempSubtasks.forEach((sub, index) => {
            const div = document.createElement('div');
            div.className = 'sub-edit-row';
            div.innerHTML = `
                <input type="text" value="${sub.text}" placeholder="Item..." class="sub-input">
                <button type="button" class="btn-del-sub">✕</button>
            `;
            div.querySelector('input').oninput = (e) => tempSubtasks[index].text = e.target.value;
            div.querySelector('.btn-del-sub').onclick = () => {
                tempSubtasks.splice(index, 1);
                renderSubEditor();
            };
            subEditorList.appendChild(div);
        });
    }

    // Abrir Modal para Nova Tarefa
    document.getElementById('open-modal').onclick = () => {
        taskForm.reset();
        document.getElementById('task-id').value = '';
        document.getElementById('modal-title').innerText = 'Nova Tarefa';
        tempSubtasks = [];
        renderSubEditor();
        modal.classList.add('active');
    };

    // Abrir Modal para Editar
    window.editTask = (id) => {
        const task = tasks.find(t => t.id === id);
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-deadline').value = task.deadline || '';
        document.getElementById('modal-title').innerText = 'Editar Tarefa';
        tempSubtasks = [...task.subtasks.map(s => ({...s}))];
        renderSubEditor();
        modal.classList.add('active');
    };

    // Adicionar campo de subtarefa
    document.getElementById('add-sub-field').onclick = () => {
        tempSubtasks.push({ id: Date.now(), text: '', done: false });
        renderSubEditor();
    };

    // Salvar Form
    taskForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('task-id').value;
        const data = {
            title: document.getElementById('task-title').value,
            priority: document.getElementById('task-priority').value,
            deadline: document.getElementById('task-deadline').value,
            subtasks: tempSubtasks.filter(s => s.text.trim() !== '')
        };

        if (id) {
            const index = tasks.findIndex(t => t.id === id);
            tasks[index] = { ...tasks[index], ...data };
        } else {
            tasks.push({ ...data, id: Date.now().toString(), status: 'todo' });
        }
        modal.classList.remove('active');
        save();
    };

    // Fechar Modal
    document.getElementById('close-modal').onclick = () => modal.classList.remove('active');
    document.getElementById('close-modal-x').onclick = () => modal.classList.remove('active');

    // Renderizar Cards na Tela
    function render() {
        const todoList = document.getElementById('todo-list');
        const doneList = document.getElementById('done-list');
        todoList.innerHTML = ''; doneList.innerHTML = '';

        tasks.forEach(task => {
            const card = document.createElement('li');
            card.className = 'card';
            card.style.borderLeftColor = `var(--${task.priority})`;
            card.innerHTML = `
                <div onclick="editTask('${task.id}')" style="cursor:pointer">
                    <h4>${task.title}</h4>
                    <p style="font-size:0.8rem; color:var(--text-light)">
                        ${task.subtasks.length} subtarefas • ${task.deadline || 'Sem prazo'}
                    </p>
                </div>
                <div style="margin-top:15px; display:flex; justify-content:flex-end; gap:10px;">
                    <button onclick="toggleStatus('${task.id}')" class="btn-text">
                        ${task.status === 'todo' ? 'Concluir' : 'Refazer'}
                    </button>
                    <button onclick="deleteTask('${task.id}')" style="color:red; border:none; background:none; cursor:pointer">🗑️</button>
                </div>
            `;
            document.getElementById(`${task.status}-list`).appendChild(card);
        });

        document.getElementById('count-todo').innerText = tasks.filter(t => t.status === 'todo').length;
        document.getElementById('count-done').innerText = tasks.filter(t => t.status === 'done').length;
    }

    window.toggleStatus = (id) => {
        const task = tasks.find(t => t.id === id);
        task.status = task.status === 'todo' ? 'done' : 'todo';
        save();
    };

    window.deleteTask = (id) => {
        if(confirm('Excluir?')) { tasks = tasks.filter(t => t.id !== id); save(); }
    };

    render();
});
