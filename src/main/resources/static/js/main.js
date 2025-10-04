/**
 * @file Script principal para uma Single Page Application (SPA).
 * Gerencia o roteamento, carregamento de páginas, autenticação de usuário e
 * a exibição de dados dinâmicos da API.
 * @author Thalisson
 * @version 3.0.0
 */

/**
 * Elemento DOM principal onde o conteúdo das páginas é renderizado.
 * @type {HTMLElement}
 */
const appRoot = document.getElementById('app-root');

// =================================================================
// --- Gerenciamento de Estado Global ---
// =================================================================

/**
 * Armazena dados de suporte reutilizáveis, como listas para preencher seletores (dropdowns).
 * @type {Object}
 * @property {Array<Object>} [materias] - Lista de matérias carregadas da API.
 */
let supportData = {};

/**
 * Página atual para requisições paginadas. O índice começa em 0.
 * @type {number}
 */
let currentPage = 0;

/**
 * Número de itens a serem exibidos por página.
 * @type {number}
 */
let itemsPerPage = 10;

/**
 * Objeto que armazena os filtros ativos atualmente para as listas de dados.
 * @type {Object}
 * @property {string} materiaId - ID da matéria selecionada para filtro.
 */
let currentFilters = {
    materiaId: ''
};

let estadoSimuladoAtivo = {
    tentativaId: null,
    questoes: [],
    respostasUsuario: {}, // { topicoId: alternativaId }
    questaoAtual: 0,
    resultado: null
};

// =================================================================
// --- Roteamento ---
// =================================================================

/**
 * Mapeia as hashes da URL para os arquivos HTML correspondentes.
 * @type {Object<string, string>}
 */
const routes = {
    '#login': 'pages/login.html',
    '#forgot-password': 'pages/forgotenPassword.html',
    '#register': 'pages/register.html',
    '#dashboard': 'pages/dashboard.html',
    '#video-class': 'pages/classes.html',
    '#subject/video-class': 'pages/class-list.html',
    '#summarys': 'pages/summarys.html',
    '#subject/summarys': 'pages/summarys-by-materia.html',
    '#subject/summary-detail': 'pages/summary-detail.html',
    '#pratice-exam': 'pages/pratice-exams.html',
    '#pratice-exam/active': 'pages/pratice-exams-active.html',
    '#pratice-exam/result': 'pages/pratice-exams-result.html',
};

/**
 * Gerencia a navegação e o carregamento de páginas com base na hash da URL.
 * Essa é a função central do roteador.
 */
function handleRouteChange() {
    const hash = window.location.hash || '#login';

    const baseRoute = hash.split('?')[0];

    const pageUrl = routes[baseRoute] || routes['#login'];

    updateActiveNavLink(hash);
    updateBodyClass(hash);
    loadPage(pageUrl);
}

/**
 * Carrega o conteúdo de um arquivo HTML na div principal 'app-root'.
 * @param {string} url - O caminho para o arquivo HTML a ser carregado.
 */
