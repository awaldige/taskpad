/* =============================
   CONFIGURAÇÕES E ESTADO
============================= */
// 🔗 COLE AQUI A URL DO SEU BACKEND NO RENDER:
const API_URL = "https://seu-backend-no-render.onrender.com/tarefas"; 

let tarefas = [];
let editarId = null;

const listaPendentes = document.getElementById('lista-tarefas');
const listaConcluidas = document.getElementById('lista-concluidas');
const modal = document.getElementById('modal-tarefa');
const form = document.getElementById('form-tarefa');
const subtarefasLista = document.getElementById('subtarefas-lista');
const filtro = document.getElementById('filtro-prioridade');

/* =============================
   COMUNICAÇÃO COM O SERVIDOR
============================= */

async function carregarDados() {
    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            tarefas = await res.json();
            console.log("✅ Dados sincronizados da nuvem");
        } else { throw new Error(); }
    } catch (err) {
        console.warn("⚠️ Servidor offline. Usando LocalStorage.");
        tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    }
    renderizar();
}

async function sincronizar() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarefas)
        });
    } catch (err) {
        console.error("❌ Erro ao salvar na nuvem.");
    }
    renderizar();
}

/* =============================
   LÓGICA DAS SUBTAREFAS
============================= */
const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function adicionarInputSubtarefa(texto = '', concluida = false) {
    const div = document.createElement('div');
    div.className = 'subtarefa-input';
    div.innerHTML = `
        <input type="checkbox" ${concluida ? 'checked' : ''}>
        <input type="text" value="${texto}" placeholder="Nome da subtarefa">
        <button type="button" onclick="this.parentElement.remove()">❌</button>
    `;
    subtarefasLista.appendChild(div);
}

document.getElementById('adicionar-subtarefa-btn').onclick = () => adicionarInputSubtarefa();

/* =============================
   RENDERIZAÇÃO (EXIBE DESCRIÇÃO)
============================= */
function renderizar() {
    listaPendentes.innerHTML = '';
    listaConcluidas.innerHTML = '';

    tarefas.forEach(t => {
        if (filtro.value !== 'todas' && t.prioridade !== filtro.value) return;

        const li = document.createElement('li');
        li.className = `tarefa-card ${t.prioridade}`;
        
        // Contagem de subtarefas
        const totalSub = t.subtarefas ? t.subtarefas.length : 0;
        const feitasSub = t.subtarefas ? t.subtarefas.filter(s => s.concluida).length : 0;

        li.innerHTML = `
            <div class="card-content">
                <strong>${t.titulo}</strong>
                <p class="desc">${t.descricao || '<i>Sem descrição</i>'}</p>
                ${t.data ? `<small>📅 ${t.data}</small>` : ''}
                ${totalSub > 0 ? `<div class="sub-progresso">${feitasSub}/${totalSub} subtarefas</div>` : ''}
            </div>
            <div class="tarefa-acoes">
                <button onclick="moverTarefa('${t.id}')">${t.concluida ? '⬅️' : '✔️'}</button>
                <button onclick="excluirTarefa('${t.id}')">🗑️</button>
            </div>
        `;
        (t.concluida ? listaConcluidas : listaPendentes).appendChild(li);
    });
}

/* =============================
   SALVAMENTO DO FORMULÁRIO
============================= */
form.onsubmit = e => {
    e.preventDefault();

    // Captura as subtarefas do modal
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
    sincronizar();
};

// Funções globais
window.moverTarefa = (id) => {
    const t = tarefas.find(x => x.id === id);
    t.concluida = !t.concluida;
    sincronizar();
};

window.excluirTarefa = (id) => {
    if(confirm("Deseja excluir?")) {
        tarefas = tarefas.filter(x => x.id !== id);
        sincronizar();
    }
};

document.getElementById('adicionar-tarefa-btn').onclick = () => modal.classList.add('ativo');
document.getElementById('fechar-x-btn').onclick = () => modal.classList.remove('ativo');
filtro.onchange = renderizar;

carregarDados();
