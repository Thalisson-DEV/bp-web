const API_BASE_URL = 'http://localhost:8080';

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