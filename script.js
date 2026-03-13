const modal = document.getElementById('modal');
const newTaskBtn = document.getElementById('new-task');
const cancelBtn = document.getElementById('cancel-task');
const taskForm = document.getElementById('task-form');
const todoColumn = document.getElementById('todo');
const dropzones = document.querySelectorAll('.dropzone');

// Abrir modal
newTaskBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

// Fechar modal
cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    taskForm.reset();
});

// Criar Tarefa
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('task-title').value;
    const priority = document.getElementById('task-priority').value;

    if (title.trim() === "") return;

    const taskCard = document.createElement('div');
    taskCard.className = `task-card priority-${priority}`;
    taskCard.draggable = true;
    taskCard.innerText = title;

    // Eventos de Drag para o cartão
    taskCard.addEventListener('dragstart', () => {
        taskCard.classList.add('dragging');
    });

    taskCard.addEventListener('dragend', () => {
        taskCard.classList.remove('dragging');
    });

    // Adiciona na coluna Pendentes
    todoColumn.appendChild(taskCard);

    // Limpa e fecha
    taskForm.reset();
    modal.style.display = 'none';
});

// Lógica de Drop (Soltar)
dropzones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessário para permitir o drop
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', () => {
        const draggingCard = document.querySelector('.dragging');
        if (draggingCard) {
            zone.appendChild(draggingCard);
        }
        zone.classList.remove('drag-over');
    });
});
