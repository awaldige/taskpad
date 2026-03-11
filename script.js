/* =============================
    ESTADO DA APLICAÇÃO
============================= */
const KEY = 'taskpad_v_final_data';
let tarefas = JSON.parse(localStorage.getItem(KEY)) || [];

// Captura de Elementos
const todoList = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');
const modal = document.getElementById('task-modal');
const btnOpen = document.getElementById('open-modal');
const btnClose = document.getElementById('close-modal');
const btnSave = document.getElementById('save-task');

/* =============================
    FUNÇÕES DE RENDERIZAÇÃO
============================= */

function render() {
    // Limpa as colunas antes de desenhar
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    tarefas.forEach(t => {
        const li = document.createElement('li');
        li.className = 'card';
        if(t.concluida) li.style.borderLeftColor = '#48bb78';

        li.innerHTML = `
            <div>
                <strong>${t.titulo}</strong>
                <p>${t.desc || ''}</p>
            </div>
            <div class="card-actions">
                <button class="btn-act" onclick="trocarStatus('${t.id}')">${t.concluida ? '⬅️' : '✔️'}</button>
                <button class="btn-act" onclick="deletar('${t.id}')" style="color:red">🗑️</button>
            </div>
        `;

        t.concluida ? doneList.appendChild(li) : todoList.appendChild(li);
    });

    // Salva no LocalStorage
    localStorage.setItem(KEY, JSON.stringify(tarefas));
}

/* =============================
    AÇÕES
============================= */

function adicionarTarefa() {
    const inputTitulo = document.getElementById('task-title');
    const inputDesc = document.getElementById('task-desc');

    if (!inputTitulo.value.trim()) {
        alert("Digite um título para a tarefa!");
        return;
    }

    const novaTarefa = {
        id: "id_" + Date.now(),
        titulo: inputTitulo.value,
        desc: inputDesc.value,
        concluida: false
    };

    tarefas.push(novaTarefa);
    
    // Limpa e Fecha
    inputTitulo.value = '';
    inputDesc.value = '';
    modal.classList.remove('active');
    
    render();
}

window.trocarStatus = (id) => {
    const t = tarefas.find(item => item.id === id);
    if(t) {
        t.concluida = !t.concluida;
        render();
    }
};

window.deletar = (id) => {
    if(confirm("Deseja apagar esta tarefa?")) {
        tarefas = tarefas.filter(item => item.id !== id);
        render();
    }
};

// Eventos do Modal
btnOpen.onclick = () => modal.classList.add('active');
btnClose.onclick = () => modal.classList.remove('active');
btnSave.onclick = adicionarTarefa;

// Inicia a aplicação desenhando o que já estiver salvo
render();
