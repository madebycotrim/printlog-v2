import { autenticacao } from "./firebase";

const URL_API_BASE = import.meta.env.VITE_URL_API || "http://localhost:8787";

/**
 * Interface para erros padronizados da API
 */
export interface ErroApi {
  status: number;
  mensagem: string;
  codigo?: string;
}

/**
 * Serviço base para realizar requisições autenticadas para o backend na Cloudflare.
 * Garante que o ID Token do Firebase seja enviado em todas as chamadas.
 */
export const servicoBaseApi = {
  /**
   * Realiza uma requisição fetch com o token de autenticação injetado.
   */
  async requisicao<T>(
    caminho: string,
    opcoes: RequestInit = {}
  ): Promise<T> {
    const url = `${URL_API_BASE}${caminho}`;
    
    // Busca o token atualizado do Firebase
    const usuario = autenticacao.currentUser;
    const token = usuario ? await usuario.getIdToken() : null;

    const headers = new Headers(opcoes.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const resposta = await fetch(url, {
        ...opcoes,
        headers,
      });

      if (resposta.status === 401) {
        // Opcional: Redirecionar para login ou disparar evento de logout
        throw { status: 401, mensagem: "Sessão expirada. Por favor, logue novamente." };
      }

      if (!resposta.ok) {
        const erroJson = await resposta.json().catch(() => ({}));
        throw {
          status: resposta.status,
          mensagem: erroJson.mensagem || "Erro inesperado no servidor.",
          codigo: erroJson.codigo
        };
      }

      // Se for 204 No Content
      if (resposta.status === 204) return {} as T;

      return await resposta.json();
    } catch (erro: any) {
      console.error(`[API ERROR] ${caminho}:`, erro);
      throw erro;
    }
  },

  get<T>(caminho: string) {
    return this.requisicao<T>(caminho, { method: "GET" });
  },

  post<T>(caminho: string, dados: any) {
    return this.requisicao<T>(caminho, {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  put<T>(caminho: string, dados: any) {
    return this.requisicao<T>(caminho, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  delete<T>(caminho: string) {
    return this.requisicao<T>(caminho, { method: "DELETE" });
  },
};