async function loadPage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Página não encontrada: ${response.statusText}`);
        }

        appRoot.innerHTML = await response.text();
        updateActiveNavLink(window.location.hash || '#login');

        // Após o HTML ser inserido, executa as ações específicas da página.
        executePageScripts();
        attachCommonFormListeners();
        await attachPageSpecificLogic();
        
        // Reinicializar o menu mobile após carregar a nova página
        if (window.MobileMenu) {
            setTimeout(() => {
                window.MobileMenu.init();
            }, 100);
        }

    } catch (error) {
        appRoot.innerHTML = `<p style="text-align: center; margin-top: 2rem;">Erro 404: Página não encontrada.</p>`;
    }
}

/**
 * Renderiza os cards de matéria na tela usando os dados reais de progresso.
 * (Versão atualizada para usar o campo 'percentualConclusao')
 */
function renderMateriasCardsWithProgress(materias) {
    const gridContainer = document.getElementById('materias-grid');
    if (!gridContainer) return;

    if (!materias || materias.length === 0) {
        gridContainer.innerHTML = '<p>Nenhuma matéria encontrada.</p>';
        return;
    }

    const cardsHtml = materias.map(materia => {
        const progressoReal = materia.percentualConclusao.toFixed(0);

        return `
            <div class="card">
                <h3>${materia.nome}</h3>
                <p>Progresso da matéria:</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressoReal}%;">${progressoReal}%</div>
                </div>
                <a href="#subject/video-class?materiaId=${materia.id}" class="card-link">Ver aulas</a>
            </div>
        `;
    }).join('');

    gridContainer.innerHTML = cardsHtml;
}

// Função para carregar o histórico de simulados do usuário logado
async function carregarHistoricoSimulados() {
    try {
        // Faz requisição para buscar o histórico do usuário logado
        const response = await fetch('/api/tentativas-simulados/meu-historico', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Importante para incluir cookies de autenticação
        });

        if (response.status === 401 || response.status === 403) {
            console.error('Usuário não autenticado');
            mostrarMensagemErro('Você precisa estar logado para ver o histórico.');
            return;
        }

        if (!response.ok) {
            throw new Error('Erro ao carregar histórico de simulados');
        }

        const historico = await response.json();

        // Exibe o histórico na página
        exibirHistoricoSimulados(historico);
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        mostrarMensagemErro('Não foi possível carregar o histórico de simulados.');
    }
}

// Função para exibir o histórico na tela
function exibirHistoricoSimulados(historico) {
    const container = document.querySelector('.simulado-historico');

    if (!container) {
        console.error('Container de histórico não encontrado');
        return;
    }

    // Remove a mensagem de placeholder
    const placeholderMsg = container.querySelector('.placeholder-message');
    if (placeholderMsg) {
        placeholderMsg.remove();
    }

    // Se não houver histórico, mostra mensagem
    if (!historico || historico.length === 0) {
        container.innerHTML = `
            <h3>Histórico de Simulados</h3>
            <p class="placeholder-message">Você ainda não realizou nenhum simulado.</p>
        `;
        return;
    }

    // Cria a lista de simulados
    let historicoHTML = '<h3>Histórico de Simulados</h3>';
    historicoHTML += '<div class="historico-lista">';

    historico.forEach(tentativa => {
        const dataInicio = new Date(tentativa.dataInicio);
        const dataFim = tentativa.dataFim ? new Date(tentativa.dataFim) : null;
        const pontuacao = tentativa.pontuacaoFinal ? tentativa.pontuacaoFinal.toFixed(2) : 'N/A';

        // Calcula o status
        const status = dataFim ? 'Concluído' : 'Em andamento';
        const statusClass = dataFim ? 'concluido' : 'em-andamento';

        historicoHTML += `
            <div class="historico-item ${statusClass}">
                <div class="historico-info">
                    <div class="historico-data">
                        <strong>Data:</strong> ${formatarData(dataInicio)}
                    </div>
                    <div class="historico-status">
                        <span class="badge badge-${statusClass}">${status}</span>
                    </div>
                </div>
                <div class="historico-detalhes">
                    ${dataFim ? `
                        <div class="historico-pontuacao">
                            <strong>Pontuação:</strong> ${pontuacao}%
                        </div>
                        <div class="historico-duracao">
                            <strong>Concluído em:</strong> ${formatarData(dataFim)}
                        </div>
                    ` : `
                        <div class="historico-em-progresso">
                            <em>Simulado ainda em andamento</em>
                        </div>
                    `}
                </div>
                ${dataFim ? `
                    <button class="btn-detalhes" onclick="verDetalhesSimulado(${tentativa.id})">
                        Ver Detalhes
                    </button>
                ` : ''}
            </div>
        `;
    });

    historicoHTML += '</div>';
    container.innerHTML = historicoHTML;
}

// Função auxiliar para formatar data
function formatarData(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const minuto = String(d.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

// Função para ver detalhes de um simulado específico
function verDetalhesSimulado(tentativaId) {
    // Redireciona para a página de resultados do simulado
    window.location.href = `/pages/pratice-exams-result.html?tentativaId=${tentativaId}`;
}

// Função para mostrar mensagem de erro
function mostrarMensagemErro(mensagem) {
    const container = document.querySelector('.simulado-historico');
    if (container) {
        container.innerHTML = `
            <h3>Histórico de Simulados</h3>
            <div class="alert alert-error">
                <p>${mensagem}</p>
            </div>
        `;
    }
}

// Carrega o histórico quando a página estiver pronta
document.addEventListener('DOMContentLoaded', () => {
    carregarHistoricoSimulados();
});


/**
 * Renderiza os cards de matéria na tela SEM usar os dados reais de progresso.
 */
function renderMateriasCardsWithNoProgress(materias) {
    const gridContainer = document.getElementById('materias-grid');
    if (!gridContainer) return;

    if (!materias || materias.length === 0) {
        gridContainer.innerHTML = '<p>Nenhuma matéria encontrada.</p>';
        return;
    }

    const cardsHtml = materias.map(materia => {

        return `
            <div class="card">
                <h3>${materia.nome}</h3>
                <a href="#subject/summarys?materiaId=${materia.id}" class="card-link">Ver resumos <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></a>
            </div>
        `;
    }).join('');

    gridContainer.innerHTML = cardsHtml;
}

/**
 * Anexa a lógica específica para cada página após seu carregamento.
 * Isso garante que os elementos do DOM existam antes de manipularmos eles.
 */
async function attachPageSpecificLogic() {
    const hash = window.location.hash || '#login';

    // Lógica para páginas que exigem dados do usuário (dashboard, aulas, etc.)
    if (hash.startsWith('#dashboard') || hash.startsWith('#video-class')) {
        await Promise.all([
            populateUserData(),
            (async () => {
                const estatisticas = await fetchEstatisticasUsuario();
                populateDashboardStats(estatisticas);
            })()
        ]);
    }

    // Lógica específica para a página de videoaulas
    if (hash.startsWith('#video-class')) {
        await populateUserData();
        await loadSupportData();
        populateFilterDropdowns();
        attachClassPageListeners();
        await loadMaterias();
    }

    // Lógica específica para a página de videoaulas por materias
    else if (hash.startsWith('#subject/video-class')) {
        await populateUserData();
        await handleAulasPage();
    }

    // Lógica específica para a página de videoaulas
    else if (hash.startsWith('#summarys')) {
        await populateUserData();
        await loadSupportData();
        await loadMateriasWithoutProgress();
    }

    // Lógica específica para a página de resumos por materias
    else if (hash.startsWith('#subject/summarys')) {
        await populateUserData();
        attachClassPageListeners();
        await handleResumosListPage();
    }

    else if (hash.startsWith('#subject/summary-detail')) {
        await populateUserData();
        await handleResumoDetailPage();
    }

    else if (hash.startsWith('#pratice-exam')) {
        await populateUserData();
        if (hash === '#pratice-exam') {
            await handleSimuladosStartPage();
        } else if (hash === '#pratice-exam/active') {
            await handleSimuladoActivePage();
        } else if (hash === '#pratice-exam/result') {
            await handleSimuladoResultPage();
        }
    }
}


// =================================================================
// --- API Calls & Gerenciamento de Dados ---
// =================================================================

/**
 * Busca os dados do usuário atualmente autenticado na API.
 * @returns {Promise<Object>} Os dados do usuário.
 * @throws {Error} Se o usuário não estiver autenticado.
 */
async function fetchCurrentUser() {
    const response = await fetch(`/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include', // Envia cookies de autenticação
    });
    if (!response.ok) throw new Error('Usuário não autenticado');
    return response.json();
}

/**
 * Busca no backend a lista de aulas para uma matéria específica.
 * @param {number} materiaId - O ID da matéria.
 * @returns {Promise<Array>} - Uma promessa que resolve para a lista de aulas.
 */
