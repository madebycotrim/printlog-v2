/**
 * Serviço de comunicação com a API de Configurações Operacionais do D1.
 * Finalidade: Persistência das preferências de custo do estúdio entre dispositivos.
 */

export interface ConfiguracoesSalvas {
  custoEnergia: string;
  horaMaquina: string;
  horaOperador: string;
  margemLucro: string;
}

export const apiConfiguracoes = {
  /**
   * Busca as configurações operacionais do usuário no D1.
   * Retorna os valores padrão se o usuário ainda não configurou.
   */
  async buscar(usuarioId: string): Promise<ConfiguracoesSalvas> {
    const resposta = await fetch("/api/configuracoes", {
      headers: { "x-usuario-id": usuarioId },
    });
    if (!resposta.ok) throw new Error("Erro ao carregar configurações do banco.");
    return resposta.json();
  },

  /**
   * Salva (upsert) as configurações operacionais no D1.
   */
  async salvar(dados: ConfiguracoesSalvas, usuarioId: string): Promise<void> {
    const resposta = await fetch("/api/configuracoes", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-usuario-id": usuarioId,
      },
      body: JSON.stringify(dados),
    });
    if (!resposta.ok) throw new Error("Erro ao salvar configurações no banco.");
  },
};
