const API_BASE_URL = 'http://localhost:8080';

/**
 * Função para logar um usuário.
 * @param {object} credentials - Objeto com email e senha.
 * @returns {Promise<object>} - A resposta da API contendo o token.
 */
async function loginUser(credentials) {
    const loginData = {
        email: credentials.email,
        senha: credentials.password
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    });

    if (!response.ok) {

        const errorData = await response.json().catch(() => ({
            message: 'Ocorreu um erro de comunicação com o servidor.'
        }));

        throw new Error(errorData.message || 'Credenciais inválidas.');
    }

    return response.json();
}

async function registerUser(userData) {
    const registerData = {
        nomeCompleto: userData.name,
        email: userData.email,
        senha: userData.password,
        idade: parseInt(userData.idade)
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Erro desconhecido no registro.';

        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorText;
        } catch (e) {
            errorMessage = errorText || `Erro HTTP! Status: ${response.status}`;
        }

        console.error('Erro no registro:', errorMessage);
        throw new Error(errorMessage);
    }
}