async function fetchAulasPorMateria(materiaId) {
    const url = `/api/v1/aulas/by-materia/${materiaId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            // Se a resposta não for OK, tenta ler a mensagem de erro do backend
            const errorText = await response.text();
            throw new Error(errorText || `Erro ao buscar aulas para a matéria ${materiaId}`);
        }

        // Se a resposta for OK, retorna os dados em formato JSON
        return response.json();

    } catch (error) {
        // Retorna um array vazio em caso de erro para não quebrar a interface
        return [];
    }
}

/**
 * Adiciona os 'escutadores' de evento para os botões de análise com IA,
 * com controle de modal moderno (animações e loader).
 */
function attachAiButtonListeners() {

    const revisaoContainer = document.getElementById('revisao-questoes-container');
    const modal = document.getElementById('ai-modal');
    const modalBody = document.getElementById('ai-modal-body');
    const closeModalBtn = document.getElementById('ai-modal-close');

    const loaderHTML = `
            <div class="gemini-loader">
            <svg width="60" height="60" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <style>
                    .gemini-star-outer {
                        fill: #004aad;
                        transform-origin: center;
                        animation: spin 2s linear infinite;
                    }
                </style>
                <g class="gemini-star-outer">
                    <path d="M12 2L9.404 9.404L2 12L9.404 14.596L12 22L14.596 14.596L22 12L14.596 9.404L12 2Z"/>
                </g>
            </svg>
        </div>
        <p style="text-align: center; color: #333;">O bp está analisando, aguarde um instante...</p>
    `;

    if (!revisaoContainer || !modal) {
        return;
    }

    revisaoContainer.addEventListener('click', async (event) => {

        const target = event.target.closest('.btn-ai-explain');

        if (!target) return;

        const topico = target.dataset.topico;
        const respostaCorreta = target.dataset.respostaCorreta;
        const justificativa = target.dataset.justificativa;

        modalBody.innerHTML = loaderHTML;
        modal.classList.add('visible');

        // O resto do seu código...
        const prompt = `
            Você é Backpack, um assistente virtual de uma plataforma de ensino de inglês voltada para vestibulandos.  
            Seu público é formado por jovens estudantes do ensino médio que estão se preparando para o vestibular.  
            Sua missão é explicar conceitos de forma clara, didática, motivadora e acessível.
            
            INSTRUÇÕES IMPORTANTES:
            1. Sempre use uma linguagem jovem, simples e próxima do aluno, evitando jargões técnicos complicados.  
            2. Explique o conceito passo a passo, garantindo que mesmo quem está começando consiga entender.  
            3. Mostre por que a alternativa correta realmente faz sentido, conectando a explicação ao tópico de estudo.  
            4. Se possível, use exemplos práticos ou situações do cotidiano que ajudem o aluno a visualizar a aplicação do conceito.  
            5. Use Markdown para organizar a resposta, tornando-a mais agradável de ler (títulos, negrito, itálico, exemplos formatados).  
            6. O tom deve ser positivo e amigável, como se fosse um colega de estudos mais experiente explicando o assunto.  
            
            DADOS DA QUESTÃO:
            - Tópico de estudo: "${topico}"  
            - Resposta correta: "${respostaCorreta}"  
            - Justificativa fornecida: "${justificativa}"  
            
            TAREFA:
            Explique em mais detalhes o tópico acima, reforçando por que a resposta correta está certa e ampliando a justificativa.  
            Finalize com um exemplo prático em Markdown que ajude a fixar o conteúdo.`;

        try {
            const aiResponse = await fetchGeminiExplanation(prompt);
            modalBody.innerHTML = marked.parse(aiResponse.conteudo);
        } catch (error) {
            modalBody.innerHTML = '<p style="color: #d90429;">Epa! Tivemos um problema para contatar o bp. Por favor, tente novamente mais tarde.</p>';
        }
    });

    const closeModal = () => modal.classList.remove('visible');
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
}

document.addEventListener('DOMContentLoaded', attachAiButtonListeners);


/**
 * Envia um prompt para a API do Gemini no backend.
 */
async function fetchGeminiExplanation(prompt) {
    try {
        const response = await fetch(`/api/v1/ai/gemini/sync/analise-questao`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        if (!response.ok) throw new Error('Falha na resposta da IA.');
        const textoDaResposta = await response.text();

        return { conteudo: textoDaResposta };

    } catch (error) {
        return { conteudo: "Desculpe, não foi possível obter uma análise da IA neste momento." };
    }
}

async function gerarSimulado(materiaId) {
    const response = await fetch(`/api/v1/simulados/gerar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materiaId })
    });
    if (!response.ok) throw new Error('Falha ao gerar simulado');
    return await response.json();
}

async function submeterSimulado(submissao) {
    const response = await fetch(`/api/v1/simulados/submeter`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissao)
    });
    if (!response.ok) throw new Error('Falha ao submeter simulado');
    return await response.json();
}

// Função para a página inicial de simulados
async function handleSimuladosStartPage() {
    // Buscar todas as matérias e popular o select
    const selectMaterias = document.getElementById('select-materia-simulado');
    const btnGerar = document.getElementById('btn-gerar-simulado');

    try {
        // Buscar matérias da API
        const materias = await fetchMaterias();

        if (materias && materias.content && materias.content.length > 0) {
            // Gerar as opções do select com as matérias disponíveis
            const opcoesHtml = materias.content.map(materia => 
                `<option value="${materia.id}">${materia.nome}</option>`
            ).join('');

            selectMaterias.innerHTML = opcoesHtml;
            btnGerar.disabled = false;
        } else {
            selectMaterias.innerHTML = `<option value="">Nenhuma matéria disponível</option>`;
            btnGerar.disabled = true;
        }
    } catch (error) {
        selectMaterias.innerHTML = `<option value="">Erro ao carregar matérias</option>`;
        btnGerar.disabled = true;
    }

    btnGerar.onclick = async () => {
        const materiaId = selectMaterias.value;
        if (!materiaId) {
            alert('Por favor, selecione uma matéria');
            return;
        }

        btnGerar.textContent = 'Gerando...';
        btnGerar.disabled = true;

        try {
            const simuladoData = await gerarSimulado(Number(materiaId));

            estadoSimuladoAtivo = {
                tentativaId: simuladoData.tentativaId,
                questoes: simuladoData.questoes,
                respostasUsuario: {},
                questaoAtual: 0,
                resultado: null
            };

            window.location.hash = '#pratice-exam/active';
        } catch (error) {
            alert('Não foi possível gerar o simulado. Tente novamente mais tarde.');
            btnGerar.textContent = 'Gerar Simulado';
            btnGerar.disabled = false;
        }
    };
}

