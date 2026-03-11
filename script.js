/* =============================
    ESTADO DA APLICAÇÃO
============================= */
// Chaves que você pode ter usado antes (para não perder dados antigos)
const CHAVES_ANTIGAS = ['taskpad_v_final_data', 'taskpad_v_premium', 'tasks_simples', 'tarefas'];
const KEY = 'taskpad_v_final_local';

// Função para recuperar o que já estava gravado (independente da versão)
function carregarBanco() {
    // 1. Tenta a chave atual
    let dados = localStorage.getItem(KEY);
    
    // 2. Se estiver vazio, tenta as chaves anteriores
    if (!dados) {
        for (let chave de CHAVES_ANTIGAS) {
            let antigo = localStorage.getItem(chave);
            if (antigo) {
                console.log("Dados recuperados de: " + chave);
                return JSON.parse(antigo);
            }
        }
    }
    return dados ? JSON.parse(dados) : [];
}

let tarefas = carregarBanco();

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
    if (!todoList || !doneList) return;

    todoList.innerHTML = '';
    doneList.innerHTML = '';

    tarefas.forEach(t => {
        // Compatibilidade: garante que entenda 'titulo' ou 't' (de versões passadas)
        const titulo = t.titulo || t.t || "Sem título";
        const descricao = t.desc || t.d || "";
        const concluida = t.concluida || t.ok || false;

        const li = document.createElement('li');
        li.className = 'card';
        if(concluida) li.style.borderLeftColor = '#48bb78';

        li.innerHTML = `
            <div class="card-info">
                <strong>${titulo}</strong>
                <p>${descricao}</p>
            </div>
            <div class="card-actions">
                <button class="btn-act" onclick="trocarStatus('${t.id}')">${concluida ? '⬅️' : '✔️'}</button>
                <button class="btn-act" onclick="deletar('${t.id}')" style="color:red">🗑️</button>
            </div>
        `;

        concluida ? doneList.appendChild(li) : todoList.appendChild(li);
    });

    localStorage.setItem(KEY, JSON.stringify(tarefas));
}

/* =============================
    AÇÕES
============================= */

function adicionarTarefa() {
    const inputTitulo = document.getElementById('task-title');
    const inputDesc = document.getElementById('task-desc');

    if (!inputTitulo.value.trim()) {
        alert("Digite um título!");
        return;
    }

    const novaTarefa = {
        id: "id_" + Date.now(),
        titulo: inputTitulo.value,
        desc: inputDesc.value,
        concluida: false
    };

    tarefas.push(novaTarefa);
    inputTitulo.value = '';
    inputDesc.value = '';
    modal.classList.remove('active');
    render();
}

window.trocarStatus = (id) => {
    // Busca flexível (compara string com número se necessário)
    const t = tarefas.find(item => item.id == id);
    if(t) {
        // Atualiza ambos os formatos de propriedade para evitar bugs de versão
        t.concluida = !t.concluida;
        if(t.hasOwnProperty('ok')) t.ok = t.concluida;
        render();
    }
};

window.deletar = (id) => {
    if(confirm("Apagar tarefa?")) {
        tarefas = tarefas.filter(item => item.id != id);
        render();
    }
};

// Eventos
btnOpen.onclick = () => {
    modal.classList.add('active');
    document.getElementById('task-title').focus();
};
btnClose.onclick = () => modal.classList.remove('active');
btnSave.onclick = adicionarTarefa;

render();
