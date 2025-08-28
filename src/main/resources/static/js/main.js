/**
 * @file Script principal para uma Single Page Application (SPA).
 * Gerencia o roteamento, carregamento de páginas, autenticação de usuário e
 * a exibição de dados dinâmicos da API.
 * @author Seu Nome
 * @version 2.0.0
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
    '#subject/video-class': 'pages/class-list.html'
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

    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        appRoot.innerHTML = `<p style="text-align: center; margin-top: 2rem;">Erro 404: Página não encontrada.</p>`;
    }
}

/**
 * Renderiza os cards de matéria na tela usando os dados reais de progresso.
 * (Versão atualizada para usar o campo 'percentualConclusao')
 */
function renderMateriasCards(materias) {
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
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
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
    const url = `${API_BASE_URL}/api/v1/aulas/by-materia/${materiaId}`;

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
        console.error('Falha na requisição de aulas:', error);
        // Retorna um array vazio em caso de erro para não quebrar a interface
        return [];
    }
}


/**
 * Busca a lista de todas as matérias da API.
 * @returns {Promise<Array<Object>>} Uma lista de matérias.
 * @throws {Error} Se a requisição falhar.
 */
async function fetchMaterias() {
    const response = await fetch(`${API_BASE_URL}/api/v1/materias`, {
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
        const response = await fetch(`${API_BASE_URL}/api/v1/progresso`, { // Confirme se a URL base é /progresso
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
        console.error(error);
        return {}; // Retorna um mapa vazio em caso de erro
    }
}

/**
 * Busca as estatísticas de progresso do usuário logado na API.
 * @returns {Promise<EstatisticasUsuarioDTO|null>}
 */
async function fetchEstatisticasUsuario() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/estatisticas/meu-progresso`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Falha ao buscar estatísticas do usuário.');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro na API de estatísticas:', error);
        return null; // Retorna nulo em caso de erro
    }
}

/**
 * Envia uma requisição para marcar uma aula como 'CONCLUIDA'.
 * @param {number} aulaId - O ID da aula a ser marcada.
 */
async function marcarAulaComoConcluida(aulaId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/progresso/${aulaId}`, { // Confirme se a URL base é /progresso
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
        console.error(error);
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
        console.error('Erro ao carregar dados de suporte:', error);
    }
}

/**
 * Carrega a lista de matérias COM O PROGRESSO do usuário.
 * (Versão atualizada para usar o novo endpoint)
 */
async function loadMaterias() {
    // 1. A URL agora aponta para o novo endpoint que já calcula o progresso.
    const url = `${API_BASE_URL}/api/v1/materias/meu-progresso`;

    try {
        const response = await fetch(url, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Falha ao carregar matérias com progresso.');

        // 2. A resposta agora é um array direto de matérias com o campo 'percentualConclusao'.
        const materiasComProgresso = await response.json();

        // 3. Renderiza os cards com os dados recebidos.
        renderMateriasCards(materiasComProgresso);

    } catch (error) {
        console.error('Erro ao carregar matérias:', error);
    }
}

/**
 * Submete os dados de registro de um novo usuário para a API.
 * @param {Object} userData - Dados do usuário para registro.
 */
async function registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
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
        // Se não conseguir buscar o usuário, redireciona para a página de login.
        console.error("Falha na autenticação:", error.message);
        window.location.hash = '#login';
    }
}

/**
 * Preenche os cards do dashboard com os dados de estatísticas.
 * @param {EstatisticasUsuarioDTO} estatisticas - O objeto com os dados vindo da API.
 */
function populateDashboardStats(estatisticas) {
    // Seleciona os elementos pelos IDs que criamos
    const elAulasVistas = document.getElementById('stat-aulas-vistas');
    const elAulasPendentes = document.getElementById('stat-aulas-pendentes');
    const elMediaDiaria = document.getElementById('stat-media-diaria');
    const elTotalAulas = document.getElementById('stat-total-aulas');

    if (estatisticas) {
        // Formata a média para ter no máximo 2 casas decimais
        const mediaFormatada = estatisticas.mediaAulasPorDia.toFixed(2);

        // Atualiza o conteúdo de cada elemento
        if (elAulasVistas) elAulasVistas.textContent = estatisticas.aulasVistas;
        if (elAulasPendentes) elAulasPendentes.textContent = estatisticas.aulasPendentes;
        if (elMediaDiaria) elMediaDiaria.textContent = mediaFormatada;
        if (elTotalAulas) elTotalAulas.textContent = estatisticas.totalAulas;
    } else {
        // Caso ocorra um erro na API, exibe uma mensagem de falha
        const errorMessage = 'N/D';
        if (elAulasVistas) elAulasVistas.textContent = errorMessage;
        if (elAulasPendentes) elAulasPendentes.textContent = errorMessage;
        if (elMediaDiaria) elMediaDiaria.textContent = errorMessage;
        if (elTotalAulas) elTotalAulas.textContent = errorMessage;
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
    } else {
        console.error("Campo de busca #busca-nome-materia não foi encontrado na página.");
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
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
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
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
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
    console.log("Página de Aulas carregada, executando lógica específica...");

    // 1. Pega o ID da matéria da URL e os elementos do DOM
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const materiaId = params.get('materiaId');
    const classListContainer = document.getElementById('class-list');
    const pageTitle = document.querySelector('.main-container h1');

    // Validação inicial
    if (!materiaId) {
        console.error("ID da Matéria não encontrado na URL.");
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
        console.error("Elemento com id='class-list' não encontrado no HTML.");
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