// Função principal para a página do simulado ativo
function handleSimuladoActivePage() {
    if (!estadoSimuladoAtivo || !estadoSimuladoAtivo.questoes || estadoSimuladoAtivo.questoes.length === 0) {
        window.location.hash = '#pratice-exam';
        return;
    }

    const btnAnterior = document.getElementById('btn-anterior');
    const btnProximo = document.getElementById('btn-proximo');
    const questaoContainer = document.getElementById('questao-container');

    function renderizarQuestao() {
        const totalQuestoes = estadoSimuladoAtivo.questoes.length;
        document.getElementById('current-question-number').textContent = estadoSimuladoAtivo.questaoAtual + 1;
        document.getElementById('total-question-number').textContent = totalQuestoes;

        const questao = estadoSimuladoAtivo.questoes[estadoSimuladoAtivo.questaoAtual];

        // Verifica se a questão existe
        if (!questao) {
            questaoContainer.innerHTML = '<p class="error-message">Erro ao carregar questão</p>';
            return;
        }

        const alternativasHtml = questao.alternativas.map(alt => {
            const isChecked = estadoSimuladoAtivo.respostasUsuario[questao.topicoId] === alt.id;
            return `
                <label class="alternativa-label ${isChecked ? 'selected' : ''}">
                    <input type="radio" name="alternativa" value="${alt.id}" ${isChecked ? 'checked' : ''}>
                    <span>${alt.textoAfirmativa}</span>
                </label>
            `;
        }).join('');

        questaoContainer.innerHTML = `
            <div class="questao-card">
                <h2 class="questao-titulo">Questão ${estadoSimuladoAtivo.questaoAtual + 1}</h2>
                <div class="alternativas-group">${alternativasHtml}</div>
            </div>
        `;

        // Adiciona eventos de clique nas alternativas
        questaoContainer.querySelectorAll('input[name="alternativa"]').forEach(radio => {
            radio.onchange = (e) => {
                estadoSimuladoAtivo.respostasUsuario[questao.topicoId] = Number(e.target.value);
                // Atualiza a visualização para mostrar a seleção
                document.querySelectorAll('.alternativa-label').forEach(label => {
                    label.classList.remove('selected');
                });
                e.target.closest('.alternativa-label').classList.add('selected');
            };
        });

        // Atualiza estado dos botões
        btnAnterior.disabled = estadoSimuladoAtivo.questaoAtual === 0;
        if (estadoSimuladoAtivo.questaoAtual === totalQuestoes - 1) {
            btnProximo.textContent = 'Finalizar';
            btnProximo.classList.add('btn-finalizar');
        } else {
            btnProximo.textContent = 'Próxima';
            btnProximo.classList.remove('btn-finalizar');
        }
    }

    btnAnterior.onclick = () => {
        if (estadoSimuladoAtivo.questaoAtual > 0) {
            estadoSimuladoAtivo.questaoAtual--;
            renderizarQuestao();
        }
    };

    btnProximo.onclick = async () => {
        const totalQuestoes = estadoSimuladoAtivo.questoes.length;
        if (estadoSimuladoAtivo.questaoAtual < totalQuestoes - 1) {
            estadoSimuladoAtivo.questaoAtual++;
            renderizarQuestao();
        } else {
            // Verificar se todas as questões foram respondidas
            const questoesRespondidas = Object.keys(estadoSimuladoAtivo.respostasUsuario).length;
            if (questoesRespondidas !== totalQuestoes) {
                const faltam = totalQuestoes - questoesRespondidas;
                alert(`Ainda falta${faltam > 1 ? 'm' : ''} responder ${faltam} questão(ões). Por favor, navegue pelas questões e responda todas.`);
                return;
            }

            // Finalizar o simulado
            btnProximo.textContent = 'Enviando...';
            btnProximo.disabled = true;

            try {
                const submissao = {
                    tentativaId: estadoSimuladoAtivo.tentativaId,
                    respostas: estadoSimuladoAtivo.respostasUsuario
                };
                const resultado = await submeterSimulado(submissao);
                estadoSimuladoAtivo.resultado = resultado;
                window.location.hash = '#pratice-exam/result';
            } catch (error) {
                alert('Houve um erro ao enviar suas respostas. Tente novamente.');
                btnProximo.textContent = 'Finalizar Simulado';
                btnProximo.disabled = false;
            }
        }
    };

    // Renderiza a primeira questão ao carregar a página
    renderizarQuestao();
}

// Função para a página de resultados
function handleSimuladoResultPage() {
    const resultado = estadoSimuladoAtivo.resultado;
    if (!resultado) {
        window.location.hash = '#pratice-exam';
        return;
    }

    // Atualiza o cabeçalho da página
    const pageTitle = document.querySelector('.dashboard-header h1');
    if (pageTitle) {
        pageTitle.textContent = 'Resultado do Simulado';
    }

    // Preenche os dados do resumo
    document.getElementById('pontuacao-final').textContent = `${resultado.pontuacaoFinal.toFixed(0)}%`;
    document.getElementById('total-acertos').textContent = resultado.acertos;
    document.getElementById('total-questoes').textContent = resultado.totalQuestoes;

    // Renderiza a revisão de cada questão
    const revisaoContainer = document.getElementById('revisao-questoes-container');
    const revisaoHtml = resultado.questoesCorrigidas.map((q, index) => `
        <div class="revisao-item card ${q.acertou ? 'correta' : 'incorreta'}">
            <div class="revisao-header">
                <span class="questao-numero">Questão ${index + 1}</span>
                <span class="status-badge ${q.acertou ? 'acerto' : 'erro'}">${q.acertou ? 'Acerto' : 'Erro'}</span>
            </div>

            <div class="revisao-detalhes">
                <p><strong>Sua resposta:</strong> ${q.textoAlternativaEscolhida || 'Não respondida'}</p>
                <p><strong>Resposta Correta:</strong> ${q.textoAlternativaCorreta}</p>
                ${q.justificativa ? `<div class="justificativa"><p><strong>Justificativa:</strong> ${q.justificativa}</p></div>` : ''}
            </div>

            <div class="card-footer">
                <button class="btn-ai-explain" 
                        data-topico="${q.tituloTopico}" 
                        data-resposta-correta="${q.textoAlternativaCorreta}"
                        data-justificativa="${q.justificativa || ''}">
                    <img 
                      src="https://cdn.simpleicons.org/googlegemini/blue" 
                      alt="Google Gemini Logo" 
                      width="24" 
                      height="24"
                    />
                    <span>Analisar com IA</span>
                </button>
            </div>
        </div>
    `).join('');

    revisaoContainer.innerHTML = revisaoHtml;

    // Adiciona botão para voltar à página inicial de simulados
    revisaoContainer.innerHTML += `
        <div class="actions-footer">
            <button id="btn-novo-simulado" class="btn-primary">Fazer Novo Simulado</button>
        </div>
    `;

    // Adiciona evento ao botão de novo simulado
    document.getElementById('btn-novo-simulado').onclick = () => {
        window.location.hash = '#pratice-exam';
    };

    // Ativa os botões de análise com IA
    attachAiButtonListeners();
}

/**
 * Busca a LISTA de resumos para uma matéria específica.
 */
async function fetchResumosPorMateria(materiaId) {
    const url = `/api/v1/resumo/by-materia/${materiaId}`;
    try {
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Falha ao buscar a lista de resumos.');
        return await response.json();
    } catch (error) {
        return [];
    }
}

