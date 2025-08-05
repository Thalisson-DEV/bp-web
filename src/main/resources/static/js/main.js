const appRoot = document.getElementById('app-root');

const routes = {
    '#login': 'pages/login.html',
    '#register': 'pages/register.html',
    '#dashboard': 'pages/dashboard.html'
};

function populateDashboard() {
    const user = getUser();
    if (!user || !user.nomeCompleto) {
        console.error("populateDashboard: Não foi possível encontrar o usuário ou o nome completo nos dados.", user);
        return;
    }

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
}

async function loadPage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Página não encontrada.');

        const pageHtml = await response.text();
        appRoot.innerHTML = pageHtml;

        executePageScripts();
        attachFormListeners();

        if (window.location.hash.startsWith('#dashboard')) {
            // *** A CORREÇÃO ESTÁ AQUI ***
            // Usamos setTimeout com 0ms de delay.
            // Isso 'empurra' a execução de populateDashboard para o final da fila de tarefas do navegador,
            // garantindo que o HTML já foi completamente renderizado na tela antes de tentarmos manipulá-lo.
            // Isso resolve a condição de corrida.
            setTimeout(populateDashboard, 0);
        }

    } catch (error) {
        console.error('Erro ao carregar a página:', error);
        appRoot.innerHTML = `<p>Erro 404: Página não encontrada.</p>`;
    }
}

function executePageScripts() {
    const scripts = Array.from(appRoot.getElementsByTagName('script'));
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

/**
 * Adiciona os "escutadores" de evento aos formulários de login e registro.
 * Esta função é chamada toda vez que uma nova página é carregada.
 */
function attachFormListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
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
    const credentials = Object.fromEntries(formData.entries());

    try {
        const result = await loginUser(credentials);

        // *** FERRAMENTA DE DEBUG ADICIONADA AQUI ***
        // Esta linha irá mostrar a resposta EXATA da sua API no console do navegador.
        console.log('RESPOSTA COMPLETA DA API:', result);

        // O código agora verifica a estrutura que o seu DTO LoginResponseDTO envia.
        if (result.token && result.user) {
            saveToken(result.token);
            saveUser(result.user);

            window.location.hash = '#dashboard';
            handleRouteChange();
        } else {
            throw new Error("Resposta da API inválida. Verifique se o backend retorna 'token' e o objeto 'user'.");
        }
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

    // Validação básica
    if (!userData.name || !userData.email || !userData.idade || !userData.password) {
        errorMessageDiv.textContent = 'Todos os campos são obrigatórios';
        errorMessageDiv.style.display = 'block';
        return;
    }

    // Validar idade
    const idade = parseInt(userData.idade);
    if (isNaN(idade) || idade <= 0) {
        errorMessageDiv.textContent = 'Idade deve ser um número positivo';
        errorMessageDiv.style.display = 'block';
        return;
    }

    try {
        console.log('Enviando dados de registro:', userData);
        await registerUser(userData);
        // Após o registro bem-sucedido, redireciona para o login
        alert('Registro realizado com sucesso! Faça o login para continuar.');
        window.location.hash = '#login';
        handleRouteChange();
    } catch (error) {
        console.error('Erro ao registrar:', error);
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = 'block';
    }
}


/**
 * Função principal que gerencia as rotas.
 */
function handleRouteChange() {
    const hash = window.location.hash || '#login';

    if (hash === '#dashboard' && !isUserLoggedIn()) {
        window.location.hash = '#login';
        // A função será chamada novamente pelo 'hashchange', então podemos parar aqui.
        return;
    }

    if ((hash === '#login' || hash === '#register') && isUserLoggedIn()) {
        window.location.hash = '#dashboard';
        // A função será chamada novamente pelo 'hashchange'.
        return;
    }

    // *** NOVA LÓGICA PARA CONTROLAR A CLASSE DO BODY ***
    if (hash.includes('dashboard')) {
        document.body.className = 'dashboard-view';
    } else {
        document.body.className = 'auth-view';
    }

    const pageUrl = routes[hash] || routes['#login'];
    loadPage(pageUrl);
}

// Ouve o evento de mudança de hash na URL (ex: clicar num link <a href="#register">)
window.addEventListener('hashchange', handleRouteChange);

// Carrega a página inicial quando o script é executado pela primeira vez
document.addEventListener('DOMContentLoaded', handleRouteChange);