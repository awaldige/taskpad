/* =============================
   CONFIGURAÇÕES E ESTADO
============================= */
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

// Função de carregar modificada para funcionar no celular instantaneamente
async function carregarDados() {
    // 1. TENTA LER DO LOCALSTORAGE PRIMEIRO (Para o celular não ficar em branco)
    const dadosLocais = localStorage.getItem('tarefas');
    if (dadosLocais) {
        tarefas = JSON.parse(dadosLocais);
        renderizar();
        console.log("📱 Dados locais carregados");
    }

    // 2. TENTA BUSCAR NO RENDER EM SEGUNDO PLANO
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de limite

        const res = await fetch(API_URL, { signal: controller.signal });
        
        if (res.ok) {
            const dadosNuvem = await res.json();
            // Só atualiza se vier algo da nuvem
            if (dadosNuvem && dadosNuvem.length > 0) {
                tarefas = dadosNuvem;
                localStorage.setItem('tarefas', JSON.stringify(tarefas));
                renderizar();
                console.log("✅ Nuvem sincronizada");
            }
        }
    } catch (err) {
        console.warn("🌐 Servidor Render demorou ou está offline. Mantendo dados locais.");
    }
}

async function sincronizar() {
    // Salva localmente primeiro
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    renderizar();

    // Tenta mandar para o Render
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarefas)
        });
    } catch (err) {
        console.error("❌ Erro ao enviar para nuvem, mas salvo no dispositivo.");
    }
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
        <button type="button" onclick="this.parentElement.remove()" style="background:#fee2e2; color:#ef4444; padding:0 8px;">✕</button>
    `;
    subtarefasLista.appendChild(div);
}

function renderizar() {
    if (!listaPendentes || !listaConcluidas) return;
    
    listaPendentes.innerHTML = '';
    listaConcluidas.innerHTML = '';

    tarefas.forEach(t => {
        if (filtro.value !== 'todas' && t.prioridade !== filtro.value) return;

        const li = document.createElement('li');
        li.className = `tarefa-card ${t.prioridade}`;
        
        const listaSub = (t.subtarefas || []).map(s => `
            <div style="font-size: 0.8rem; color: #555; margin: 2px 0; display:flex; align-items:center; gap:5px;">
                ${s.concluida ? '✅' : '⬜'} ${s.texto}
            </div>
        `).join('');

        li.innerHTML = `
            <div class="card-content">
                <strong>${t.titulo}</strong>
                <p class="desc" style="font-size:0.85rem; color:#666;">${t.descricao || ''}</p>
                <div class="exibicao-subtarefas" style="margin: 8px 0; border-left: 2px solid #ddd; padding-left:8px;">
                    ${listaSub}
                </div>
                ${t.data ? `<small>📅 ${t.data}</small>` : ''}
            </div>
            <div class="tarefa-acoes" style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px; border-top:1px solid #eee; padding-top:8px;">
                <button onclick="moverTarefa('${t.id}')" style="background:#f0f0f0; padding:5px 10px;">${t.concluida ? '⬅️' : '✔️'}</button>
                <button onclick="excluirTarefa('${t.id}')" style="background:#fee2e2; color:red; padding:5px 10px;">🗑️</button>
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
    sincronizar();
};

window.moverTarefa = (id) => {
    const t = tarefas.find(x => x.id === id);
    if(t) { t.concluida = !t.concluida; sincronizar(); }
};

window.excluirTarefa = (id) => {
    if(confirm("Excluir esta tarefa?")) {
        tarefas = tarefas.filter(x => x.id !== id);
        sincronizar();
    }
};

document.getElementById('adicionar-tarefa-btn').onclick = () => {
    subtarefasLista.innerHTML = ''; 
    modal.classList.add('ativo');
};

document.getElementById('fechar-x-btn').onclick = () => modal.classList.remove('ativo');
document.getElementById('adicionar-subtarefa-btn').onclick = () => adicionarInputSubtarefa();
filtro.onchange = renderizar;

// Inicia o processo
carregarDados();