/**
 * Busca o progresso de todos os resumos para o usuário logado.
 * Retorna um mapa para consulta rápida: { resumoId: "dataDeLeitura" }
 */
async function fetchProgressoResumos() {
    try {
        const response = await fetch(`/api/v1/progresso-resumo`, { // Confirme a URL base
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Falha ao buscar progresso dos resumos');

        const progressos = await response.json();
        // Transforma o array em um mapa para acesso rápido
        return progressos.reduce((map, progresso) => {
            map[progresso.resumoId] = progresso.dataVisualizacao;
            return map;
        }, {});
    } catch (error) {
        return {};
    }
}

/**
 * Envia uma requisição para marcar um resumo como lido.
 * @param {number} resumoId - O ID do resumo a ser marcado.
 */
async function marcarResumoComoLido(resumoId) {
    try {
        const response = await fetch(`/api/v1/progresso-resumo/${resumoId}`, { // Confirme a URL base
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Falha ao marcar resumo como lido');
        return await response.json();
    } catch (error) {
        return null;
    }
}

/**
 * Busca os dados de UM ÚNICO resumo pelo seu ID.
 */
async function fetchResumoPorId(resumoId) {
    const url = `/api/v1/resumo/${resumoId}`;
    try {
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Falha ao buscar o resumo.');
        return await response.json();
    } catch (error) {
        return null;
    }
}

/**
 * Busca a lista de todas as matérias da API.
 * @returns {Promise<Array<Object>>} Uma lista de matérias.
 * @throws {Error} Se a requisição falhar.
 */
async function fetchMaterias() {
    const response = await fetch(`/api/v1/materias`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Falha ao buscar matérias');
    return response.json();
}

/**
 * Busca o progresso de todas as aulas para o usuário logado.
 * Retorna um mapa para consulta rápida: { aulaId: "status" }
 */
async function fetchProgressoAulas() {
    try {
        const response = await fetch(`/api/v1/progresso`, { // Confirme se a URL base é /progresso
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Falha ao buscar progresso');

        const progressos = await response.json(); // ex: [{aulaId: 1, status: 'CONCLUIDO'}, ...]

        // Transforma o array em um mapa para acesso O(1)
        return progressos.reduce((map, progresso) => {
            map[progresso.aulaId] = progresso.status;
            return map;
        }, {});
    } catch (error) {
        return {}; // Retorna um mapa vazio em caso de erro
    }
}

/**
 * Busca as estatísticas de progresso do usuário logado na API.
 * @returns {Promise<EstatisticasUsuarioDTO|null>}
 */
async function fetchEstatisticasUsuario() {
    try {
        const response = await fetch(`/api/v1/estatisticas/meu-progresso`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Falha ao buscar estatísticas do usuário.');
        }
        return await response.json();
    } catch (error) {
        return null; // Retorna nulo em caso de erro
    }
}

/**
 * Envia uma requisição para marcar uma aula como 'CONCLUIDA'.
 * @param {number} aulaId - O ID da aula a ser marcada.
 */
async function marcarAulaComoConcluida(aulaId) {
    try {
        const response = await fetch(`/api/v1/progresso/${aulaId}`, { // Confirme se a URL base é /progresso
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'CONCLUIDO' }) // O status que você quer enviar
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Falha ao marcar progresso');
        }

        return await response.json();
    } catch (error) {
        return null;
    }
}

/**
 * Carrega dados de suporte (como matérias) para preencher filtros.
 * Utiliza caching em memória para evitar requisições repetidas.
 */
async function loadSupportData() {
    try {
        // Se os dados já foram carregados, não faz nova requisição.
        if (supportData.materias) return;
        const pageData = await fetchMaterias();
        supportData.materias = pageData.content;

    } catch (error) {
    }
}

/**
 * Carrega a lista de matérias COM O PROGRESSO do usuário.
 * (Versão atualizada para usar o novo endpoint)
 */
async function loadMaterias() {
    // 1. A URL agora aponta para o novo endpoint que já calcula o progresso.
    const url = `/api/v1/materias/meu-progresso`;

    try {
        const response = await fetch(url, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Falha ao carregar matérias com progresso.');

        // 2. A resposta agora é um array direto de matérias com o campo 'percentualConclusao'.
        const materiasComProgresso = await response.json();

        // 3. Renderiza os cards com os dados recebidos.
        renderMateriasCardsWithProgress(materiasComProgresso);

    } catch (error) {
    }
}

/**
 * Carrega a lista de matérias COM O PROGRESSO do usuário.
 */
async function loadMateriasWithoutProgress() {
    // 1. A URL agora aponta para o novo endpoint que já calcula o progresso.
    const url = `/api/v1/materias/meu-progresso`;

    try {
        const response = await fetch(url, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Falha ao carregar matérias sem progresso.');
        const materiasComProgresso = await response.json();

        renderMateriasCardsWithNoProgress(materiasComProgresso);

    } catch (error) {
    }
}

/**
 * Submete os dados de registro de um novo usuário para a API.
 * @param {Object} userData - Dados do usuário para registro.
 */
async function registerUser(userData) {
    const response = await fetch(`/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nomeCompleto: userData.name,
            email: userData.email,
            idade: parseInt(userData.idade, 10),
            senha: userData.password
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao registrar');
    }
}


// =================================================================
// --- Renderização e Manipulação do DOM ---
// =================================================================

/**
 * Atualiza o link de navegação ativo na barra lateral.
 * @param {string} currentHash - A hash da URL atual (ex: '#dashboard').
 */
function updateActiveNavLink(currentHash) {
    const navContainer = document.getElementById('sidebar-nav');
    if (!navContainer) return;

    const navLinks = navContainer.querySelectorAll('a.nav-link');
    navLinks.forEach(link => {
        // Compara o hash do link com o hash atual e adiciona/remove a classe 'active'.
        link.classList.toggle('active', link.hash === currentHash);
    });
}

/**
 * Altera a classe do `<body>` para permitir estilização específica por página.
 * @param {string} hash - A hash da URL atual.
 */
function updateBodyClass(hash) {
    if (hash.startsWith('#dashboard')) {
        document.body.className = 'dashboard-view';
    } else if (hash.startsWith('#video-class')) {
        document.body.className = 'classes-view';
    } else if (hash.startsWith('#subject/video-class')) {
        document.body.className = 'classes-view';
    } else if (hash.startsWith('#summarys')) {
        document.body.className = 'summarys-view';
    } else if (hash.startsWith('#subject/summarys')) {
        document.body.className = 'summarys-view';
    } else if (hash.startsWith('#subject/summary-detail')) {
        document.body.className = 'summarys-view';
    } else if (hash.startsWith('#pratice-exam')) {
        document.body.className = 'pratice-exams-view';
    }else {
        document.body.className = 'auth-view';
    }
}

/**
 * Preenche os dados do usuário na interface (banner de boas-vindas, header, etc.).
 */
async function populateUserData() {
    try {
        const user = await fetchCurrentUser();

        const welcomeBanner = document.getElementById('welcome-banner');
        const headerUserName = document.getElementById('header-user-name');
        const userAvatar = document.getElementById('user-avatar');

        const firstName = user.nomeCompleto.split(' ')[0];

        if (welcomeBanner) {
            welcomeBanner.querySelector('h2').textContent = `Olá, ${firstName}! 👋`;
        }
        if (headerUserName) {
            headerUserName.textContent = user.nomeCompleto;
        }
        if (userAvatar) {
            const initial = user.nomeCompleto.charAt(0).toUpperCase();
            userAvatar.src = `https://placehold.co/40x40/004aad/white?text=${initial}`;
            userAvatar.alt = `Avatar de ${user.nomeCompleto}`;
        }
    } catch (error) {
        window.location.hash = '#login';
    }
}

/**
 * Preenche os cards do dashboard com os dados de estatísticas.
 * @param {EstatisticasUsuarioDTO} estatisticas - O objeto com os dados vindo da API.
 */
function populateDashboardStats(estatisticas) {
    // Seleciona os elementos das AULAS
    const elAulasVistas = document.getElementById('stat-aulas-vistas');
    const elAulasPendentes = document.getElementById('stat-aulas-pendentes');

    // Seleciona os elementos dos RESUMOS
    const elResumosLidos = document.getElementById('stat-resumos-lidos');
    const elResumosPendentes = document.getElementById('stat-resumos-pendentes');

    if (estatisticas && estatisticas.aulas && estatisticas.resumos) {

        // Popula os cards de AULAS
        if (elAulasVistas) elAulasVistas.textContent = estatisticas.aulas.aulasVistas;
        if (elAulasPendentes) elAulasPendentes.textContent = estatisticas.aulas.aulasPendentes;

        // Popula os cards de RESUMOS
        if (elResumosLidos) elResumosLidos.textContent = estatisticas.resumos.resumosCompletados;
        if (elResumosPendentes) elResumosPendentes.textContent = estatisticas.resumos.resumosPendentes;

    } else {
        const errorMessage = 'N/D';
        if (elAulasVistas) elAulasVistas.textContent = errorMessage;
        if (elAulasPendentes) elAulasPendentes.textContent = errorMessage;
        if (elResumosLidos) elResumosLidos.textContent = errorMessage;
        if (elResumosPendentes) elResumosPendentes.textContent = errorMessage;
    }
}

/**
 * Preenche os seletores (dropdowns) de filtro com os dados carregados.
 */
function populateFilterDropdowns() {
    const populate = (id, data, nameProp, valueProp = 'id') => {
        const select = document.getElementById(id);
        if (!select || !data) return;

        select.innerHTML = `<option value="">Todos</option>`; // Opção padrão
        data.forEach(item => {
            select.add(new Option(item[nameProp], item[valueProp]));
        });
    };

    populate('filter-materia', supportData.materias, 'nome');
}

/**
 * Renderiza os controles de paginação (botões, sumário, etc.) na página.
 * @param {Object} pageData - O objeto de paginação retornado pela API.
 */
function renderPaginationControls(pageData) {
    const container = document.getElementById('pagination-materias');
    if (!container) return;

    // A API pode retornar um objeto de página dentro de outro objeto. Ajuste se necessário.
    const page = pageData.page || pageData;
    const { number: pageIndex, size, totalElements, totalPages, first, last } = page;
    const numberOfElements = pageData.content ? pageData.content.length : 0;

    if (totalElements === 0) {
        container.innerHTML = '<div class="pagination-summary">Nenhum item encontrado.</div>';
        return;
    }

    const startItem = pageIndex * size + 1;
    const endItem = startItem + numberOfElements - 1;

    container.innerHTML = `
        <div class="pagination-summary">Mostrando <strong>${startItem}</strong>-<strong>${endItem}</strong> de <strong>${totalElements}</strong></div>
        <div class="pagination-size">
            <label for="items-per-page-materias">Itens:</label>
            <select id="items-per-page-materias">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
            </select>
        </div>
        <div class="pagination-nav">
            <button class="btn-icon" id="prev-page-materias" ${first ? 'disabled' : ''}><i class="ph ph-caret-left"></i></button>
            <span class="page-info">Página ${pageIndex + 1} de ${totalPages}</span>
            <button class="btn-icon" id="next-page-materias" ${last ? 'disabled' : ''}><i class="ph ph-caret-right"></i></button>
        </div>
    `;

    const select = document.getElementById('items-per-page-materias');
    select.value = itemsPerPage;

    // Corrigido: Os listeners devem chamar loadMaterias(), não loadUsers().
    select.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value, 10);
        currentPage = 0;
        loadMaterias();
    });
    document.getElementById('prev-page-materias').addEventListener('click', () => {
        if (!first) {
            currentPage--;
            loadMaterias();
        }
    });
    document.getElementById('next-page-materias').addEventListener('click', () => {
        if (!last) {
            currentPage++;
            loadMaterias();
        }
    });
}

/**
 * Executa scripts inline que foram carregados via innerHTML.
 * Nota: Esta é uma solução alternativa necessária porque scripts inseridos
 * via innerHTML não são executados por padrão pelos navegadores.
 */
function executePageScripts() {
    const scripts = Array.from(appRoot.getElementsByTagName('script'));
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        // Copia todos os atributos (ex: src, type) do script antigo para o novo.
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        // Copia o conteúdo do script.
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        // Substitui o script antigo pelo novo para forçar a execução.
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}


// =================================================================
// --- Handlers de Eventos e Listeners ---
// =================================================================

/**
 * Anexa listeners de evento aos formulários comuns (login, registro)
 * que podem aparecer em várias páginas.
 */
function attachCommonFormListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPasswordSubmit);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
}

/**
 * Adiciona os 'escutadores' de evento de clique aos cabeçalhos do acordeão de aulas.
 */
function attachAccordionListeners() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Adiciona ou remove a classe 'active' para controlar o estado
            this.classList.toggle('active');
        });
    });
}

