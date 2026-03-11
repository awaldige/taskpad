/* =============================
   CONFIGURAÇÕES E ESTADO
============================= */
// 🔗 IMPORTANTE: Mude para o seu link do Render para funcionar no Celular!
const API_URL = "https://catalogo-backend-e14g.onrender.com/tarefas"; 

let tarefas = [];

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
            console.log("✅ Sincronizado com a nuvem");
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
    div.style.display = "flex";
    div.style.gap = "5px";
    div.style.marginBottom = "5px";
    div.innerHTML = `
        <input type="checkbox" ${concluida ? 'checked' : ''}>
        <input type="text" value="${texto}" placeholder="Nome da subtarefa">
        <button type="button" onclick="this.parentElement.remove()">❌</button>
    `;
    subtarefasLista.appendChild(div);
}

document.getElementById('adicionar-subtarefa-btn').onclick = () => adicionarInputSubtarefa();

/* =============================
   RENDERIZAÇÃO (MOSTRA TUDO)
============================= */
function renderizar() {
    listaPendentes.innerHTML = '';
    listaConcluidas.innerHTML = '';

    tarefas.forEach(t => {
        if (filtro.value !== 'todas' && t.prioridade !== filtro.value) return;

        const li = document.createElement('li');
        li.className = `tarefa-card ${t.prioridade}`;
        
        // --- NOVO: Gera a lista visual das subtarefas ---
        const listaSub = (t.subtarefas || []).map(s => `
            <div style="font-size: 0.8rem; color: #555; margin-left: 10px;">
                ${s.concluida ? '✅' : '⬜'} ${s.texto}
            </div>
        `).join('');

        li.innerHTML = `
            <div class="card-content">
                <strong>${t.titulo}</strong>
                <p class="desc">${t.descricao || '<i>Sem descrição</i>'}</p>
                
                <div class="exibicao-subtarefas" style="margin: 8px 0; border-left: 2px solid #ddd;">
                    ${listaSub}
                </div>

                ${t.data ? `<small>📅 Prazo: ${t.data}</small>` : ''}
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
   SALVAMENTO
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
    sincronizar();
};

window.moverTarefa = (id) => {
    const t = tarefas.find(x => x.id === id);
    if(t) {
        t.concluida = !t.concluida;
        sincronizar();
    }
};

window.excluirTarefa = (id) => {
    if(confirm("Deseja excluir?")) {
        tarefas = tarefas.filter(x => x.id !== id);
        sincronizar();
    }
};

document.getElementById('adicionar-tarefa-btn').onclick = () => {
    subtarefasLista.innerHTML = ''; 
    modal.classList.add('ativo');
};
document.getElementById('fechar-x-btn').onclick = () => modal.classList.remove('ativo');
filtro.onchange = renderizar;

carregarDados();
