const modal = document.getElementById('modal');
const newTaskBtn = document.getElementById('new-task');
const cancelBtn = document.getElementById('cancel-task');
const taskForm = document.getElementById('task-form');
const columns = document.querySelectorAll('.dropzone');

// Abrir/Fechar Modal
newTaskBtn.onclick = () => modal.style.display = 'flex';
cancelBtn.onclick = () => modal.style.display = 'none';

// Lógica de Salvar Tarefa
taskForm.onsubmit = (e) => {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const priority = document.getElementById('task-priority').value;
    
    createTask(title, priority);
    
    taskForm.reset();
    modal.style.display = 'none';
};

function createTask(title, priority) {
    const card = document.createElement('div');
    card.className = `task-card priority-${priority}`;
    card.draggable = true;
    card.innerHTML = `<strong>${title}</strong>`;
    
    // Eventos de Drag
    card.ondragstart = (e) => {
        card.classList.add('dragging');
    };
    
    card.ondragend = () => {
        card.classList.remove('dragging');
    };
    
    document.getElementById('todo').appendChild(card);
}

// Lógica de Drag and Drop nas colunas
columns.forEach(column => {
    column.ondragover = (e) => {
        e.preventDefault();
        column.classList.add('drag-over');
    };
    
    column.ondragleave = () => column.classList.remove('drag-over');
    
    column.ondrop = (e) => {
        const dragging = document.querySelector('.dragging');
        column.appendChild(dragging);
        column.classList.remove('drag-over');
    };
});
