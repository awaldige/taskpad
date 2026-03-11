/* =============================
    CONFIGURAÇÕES E ESTADO
============================= */
// Chave única para o armazenamento local
const STORAGE_KEY = 'taskpad_data_v1';
let tarefas = [];

// Seleção de elementos do DOM
const listaPendentes = document.getElementById('lista-tarefas');
const listaConcluidas = document.getElementById('lista-concluidas');
const modal = document.getElementById('modal-tarefa');
const form = document.getElementById('form-tarefa');
const subtarefasLista = document.getElementById('subtarefas-lista');
const filtro = document.getElementById('filtro-prioridade');

/* =============================
    PERSISTÊNCIA (LOCALSTORAGE)
============================= */

function carregarDados() {
    try {
        const dadosLocais = localStorage.getItem(STORAGE_KEY);
        if (dadosLocais) {
            tarefas = JSON.parse(dadosLocais);
            renderizar();
        }
    } catch (err) {
        console.error("Erro ao carregar dados do LocalStorage:", err);
        tarefas = [];
    }
}

function salvarESincronizar() {
    // Salva o estado atual no navegador do usuário
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
    renderizar();
}

/* =============================
    LÓGICA E RENDERIZAÇÃO
============================= */

const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function adicionarInputSubtarefa(texto = '', concluida = false) {
    const div = document.createElement('div');
    div.className = 'subtarefa-input';
    div.style.display = "flex";
    div.style.gap = "5px";
    div.style.marginBottom = "8px";
    div.innerHTML = `
        <input type="checkbox" ${concluida ? 'checked' : ''}>
        <input type="text" value="${texto}" placeholder="Subtarefa..." style="flex:1">
        <button type="button" onclick="this.parentElement.remove()" style="background:#fee2e2; color:#ef4444; padding:0 8px; border-radius:4px;">✕</button>
    `;
    subtarefasLista.appendChild(div);
}

function renderizar() {
    if (!listaPendentes || !listaConcluidas) return;
    
    listaPendentes.innerHTML = '';
    listaConcluidas.innerHTML = '';

    tarefas.forEach(t => {
        // Aplica o filtro de prioridade
        if (filtro && filtro.value !== 'todas' && t.prioridade !== filtro.value) return;

        const li = document.createElement('li');
        li.className = `tarefa-card ${t.prioridade}`;
        
        // Renderiza as subtarefas se existirem
        const listaSub = (t.subtarefas || []).map(s => `
            <div style="font-size: 0.8rem; color: #555; margin: 2px 0; display:flex; align-items:center; gap:5px;">
                ${s.concluida ? '✅' : '⬜'} ${s.texto}
            </div>
        `).join('');

        li.innerHTML = `
            <div class="card-content">
                <strong>${t.titulo}</strong>
                <p class="desc" style="font-size:0.85rem; color:#666; margin: 4px 0;">${t.descricao || ''}</p>
                <div class="exibicao-subtarefas" style="margin: 8px 0; border-left: 2px solid #ddd; padding-left:8px;">
                    ${listaSub}
                </div>
                ${t.data ? `<small style="color:#999;">📅 ${t.data}</small>` : ''}
            </div>
            <div class="tarefa-acoes" style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px; border-top:1px solid #eee; padding-top:8px;">
                <button onclick="moverTarefa('${t.id}')" style="background:#f0f0f0; padding:8px 12px; border-radius:6px; cursor:pointer;">${t.concluida ? '⬅️' : '✔️'}</button>
                <button onclick="excluirTarefa('${t.id}')" style="background:#fee2e2; color:red; padding:8px 12px; border-radius:6px; cursor:pointer;">🗑️</button>
            </div>
        `;
        (t.concluida ? listaConcluidas : listaPendentes).appendChild(li);
    });
}

/* =============================
    EVENTOS
============================= */

form.onsubmit = e => {
    e.preventDefault();

    const subs = [...subtarefasLista.querySelectorAll('.subtarefa-input')].map(div => ({
        texto: div.querySelector('input[type="text"]').value,
        concluida: div.querySelector('input[type="checkbox"]').checked
    })).filter(s => s.texto.trim() !== "");

    const novaTarefa = {
        id: gerarId(),
        titulo: document.getElementById('titulo-tarefa').value,
        descricao: document.getElementById('descricao-tarefa').value,
        data: document.getElementById('data-tarefa').value,
        prioridade: document.getElementById('prioridade-tarefa').value,
        subtarefas: subs,
        concluida: false
    };

    tarefas.push(novaTarefa);
    modal.classList.remove('ativo');
    form.reset();
    subtarefasLista.innerHTML = '';
    salvarESincronizar();
};

window.moverTarefa = (id) => {
    const t = tarefas.find(x => x.id === id);
    if(t) { 
        t.concluida = !t.concluida; 
        salvarESincronizar(); 
    }
};

window.excluirTarefa = (id) => {
    if(confirm("Deseja excluir esta tarefa definitivamente?")) {
        tarefas = tarefas.filter(x => x.id !== id);
        salvarESincronizar();
    }
};

// Gerenciamento do Modal
document.getElementById('adicionar-tarefa-btn').onclick = () => {
    subtarefasLista.innerHTML = ''; 
    modal.classList.add('ativo');
};

document.getElementById('fechar-x-btn').onclick = () => modal.classList.remove('ativo');
document.getElementById('adicionar-subtarefa-btn').onclick = () => adicionarInputSubtarefa();

// Filtro
if(filtro) {
    filtro.onchange = renderizar;
}

// Inicialização
carregarDados();
