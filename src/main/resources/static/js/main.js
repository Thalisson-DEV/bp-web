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
    '#video-class': 'pages/classes.html'
};

/**
 * Gerencia a navegação e o carregamento de páginas com base na hash da URL.
 * Essa é a função central do roteador.
 */
function handleRouteChange() {
    // Define a rota padrão como '#login' se nenhuma hash estiver presente.
    const hash = window.location.hash || '#login';
    const pageUrl = routes[hash] || routes['#login'];

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
 * Renderiza os cards das matérias dentro do container na página.
 * @param {Array<Object>} materias - Um array de objetos, onde cada objeto representa uma matéria.
 */
function renderMateriasCards(materias) {
    const gridContainer = document.getElementById('materias-grid');

    // Verifica se o container existe na página atual para evitar erros
    if (!gridContainer) {
        return;
    }

    // Se a lista de matérias estiver vazia, exibe uma mensagem
    if (materias.length === 0) {
        gridContainer.innerHTML = '<p>Nenhuma matéria encontrada.</p>';
        return;
    }

    // Usa map() para transformar cada objeto de matéria em uma string HTML de um card
    // e depois .join('') para juntar todas as strings em uma só.
    const cardsHtml = materias.map(materia => {
        // As informações de progresso são fixas por enquanto, como solicitado.
        const progressoFicticio = Math.floor(Math.random() * 101); // Gera um % aleatório para visualização
        const aulasAssistidas = Math.floor(progressoFicticio / 20);
        const totalAulas = 5;

        return `
            <div class="card">
                <h3>${materia.nome}</h3>
                <p>Você assistiu <strong>${aulasAssistidas} de ${totalAulas}</strong> Aulas.</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressoFicticio}%;">${progressoFicticio}%</div>
                </div>
                <a href="#video-class/${materia.id}" class="card-link">Ver aulas</a>
            </div>
        `;
    }).join('');

    // Insere o HTML de todos os cards no container de uma só vez.
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
        await populateUserData();
    }

    // Lógica específica para a página de videoaulas
    if (hash.startsWith('#video-class')) {
        await loadSupportData();
        populateFilterDropdowns();
        attachClassPageListeners();
        await loadMaterias();
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
 * Carrega a lista de matérias da API de forma paginada e com filtros.
 */
async function loadMaterias() {
    const params = new URLSearchParams({
        page: currentPage,
        size: itemsPerPage,
        sort: 'id,asc'
    });

    // Adiciona filtros à query string se eles estiverem definidos
    Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/materias?${params.toString()}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Falha ao carregar matérias.');

        const pageData = await response.json();
        renderMateriasCards(pageData.content);
        renderPaginationControls(pageData);

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
    } else {
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
 * Anexa listeners para elementos que existem apenas na página de aulas.
 */
function attachClassPageListeners() {
    const filterMateria = document.getElementById('filter-materia');
    if (filterMateria) {
        filterMateria.addEventListener('change', (e) => updateFilter('materiaId', e.target.value));
    }
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