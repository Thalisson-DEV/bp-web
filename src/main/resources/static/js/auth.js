const TOKEN_KEY = 'token';
const USER_KEY = 'backpack_user';

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
 * Função de logout completa, limpando dados do usuário.
 */
function logout() {
    removeUser();
    window.location.hash = '#login';
    handleRouteChange();
}