/**
 * Adiciona um 'escutador' de evento de clique na lista de aulas para
 * gerenciar os botões de marcar progresso.
 */
function attachProgressButtonListeners() {
    const classListContainer = document.getElementById('class-list');
    if (!classListContainer) return;

    classListContainer.addEventListener('click', async function(event) {
        const target = event.target;
        // Verifica se o clique foi em um botão que NÃO está desabilitado
        if (target.matches('.mark-as-watched-btn') && !target.disabled) {
            const aulaId = target.dataset.aulaId;

            // Desabilita o botão e mostra um "loading" para feedback visual
            target.disabled = true;
            target.textContent = 'Salvando...';

            const resultado = await marcarAulaComoConcluida(aulaId);

            if (resultado) {
                // Sucesso! Atualiza a UI dinamicamente
                target.textContent = 'Aula Concluída';
                target.classList.add('concluida');

                // Atualiza também o círculo do número
                const header = target.closest('.accordion-item').querySelector('.aula-number-circle');
                if (header) {
                    header.classList.add('concluida');
                    header.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                }
            } else {
                // Falhou. Reabilita o botão e volta ao texto original
                target.disabled = false;
                target.textContent = 'Marcar como assistida';
                alert('Houve um erro ao salvar seu progresso. Tente novamente.');
            }
        }
    });
}

