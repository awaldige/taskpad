/* =============================
   CONFIGURAÇÕES E ESTADO
============================= */
// 🔗 TROQUE PELA URL DO SEU BACKEND NO RENDER:
const API_URL = "https://seu-backend-no-render.onrender.com/tarefas"; 

let tarefas = [];
let editarId = null;

const listaPendentes = document.getElementById('lista-tarefas');
const listaConcluidas = document.getElementById('lista-concluidas');
const modal = document.getElementById('modal-tarefa');
const form = document.getElementById('form-tarefa');
const filtro = document.getElementById('filtro-prioridade');

/* =============================
   COMUNICAÇÃO COM O SERVIDOR
============================= */

// Busca dados da API ao abrir a página
async function carregarDados() {
    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            tarefas = await res.json();
            console.log("✅ Sincronizado com a nuvem");
        } else { throw new Error(); }
    } catch (err) {
        console.warn("⚠️ Usando LocalStorage (Offline)");
        tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    }
    renderizar();
}

// Salva na API e no LocalStorage
async function sincronizar() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarefas)
        });
    } catch (err) {
        console.error("❌ Erro ao sincronizar com servidor.");
    }
    renderizar();
}

/* =============================
   LÓGICA DO KANBAN
============================= */
const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function renderizar() {
    listaPendentes.innerHTML = '';
    listaConcluidas.innerHTML = '';

    tarefas.forEach(t => {
        if (filtro.value !== 'todas' && t.prioridade !== filtro.value) return;

        const li = document.createElement('li');
        li.className = `tarefa-card ${t.prioridade}`;
        li.innerHTML = `
            <strong>${t.titulo}</strong>
            <p>${t.descricao || ''}</p>
            <div class="tarefa-acoes">
                <button onclick="editarTarefa('${t.id}')">✏️</button>
                <button onclick="moverTarefa('${t.id}')">${t.concluida ? '⬅️' : '✔️'}</button>
                <button onclick="excluirTarefa('${t.id}')">🗑️</button>
            </div>
        `;
        (t.concluida ? listaConcluidas : listaPendentes).appendChild(li);
    });
}

window.moverTarefa = (id) => {
    const t = tarefas.find(x => x.id === id);
    t.concluida = !t.concluida;
    sincronizar();
};

window.excluirTarefa = (id) => {
    if(confirm("Excluir?")) {
        tarefas = tarefas.filter(x => x.id !== id);
        sincronizar();
    }
};

form.onsubmit = e => {
    e.preventDefault();
    const nova = {
        id: gerarId(),
        titulo: document.getElementById('titulo-tarefa').value,
        descricao: document.getElementById('descricao-tarefa').value,
        prioridade: document.getElementById('prioridade-tarefa').value,
        concluida: false,
        subtarefas: []
    };
    tarefas.push(nova);
    modal.classList.remove('ativo');
    form.reset();
    sincronizar();
};

// Abre modal
document.getElementById('adicionar-tarefa-btn').onclick = () => modal.classList.add('ativo');
document.getElementById('fechar-x-btn').onclick = () => modal.classList.remove('ativo');

carregarDados();
