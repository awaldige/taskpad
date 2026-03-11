/* =============================
    ESTADO E PERSISTÊNCIA
============================= */
const KEY = 'taskpad_v_final_local';
const CHAVES_ANTIGAS = ['tarefas', 'taskpad_v_final_data', 'taskpad_v_premium', 'tasks_v10'];

function carregarDados() {
    const dadosAtuais = localStorage.getItem(KEY);
    if (!dadosAtuais) {
        // Tenta recuperar de versões passadas para não perder nada
        for (const chave of CHAVES_ANTIGAS) {
            const backup = localStorage.getItem(chave);
            if (backup) {
                console.log("Recuperado de: " + chave);
                return JSON.parse(backup);
            }
        }
    }
    return dadosAtuais ? JSON.parse(dadosAtuais) : [];
}

let tarefas = carregarDados();

/* =============================
    CAPTURA DE ELEMENTOS
============================= */
const todoList = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');
const modal = document.getElementById('task-modal');
const btnOpen = document.getElementById('open-modal');
const btnClose = document.getElementById('close-modal');
const btnSave = document.getElementById('save-task');

/* =============================
    RENDERIZAÇÃO
============================= */
function renderizar() {
    if (!todoList || !doneList) return;
    
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    tarefas.forEach(t => {
        // Compatibilidade com dados antigos
        const titulo = t.titulo || t.t || t.txt || "Sem título";
        const desc = t.desc || t.descricao || t.d || "";
        const concluida = t.concluida || t.ok || false;
        const id = t.id || Date.now() + Math.random();

        const li = document.createElement('li');
        li.className = 'card';
        if (concluida) li.style.borderLeftColor = '#48bb78';

        li.innerHTML = `
            <div>
                <strong>${titulo}</strong>
                <p>${desc}</p>
            </div>
            <div class="card-actions">
                <button class="btn-act" onclick="trocarStatus('${id}')">${concluida ? '⬅️' : '✔️'}</button>
                <button class="btn-act" onclick="deletarTarefa('${id}')" style="color:red">🗑️</button>
            </div>
        `;

        concluida ? doneList.appendChild(li) : todoList.appendChild(li);
    });

    localStorage.setItem(KEY, JSON.stringify(tarefas));
}

/* =============================
    FUNÇÕES GLOBAIS (WINDOW)
============================= */
window.trocarStatus = (id) => {
    const t = tarefas.find(item => item.id == id);
    if (t) {
        t.concluida = !t.concluida;
        if (t.hasOwnProperty('ok')) t.ok = t.concluida;
        renderizar();
    }
};

window.deletarTarefa = (id) => {
    if (confirm("Deseja apagar esta tarefa?")) {
        tarefas = tarefas.filter(item => item.id != id);
        renderizar();
    }
};

/* =============================
    EVENTOS DO SISTEMA
============================= */
btnOpen.onclick = () => {
    modal.classList.add('active');
    document.getElementById('task-title').focus();
};

btnClose.onclick = () => {
    modal.classList.remove('active');
};

btnSave.onclick = () => {
    const tInput = document.getElementById('task-title');
    const dInput = document.getElementById('task-desc');

    if (!tInput.value.trim()) {
        alert("Digite um título para a tarefa!");
        return;
    }

    const nova = {
        id: "id_" + Date.now(),
        titulo: tInput.value,
        desc: dInput.value,
        concluida: false
    };

    tarefas.push(nova);
    tInput.value = '';
    dInput.value = '';
    modal.classList.remove('active');
    renderizar();
};

// Inicia a página
renderizar();