/**
 * Anexa listeners para elementos que existem apenas na página de aulas.
 */
function attachClassPageListeners() {
    // Filtro para o seletor de matérias
    const filterMateria = document.getElementById('filter-materia');
    if (filterMateria) {
        filterMateria.addEventListener('change', (e) => updateFilter('materiaId', e.target.value));
    }

    // Filtro para o campo de busca por nome/título
    const filterTitulo = document.getElementById('busca-nome-materia');
    if (filterTitulo) {
        const debouncedUpdate = debounce((value) => {
            updateFilter('searchTerm', value);
        }, 1000); // 500ms para ter certeza

        // listener que chama a função com debounce
        filterTitulo.addEventListener('input', (e) => {
            debouncedUpdate(e.target.value);
        });
    }
}

/**
 * Cria uma versão "debounced" de uma função que atrasa sua execução
 * até que um certo tempo tenha passado sem que ela seja chamada novamente.
 * Ótimo para eventos como 'input' ou 'resize'.
 * @param {Function} func A função a ser "debounced".
 * @param {number} delay O tempo de espera em milissegundos.
 * @returns {Function} A nova função "debounced".
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        // Cancela o timer anterior se a função for chamada novamente
        clearTimeout(timeoutId);
        // Configura um novo timer
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


/**
 * Lida com a submissão do formulário de login.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.style.display = 'none';

    const formData = new FormData(event.target);
    const { email, password } = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha: password }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro no login. Verifique seu e-mail e senha.');
        }

        // Apenas muda a hash. O evento 'hashchange' cuidará de chamar handleRouteChange.
        window.location.hash = '#dashboard';

    } catch (error) {
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = 'block';
    }
}

/**
 * Lida com a submissão do formulário de registro.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function handleRegisterSubmit(event) {
    event.preventDefault();
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.style.display = 'none';

    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    if (!userData.name || !userData.email || !userData.idade || !userData.password) {
        errorMessageDiv.textContent = 'Todos os campos são obrigatórios.';
        errorMessageDiv.style.display = 'block';
        return;
    }

    if (parseInt(userData.idade, 10) <= 0) {
        errorMessageDiv.textContent = 'A idade deve ser um número positivo.';
        errorMessageDiv.style.display = 'block';
        return;
    }

    try {
        await registerUser(userData);
        // Redireciona para o login após o registro bem-sucedido.
        window.location.hash = '#login';

    } catch (error) {
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = 'block';
    }
}

/**
 * Lida com a submissão do formulário de recuperação de senha.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    const errorMessageDiv = document.getElementById('error-message');
    const successMessageDiv = document.getElementById('success-message');
    errorMessageDiv.style.display = 'none';
    successMessageDiv.style.display = 'none';

    const formData = new FormData(event.target);
    const { email } = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/api/v1/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro ao solicitar recuperação.');
        }

        const successText = await response.text();
        successMessageDiv.textContent = successText || "Instruções de recuperação enviadas para seu e-mail.";
        successMessageDiv.style.display = 'block';
        event.target.reset();

    } catch (error) {
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = 'block';
    }
}

/**
 * Lida com a lógica da página de aulas: busca as aulas e o progresso do usuário,
 * e renderiza a lista com o estado de conclusão correto e interatividade.
 * (Versão completa e final)
 */
async function handleAulasPage() {

    // 1. Pega o ID da matéria da URL e os elementos do DOM
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const materiaId = params.get('materiaId');
    const classListContainer = document.getElementById('class-list');
    const pageTitle = document.querySelector('.main-container h1');

    // Validação inicial
    if (!materiaId) {
        if (classListContainer) classListContainer.innerHTML = `<p>Erro: ID da matéria não especificado.</p>`;
        return;
    }

    if (pageTitle) pageTitle.textContent = `Video Aulas > Aulas da Materia`;

    // Mostra um feedback de carregamento para o usuário
    if (classListContainer) classListContainer.innerHTML = `<p class="loading-message">Carregando aulas...</p>`;

    // 2. Otimização: Busca as aulas da matéria e o progresso do usuário em paralelo
    const [aulas, progressos] = await Promise.all([
        fetchAulasPorMateria(materiaId),
        fetchProgressoAulas()
    ]);

    if (!classListContainer) {
        return;
    }

    // 3. Verifica se existem aulas para renderizar
    if (aulas && aulas.length > 0) {
        // 4. Gera o HTML dinâmico para cada aula
        const aulasHtml = aulas.map((aula, index) => {
            const embedUrl = convertToEmbedUrl(aula.link);
            const duracaoMinutos = convertSecondsToMinutes(aula.duracaoSegundos);

            // Verifica o status da aula atual usando o mapa de progressos
            const status = progressos[aula.id];
            const isConcluida = status === 'CONCLUIDO';

            return `
            <div class="accordion-item">
                <button class="accordion-header">
                    <div class="aula-number-circle ${isConcluida ? 'concluida' : ''}">
                        ${isConcluida ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : index + 1}
                    </div>
                    <div class="header-title">
                        <span class="aula-titulo">${aula.titulo}</span>
                    </div>
                    <div class="header-meta">
                        <span class="aula-duracao">${duracaoMinutos} min</span>
                        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </button>
                <div class="accordion-content">
                    <div class="content-wrapper">
                        <div class="video-column">
                            <div class="video-player-wrapper">
                                <iframe src="${embedUrl}" title="${aula.titulo}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            </div>
                        </div>
                        <div class="details-column">
                             <p class="aula-descricao">${aula.descricao}</p>
                             <button class="mark-as-watched-btn ${isConcluida ? 'concluida' : ''}" 
                                     data-aula-id="${aula.id}" 
                                     ${isConcluida ? 'disabled' : ''}>
                                 ${isConcluida ? 'Aula Concluída' : 'Marcar como assistida'}
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        `;}).join('');

        // 5. Insere o HTML gerado na página
        classListContainer.innerHTML = aulasHtml;

        // 6. Chama as funções para ativar a interatividade dos novos elementos
        attachAccordionListeners();
        attachProgressButtonListeners();
    } else {
        classListContainer.innerHTML = `<p class="empty-message">Nenhuma aula encontrada para esta matéria.</p>`;
    }
}

