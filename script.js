/* =============================
   ELEMENTOS DO DOM
============================= */
const listaPendentes = document.getElementById('lista-tarefas');
const listaConcluidas = document.getElementById('lista-concluidas');
const modal = document.getElementById('modal-tarefa');
const form = document.getElementById('form-tarefa');
const btnNovaTarefa = document.getElementById('adicionar-tarefa-btn');
const subtarefasLista = document.getElementById('subtarefas-lista');
const filtro = document.getElementById('filtro-prioridade');

/* INPUTS DO FORM */
const inputTitulo = document.getElementById('titulo-tarefa');
const inputDescricao = document.getElementById('descricao-tarefa');
const inputData = document.getElementById('data-tarefa');
const inputPrioridade = document.getElementById('prioridade-tarefa');

/* =============================
   ESTADO E UTILITÁRIOS
============================= */
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let editarId = null;

const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function salvar() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    renderizar();
}

/* =============================
   RENDERIZAÇÃO
============================= */
function renderizar() {
    listaPendentes.innerHTML = '';
    listaConcluidas.innerHTML = '';

    tarefas.forEach(t => {
        if (filtro.value !== 'todas' && t.prioridade !== filtro.value) return;

        const totalSub = t.subtarefas.length;
        const feitasSub = t.subtarefas.filter(s => s.concluida).length;
        const percentual = totalSub ? Math.round((feitasSub / totalSub) * 100) : 0;

        const li = document.createElement('li');
        li.className = `tarefa-card ${t.prioridade}`;
        li.draggable = true;
        li.dataset.id = t.id;

        li.innerHTML = `
            <strong>${t.titulo}</strong>
            <p>${t.descricao || 'Sem descrição'}</p>
            
            ${totalSub ? `
                <div class="progresso-container">
                    <div class="progresso-barra" style="width:${percentual}%"></div>
                </div>
                <small>${feitasSub}/${totalSub} subtarefas</small>
            ` : ''}

            <div class="sub-render">
                ${t.subtarefas.map(s => `
                    <div class="sub ${s.concluida ? 'concluida' : ''}" 
                         data-task="${t.id}" data-sub="${s.id}">
                        ${s.concluida ? '✅' : '⬜'} ${s.texto}
                    </div>
                `).join('')}
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
    const idTask = e.target.dataset.task || e.target.dataset.edit || e.target.dataset.delete || e.target.dataset.toggle;
    if (!idTask) return;

    // Toggle Subtarefa
    if (e.target.dataset.sub) {
        const t = tarefas.find(x => x.id === e.target.dataset.task);
        const s = t.subtarefas.find(x => x.id === e.target.dataset.sub);
        s.concluida = !s.concluida;
        salvar();
    }

    // Excluir
    if (e.target.dataset.delete) {
        if(confirm("Deseja realmente excluir esta tarefa?")) {
            tarefas = tarefas.filter(t => t.id !== e.target.dataset.delete);
            salvar();
        }
    }

    // Toggle Status (Concluída/Pendente)
    if (e.target.dataset.toggle) {
        const t = tarefas.find(t => t.id === e.target.dataset.toggle);
        t.concluida = !t.concluida;
        salvar();
    }

    // Abrir Edição
    if (e.target.dataset.edit) {
        editarId = e.target.dataset.edit;
        const t = tarefas.find(t => t.id === editarId);
        
        inputTitulo.value = t.titulo;
        inputDescricao.value = t.descricao;
        inputData.value = t.data;
        inputPrioridade.value = t.prioridade;

        subtarefasLista.innerHTML = '';
        t.subtarefas.forEach(s => adicionarInputSubtarefa(s.texto, s.id));
        
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
        const subAntiga = tAtual ? tAtual.subtarefas.find(s => s.id === idItem) : null;

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
    salvar();
};

/* =============================
   DRAG AND DROP
============================= */
function ativarDragDrop() {
    document.querySelectorAll('.tarefa-card').forEach(card => {
        card.ondragstart = e => e.dataTransfer.setData('id', card.dataset.id);
    });

    document.querySelectorAll('.coluna-kanban').forEach(coluna => {
        coluna.ondragover = e => e.preventDefault();
        
        coluna.ondragenter = () => coluna.style.background = "#e2e8f0";
        coluna.ondragleave = () => coluna.style.background = "#ebedf0";

        coluna.ondrop = e => {
            coluna.style.background = "#ebedf0";
            const id = e.dataTransfer.getData('id');
            const t = tarefas.find(x => x.id === id);
            t.concluida = coluna.dataset.status === 'concluida';
            salvar();
        };
    });
}

filtro.onchange = renderizar;
renderizar();