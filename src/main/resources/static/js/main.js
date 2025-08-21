const appRoot = document.getElementById('app-root');

const routes = {
    '#login': 'pages/login.html',
    '#forgot-password': 'pages/forgotenPassword.html',
    '#register': 'pages/register.html',
    '#dashboard': 'pages/dashboard.html'
};

async function fetchCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Usuário não autenticado');
    return response.json();
}

async function populateDashboard() {
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

async function loadPage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Página não encontrada.');

        const pageHtml = await response.text();
        appRoot.innerHTML = pageHtml;

        executePageScripts();
        attachFormListeners();

        if (window.location.hash.startsWith('#dashboard')) {
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
 * Lida com a submissão do formulário de login.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function handleLoginSubmit(event) {
    event.preventDefault();

    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.style.display = 'none';

    const formData = new FormData(event.target);
    const credentials = Object.fromEntries(formData.entries());

    const loginData = {
        email: credentials.email,
        senha: credentials.password
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro no login');
        }

        window.location.hash = '#dashboard';
        handleRouteChange();

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
        window.location.hash = '#login';
        handleRouteChange();
    } catch (error) {
        console.error('Erro ao registrar:', error);
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
    const credentials = Object.fromEntries(formData.entries());

    const userData = { email: credentials.email };

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro ao solicitar recuperação de senha');
        }

        const successText = await response.text();
        successMessageDiv.textContent = successText || "Nova senha enviada para seu email.";
        successMessageDiv.style.display = 'block';

        event.target.reset();

    } catch (error) {
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = 'block';
    }
}

/**
 * Função principal que gerencia as rotas.
 */
function handleRouteChange() {
    const hash = window.location.hash || '#login';

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