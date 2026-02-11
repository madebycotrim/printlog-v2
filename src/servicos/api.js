import { auth } from './firebase';

const URL_BASE = '/api';

async function obterCabecalhos() {
    const cabecalhos = {
        'Content-Type': 'application/json',
    };

    if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        console.log('[API] Token obtido:', token.substring(0, 10) + '...');
        cabecalhos['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn('[API] Usuário não autenticado. Nenhum token enviado.');
    }

    return cabecalhos;
}

export const api = {
    obter: async (rota) => {
        const cabecalhos = await obterCabecalhos();
        const resposta = await fetch(`${URL_BASE}${rota}`, { headers: cabecalhos });
        if (!resposta.ok) throw new Error(`Erro na API: ${resposta.statusText}`);
        return resposta.json();
    },

    enviar: async (rota, dados) => {
        const cabecalhos = await obterCabecalhos();
        const resposta = await fetch(`${URL_BASE}${rota}`, {
            method: 'POST',
            headers: cabecalhos,
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) throw new Error(`Erro na API: ${resposta.statusText}`);
        // Tratar 201 Created ou 200 OK
        const texto = await resposta.text();
        try {
            return JSON.parse(texto);
        } catch {
            return texto;
        }
    },

    remover: async (rota) => {
        const cabecalhos = await obterCabecalhos();
        const resposta = await fetch(`${URL_BASE}${rota}`, {
            method: 'DELETE',
            headers: cabecalhos
        });
        if (!resposta.ok) throw new Error(`Erro na API: ${resposta.statusText}`);
        return true;
    }
};
