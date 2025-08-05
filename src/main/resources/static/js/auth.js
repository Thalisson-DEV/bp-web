const TOKEN_KEY = 'token';
const USER_KEY = 'backpack_user';

/**
 * Salva o token de autenticação no localStorage.
 * @param {string} token - O token JWT recebido da API.
 */
function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Recupera o token de autenticação do localStorage.
 * @returns {string|null} - O token ou null se não existir.
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove o token do localStorage.
 */
function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * Salva os dados do usuário no localStorage como uma string JSON.
 * @param {object} userData - Objeto com os dados do usuário.
 */
function saveUser(userData) {
    if (userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
}

/**
 * Recupera os dados do usuário do localStorage.
 * @returns {object|null} - O objeto do usuário ou null se não existir.
 */
function getUser() {
    const user = localStorage.getItem(USER_KEY);
    try {
        return user ? JSON.parse(user) : null;
    } catch (e) {
        console.error("Erro ao ler dados do usuário do localStorage", e);
        return null;
    }
}

/**
 * Remove os dados do usuário do localStorage.
 */
function removeUser() {
    localStorage.removeItem(USER_KEY);
}

/**
 * Verifica se o usuário está logado (se existe um token).
 * @returns {boolean}
 */
function isUserLoggedIn() {
    return !!getToken();
}

/**
 * Função de logout completa, limpando token e dados do usuário.
 */
function logout() {
    removeToken();
    removeUser();
    window.location.hash = '#login';
    handleRouteChange();
}