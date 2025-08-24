/**
 * Função de logout completa, limpando dados do usuário.
 */
function logout() {
    window.location.hash = '#login';
    handleRouteChange();
}