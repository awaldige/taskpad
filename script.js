/* =============================
   CONFIGURAÇÕES E ESTADO
============================= */
// 🔗 INSIRA A URL DO SEU BACKEND NO RENDER AQUI:
const API_URL = "https://catalogo-backend-e14g.onrender.com/tarefas"; 

let tarefas = [];
let editarId = null;

/* ELEMENTOS DO DOM */
const listaPendentes = document.getElementById('lista-tarefas');
const listaConcluidas = document.getElementById('lista-concluidas');
const modal = document.getElementById('modal-tarefa');
const form = document.getElementById('form-tarefa');
const btnNovaTarefa = document.getElementById('adicionar-tarefa-btn');
const subtarefasLista = document.getElementById('subtarefas-lista');
const filtro = document.getElementById('filtro-prioridade');

const inputTitulo = document.getElementById('titulo-tarefa');
const inputDescricao = document.getElementById('descricao-tarefa');
const inputData = document.getElementById('data-tarefa');
const inputPrioridade = document.getElementById('prioridade-tarefa');

/* =============================
   COMUNICAÇÃO COM API & STORAGE
============================= */

// Inicialização: Tenta carregar da API, se falhar, usa LocalStorage
async function inicializarApp() {
    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            tarefas = await res.json();
            console.log("✅ Dados carregados da API");
        } else {
            throw new Error();
        }
    } catch (err) {
        console.warn("⚠️ API offline. Carregando dados locais...");
        tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    }
    renderizar();
}

async function sincronizar() {
    // Atualiza o LocalStorage (sempre)
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    
    // Tenta salvar no Banco de Dados (API)
    try {
        await fetch(API_URL, {
            method: 'POST', // Ou PUT dependendo da sua rota de backend
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarefas)
        });
    } catch (err) {
        console.error("Falha ao sincronizar com servidor.");
    }
    renderizar();
}

const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

/* =============================
   RENDERIZAÇÃO
============================= */
function renderizar() {
    listaPendentes.innerHTML = '';
    listaConcluidas.innerHTML = '';

    tarefas.forEach(t => {
        if (filtro.value !== 'todas' && t.prioridade !== filtro.value) return;

        const totalSub = t.subtarefas ? t.subtarefas.length : 0;
        const feitasSub = t.subtarefas ? t.subtarefas.filter(s => s.concluida).length : 0;
        const percentual = totalSub ? Math.round((feitasSub / totalSub) * 100) : 0;

        const li = document.createElement('li');
        li.className = `tarefa-card ${t.prioridade}`;
        li.draggable = true;
        li.dataset.id = t.id;

        li.innerHTML = `
            <div class="card-info">
                <strong>${t.titulo}</strong>
                <p>${t.descricao || 'Sem descrição'}</p>
                ${t.data ? `<small class="prazo">📅 ${t.data}</small>` : ''}
            </div>
            
            ${totalSub ? `
                <div class="progresso-container">
                    <div class="progresso-barra" style="width:${percentual}%"></div>
                </div>
                <small>${feitasSub}/${totalSub} subtarefas</small>
            ` : ''}

            <div class="sub-render">
                ${t.subtarefas ? t.subtarefas.map(s => `
                    <div class="sub ${s.concluida ? 'concluida' : ''}" 
                         data-task="${t.id}" data-sub="${s.id}">
                        ${s.concluida ? '✅' : '⬜'} ${s.texto}
                    </div>
                `).join('') : ''}
            </div>

            <div class="tarefa-acoes">
                <button data-edit="${t.id}" title="Editar">✏️</button>
                <button data-toggle="${t.id}" title="Mover">${t.concluida ? '⬅️' : '✔️'}</button>
                <button data-delete="${t.id}" title="Excluir">🗑️</button>
            </div>
        `;

        (t.concluida ? listaConcluidas : listaPendentes).appendChild(li);
    });

    ativarDragDrop();
}