/**
 * Lida com a PÁGINA DE LISTA de resumos de uma matéria específica.
 * Busca os resumos e o progresso do usuário para exibir o status de leitura.
 */
async function handleResumosListPage() {

    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const materiaId = params.get('materiaId');
    const container = document.getElementById('resumos-list-container');
    const pageTitle = document.querySelector('.main-container h1');

    // Validações iniciais
    if (!container) {
        return;
    }
    if (!materiaId) {
        container.innerHTML = "<p>ID da matéria não fornecido na URL.</p>";
        return;
    }

    // Feedback visual de carregamento
    container.innerHTML = "<p>Carregando resumos...</p>";
    if (pageTitle) pageTitle.textContent = "Carregando...";

    // Otimização: Busca a lista de resumos e a lista de progressos em paralelo
    const [resumos, progressos] = await Promise.all([
        fetchResumosPorMateria(materiaId),
        fetchProgressoResumos()
    ]);

    if (resumos && resumos.length > 0) {
        // Atualiza o título da página com o nome da matéria
        const materiaNome = resumos[0].materia.nome;
        if (pageTitle) pageTitle.textContent = `Resumos de ${materiaNome}`;

        // Gera o HTML da lista
        const listHtml = resumos.map(resumo => {
            // Verifica se o ID deste resumo existe no mapa de progressos
            const foiLido = progressos.hasOwnProperty(resumo.id);

            return `
            <li>
                <a href="#subject/summary-detail?id=${resumo.id}" class="resumo-link-item">
                    <span class="resumo-titulo">${resumo.titulo}</span>
                    <div class="resumo-meta">
                        ${foiLido ? '<span class="status-badge lido">Lido ✓</span>' : ''}
                        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                </a>
            </li>
        `;
        }).join('');
        container.innerHTML = `<ul class="resumo-list">${listHtml}</ul>`;
    } else {
        if (pageTitle) pageTitle.textContent = "Resumos";
        container.innerHTML = "<p>Nenhum resumo encontrado para esta matéria.</p>";
    }
}

/**
 * Lida com a PÁGINA DE DETALHE de um resumo específico.
 * Marca o resumo como lido e exibe seu conteúdo formatado.
 */
async function handleResumoDetailPage() {

    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const resumoId = params.get('id');
    const container = document.getElementById('resumo-detail-container');

    // Validações iniciais
    if (!container) {
        return;
    }
    if (!resumoId) {
        container.innerHTML = "<p>ID do resumo não fornecido na URL.</p>";
        return;
    }

    // Feedback visual de carregamento
    container.innerHTML = "<p>Carregando resumo...</p>";

    // Otimização: Busca os dados do resumo e marca o progresso em paralelo
    const [resumo, progresso] = await Promise.all([
        fetchResumoPorId(resumoId),
        marcarResumoComoLido(resumoId)
    ]);

    if (resumo) {
        // Usa a biblioteca marked.js para formatar o conteúdo
        const conteudoFormatado = marked.parse(resumo.conteudo);

        let dataLeituraHtml = '';
        // Verifica se o progresso foi marcado/retornado com sucesso
        if (progresso && progresso.dataVisualizacao) {
            const dataLeituraFormatada = new Date(progresso.dataVisualizacao).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
            dataLeituraHtml = `<span class="data-leitura">Lido em: ${dataLeituraFormatada}</span>`;
        }

        // Monta o HTML final da página
        container.innerHTML = `
            <h1 class="resumo-title">${resumo.titulo}</h1>
            <div class="meta-info">
                <span class="materia-tag">${resumo.materia.nome}</span>
                ${dataLeituraHtml}
            </div>
            <article class="resumo-content">
                ${conteudoFormatado}
            </article>
        `;
    } else {
        container.innerHTML = "<p>Resumo não encontrado ou falha ao carregar.</p>";
    }
}

/**
 * Converte uma URL de visualização do YouTube para uma URL de 'embed'.
 * @param {string} url - A URL original do YouTube (ex: .../watch?v=VIDEO_ID).
 * @returns {string} - A URL no formato 'embed' (ex: .../embed/VIDEO_ID).
 */
function convertToEmbedUrl(url) {
    if (!url) return ''; // Retorna vazio se a URL for nula ou indefinida

    // A mágica acontece aqui: substitui '/watch?v=' por '/embed/'
    return url.replace('/watch?v=', '/embed/');
}

function convertSecondsToMinutes(secondes) {
    const minutes = Math.floor(secondes / 60);
    return minutes
}

/**
 * Atualiza um valor de filtro e recarrega a lista de dados.
 * @param {string} key - A chave do filtro a ser atualizada (ex: 'materiaId').
 * @param {string} value - O novo valor para o filtro.
 */
function updateFilter(key, value) {
    currentPage = 0; // Reseta para a primeira página ao aplicar um novo filtro
    currentFilters[key] = value;
    loadMaterias();
}


// =================================================================
// --- Inicialização da Aplicação ---
// =================================================================

// Ouve o evento de mudança de hash na URL (ex: clicar em <a href="#register">)
window.addEventListener('hashchange', handleRouteChange);

// Carrega a página inicial quando o DOM está pronto.
document.addEventListener('DOMContentLoaded', handleRouteChange);

/**
 * Seta as configurações do scripto Marked.js.
 * @Type {configurable}
 */
marked.setOptions({
    gfm: true,
    breaks: true
});