/* =============================
   EVENTOS (DELEGAÇÃO)
============================= */
document.body.addEventListener('click', e => {
    const target = e.target;
    const idTask = target.dataset.task || target.dataset.edit || target.dataset.delete || target.dataset.toggle;
    
    if (!idTask) return;

    // Toggle Subtarefa
    if (target.dataset.sub) {
        const t = tarefas.find(x => x.id === target.dataset.task);
        const s = t.subtarefas.find(x => x.id === target.dataset.sub);
        s.concluida = !s.concluida;
        sincronizar();
    }

    // Excluir
    if (target.dataset.delete) {
        if(confirm("Deseja realmente excluir esta tarefa?")) {
            tarefas = tarefas.filter(t => t.id !== target.dataset.delete);
            sincronizar();
        }
    }

    // Toggle Status (Mover entre colunas)
    if (target.dataset.toggle) {
        const t = tarefas.find(t => t.id === target.dataset.toggle);
        t.concluida = !t.concluida;
        sincronizar();
    }

    // Abrir Edição
    if (target.dataset.edit) {
        editarId = target.dataset.edit;
        const t = tarefas.find(t => t.id === editarId);
        
        inputTitulo.value = t.titulo;
        inputDescricao.value = t.descricao;
        inputData.value = t.data || '';
        inputPrioridade.value = t.prioridade;

        subtarefasLista.innerHTML = '';
        if(t.subtarefas) t.subtarefas.forEach(s => adicionarInputSubtarefa(s.texto, s.id));
        
        document.getElementById('modal-titulo').innerText = "Editar Tarefa";
        modal.classList.add('ativo');
    }
});

/* =============================
   MODAL E FORMULÁRIO
============================= */
function adicionarInputSubtarefa(texto = '', id = gerarId()) {
    const div = document.createElement('div');
    div.className = 'subtarefa-input';
    div.dataset.id = id;
    div.innerHTML = `
        <input type="text" value="${texto}" placeholder="Nome da subtarefa">
        <button type="button" tabindex="-1">❌</button>
    `;
    div.querySelector('button').onclick = () => div.remove();
    subtarefasLista.appendChild(div);
}

document.getElementById('adicionar-subtarefa-btn').onclick = () => adicionarInputSubtarefa();

btnNovaTarefa.onclick = () => {
    editarId = null;
    form.reset();
    subtarefasLista.innerHTML = '';
    document.getElementById('modal-titulo').innerText = "Nova Tarefa";
    modal.classList.add('ativo');
};

document.getElementById('fechar-modal-btn').onclick = 
document.getElementById('fechar-x-btn').onclick = () => modal.classList.remove('ativo');

form.onsubmit = e => {
    e.preventDefault();

    const novasSubtarefas = [...subtarefasLista.children].map(div => {
        const idItem = div.dataset.id;
        const tAtual = editarId ? tarefas.find(t => t.id === editarId) : null;
        const subAntiga = tAtual?.subtarefas?.find(s => s.id === idItem);

        return {
            id: idItem,
            texto: div.querySelector('input').value,
            concluida: subAntiga ? subAntiga.concluida : false
        };
    }).filter(s => s.texto.trim() !== "");

    const dados = {
        titulo: inputTitulo.value,
        descricao: inputDescricao.value,
        data: inputData.value,
        prioridade: inputPrioridade.value,
        subtarefas: novasSubtarefas
    };

    if (editarId) {
        const index = tarefas.findIndex(t => t.id === editarId);
        tarefas[index] = { ...tarefas[index], ...dados };
    } else {
        tarefas.push({ id: gerarId(), ...dados, concluida: false });
    }

    modal.classList.remove('ativo');
    sincronizar();
};

/* =============================
   DRAG AND DROP (DESKTOP)
============================= */
function ativarDragDrop() {
    document.querySelectorAll('.tarefa-card').forEach(card => {
        card.ondragstart = e => e.dataTransfer.setData('id', card.dataset.id);
    });

    document.querySelectorAll('.coluna-kanban').forEach(coluna => {
        coluna.ondragover = e => e.preventDefault();
        
        coluna.ondrop = e => {
            const id = e.dataTransfer.getData('id');
            const t = tarefas.find(x => x.id === id);
            if (t) {
                t.concluida = coluna.dataset.status === 'concluida';
                sincronizar();
            }
        };
    });
}

filtro.onchange = renderizar;

// Inicia a aplicação
inicializarApp();
