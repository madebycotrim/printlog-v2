import { StatusPedido, TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { Pedido, CriarPedidoInput, AtualizarPedidoInput } from "../tipos";
import { apiPedidos } from "./apiPedidos";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { apiFinanceiro } from "@/funcionalidades/comercial/financeiro/servicos/apiFinanceiro";
import { servicoFinanceiro } from "@/funcionalidades/comercial/financeiro/servicos/servicoFinanceiro";
import { apiClientes } from "@/funcionalidades/comercial/clientes/servicos/apiClientes";
import { servicoManutencao } from "@/compartilhado/servicos/servicoManutencao";
import { usarArmazemNotificacoes } from "@/compartilhado/estado/armazemNotificacoes";
import { TipoNotificacao, CategoriaNotificacao } from "@/compartilhado/tipos/notificacoes";
import { registrar } from "@/compartilhado/utilitarios/registrador";

/**
 * Serviço de Negócio para Pedidos e Fluxo de Produção.
 * Faz a ponte entre a UI e a API real, aplicando regras de negócio.
 */
class ServicoPedidos {
  /**
   * Busca e processa pedidos, aplicando regras de arquivamento automático.
   */
  async buscarPedidos(usuarioId: string): Promise<Pedido[]> {
    const pedidos = await apiPedidos.buscarTodos(usuarioId);
    
    const processados = pedidos.map((p: any) => ({
      ...p,
      status: (p.status || p.id_status || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace('pendente', StatusPedido.A_FAZER) || StatusPedido.A_FAZER,
      dataCriacao: new Date(p.data_criacao || p.dataCriacao),
      dataConclusao: p.data_conclusao ? new Date(p.data_conclusao) : undefined,
      prazoEntrega: (p.prazo_entrega || p.prazoEntrega) ? new Date(p.prazo_entrega || p.prazoEntrega) : undefined,
      valorCentavos: (p.valor_centavos !== undefined) ? p.valor_centavos : p.valorCentavos,
      idCliente: p.id_cliente || p.idCliente,
      idImpressora: p.id_impressora || p.idImpressora,
      pesoGramas: (p.peso_gramas !== undefined) ? p.peso_gramas : p.pesoGramas,
      tempoMinutos: (p.tempo_minutos !== undefined) ? p.tempo_minutos : p.tempoMinutos,
      insumosSecundarios: typeof p.insumos_secundarios === 'string' ? JSON.parse(p.insumos_secundarios) : (p.insumos_secundarios || p.insumosSecundarios || []),
      posProcesso: typeof p.pos_processo === 'string' ? JSON.parse(p.pos_processo) : (p.pos_processo || p.posProcesso || [])
    }));

    const agora = new Date();
    const SETE_DIAS_EM_MS = 7 * 24 * 60 * 60 * 1000;

    // Regra de Arquivamento Automático: +7 dias no Concluído
    const finalizados = await Promise.all(processados.map(async (p) => {
      let status = p.status;
      if (status === StatusPedido.CONCLUIDO && p.dataConclusao) {
        if (agora.getTime() - p.dataConclusao.getTime() > SETE_DIAS_EM_MS) {
          status = StatusPedido.ARQUIVADO;
          // Sincroniza o novo status no banco em Background (sem travar a UI)
          apiPedidos.atualizar({ id: p.id, status: StatusPedido.ARQUIVADO }, usuarioId);
        }
      }
      return { ...p, status };
    }));

    // Retorna apenas os não arquivados para o Kanban padrão
    return finalizados.filter((p) => p.status !== StatusPedido.ARQUIVADO);
  }

  async criarPedido(dados: CriarPedidoInput, usuarioId: string): Promise<Pedido> {
    const id = crypto.randomUUID();
    const dataCriacao = new Date();
    
    const novoPedido: Pedido = {
      ...dados,
      id,
      idUsuario: usuarioId,
      status: StatusPedido.A_FAZER,
      dataCriacao
    };

    await apiPedidos.criar(novoPedido, usuarioId);
    return novoPedido;
  }

  async atualizarPedido(dados: AtualizarPedidoInput, usuarioId: string): Promise<Pedido> {
    const novoStatus = dados.status;
    let dataConclusao = (dados as any).dataConclusao;

    if (novoStatus === StatusPedido.CONCLUIDO && !dataConclusao) {
      dataConclusao = new Date().toISOString();
    }

    const payload = { ...dados, dataConclusao };
    await apiPedidos.atualizar(payload, usuarioId);
    
    return {
      ...dados,
      dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined
    } as any;
  }

  /**
   * Atualiza o status de um pedido, orquestrando todas as operações de
   * liquidação (ao concluir) e reversão (ao sair de concluído).
   *
   * Regras de negócio:
   * - CONCLUÍDO: desconta materiais, insumos, incrementa horímetro, atualiza cliente, lança financeiro.
   * - SAÍDA de CONCLUÍDO (exceto para ARQUIVADO): reverte todos os itens acima.
   * - ARQUIVADO: sem operações (estado final imutável).
   */
  async atualizarStatus(id: string, novoStatus: StatusPedido, usuarioId: string): Promise<Pedido> {
    const todos = await apiPedidos.buscarTodos(usuarioId);
    const pedido = todos.find(p => p.id === id);
    const statusAtual = (pedido?.status as StatusPedido) || StatusPedido.A_FAZER;

    // Normaliza o pedido com campos camelCase — busca em TODAS as fontes possíveis
    const pedidoNorm = pedido ? (() => {
      const p = pedido as any; // Cast para acessar campos snake_case do banco

      // Desempacota dados_extras se existir (pode vir como string ou objeto)
      let extras: any = {};
      if (p.dados_extras) {
        try { extras = typeof p.dados_extras === 'string' ? JSON.parse(p.dados_extras) : p.dados_extras; } catch { extras = {}; }
      }

      // Função auxiliar para buscar array em múltiplas fontes
      const buscarArray = (...fontes: any[]): any[] => {
        for (const f of fontes) {
          if (!f) continue;
          if (typeof f === 'string') { try { const parsed = JSON.parse(f); if (Array.isArray(parsed)) return parsed; } catch { continue; } }
          if (Array.isArray(f) && f.length > 0) return f;
        }
        return [];
      };

      return {
        ...p,
        ...extras,
        idImpressora: p.id_impressora || p.idImpressora || extras.idImpressora,
        pesoGramas: p.peso_gramas ?? p.pesoGramas ?? extras.peso_gramas,
        tempoMinutos: p.tempo_minutos ?? p.tempoMinutos ?? extras.tempo_minutos,
        valorCentavos: p.valor_centavos ?? p.valorCentavos,
        idCliente: p.id_cliente || p.idCliente,
        insumosSecundarios: buscarArray(
          extras.insumosSecundarios, extras.insumos_secundarios,
          p.insumosSecundarios, p.insumos_secundarios
        ),
        materiais: buscarArray(
          extras.materiais, p.materiais
        ),
        posProcesso: buscarArray(
          extras.posProcesso, extras.pos_processo,
          p.posProcesso, p.pos_processo
        ),
        configuracoes: extras.configuracoes || p.configuracoes || {},
      };
    })() : null;

    const rastreioId = `pedido-${id}`;

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 1: Movendo PARA Concluído → Liquidação completa
    // ─────────────────────────────────────────────────────────────────────────
    if (novoStatus === StatusPedido.CONCLUIDO && statusAtual !== StatusPedido.CONCLUIDO && pedidoNorm) {
      registrar.info({ rastreioId, servico: "Pedidos" }, "Iniciando liquidação de conclusão");
      await this.liquidarConclusao(pedidoNorm, usuarioId, rastreioId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 2: Saindo de Concluído para qualquer status (exceto Arquivado)
    //         → Reverter toda a liquidação
    // ─────────────────────────────────────────────────────────────────────────
    if (
      statusAtual === StatusPedido.CONCLUIDO &&
      novoStatus !== StatusPedido.CONCLUIDO &&
      novoStatus !== StatusPedido.ARQUIVADO &&
      pedidoNorm
    ) {
      registrar.info({ rastreioId, servico: "Pedidos" }, "Iniciando reversão de conclusão");
      await this.reverterConclusao(pedidoNorm, usuarioId, rastreioId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 3: Movendo para ARQUIVADO → Nada a fazer (estado final)
    // ─────────────────────────────────────────────────────────────────────────

    return this.atualizarPedido({ id, status: novoStatus }, usuarioId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIQUIDAÇÃO DE CONCLUSÃO
  // Executa todos os descontos e acréscimos quando um pedido é concluído.
  // ───────────────────────────────────────────────────────────────────────────
  private async liquidarConclusao(pedido: any, usuarioId: string, rastreioId: string): Promise<void> {
    const erros: string[] = [];

    // Log de diagnóstico: mostra exatamente quais dados estão disponíveis para liquidação
    registrar.info({ 
      rastreioId, 
      servico: "Pedidos",
      materiais: pedido.materiais?.length ?? 0,
      insumosSecundarios: pedido.insumosSecundarios?.length ?? 0,
      idImpressora: pedido.idImpressora ?? "NENHUMA",
      tempoMinutos: pedido.tempoMinutos ?? 0,
      valorCentavos: pedido.valorCentavos ?? 0,
      idCliente: pedido.idCliente ?? "NENHUM",
      temConfiguracoes: pedido.configuracoes ? "SIM" : "NÃO",
    }, "Dados do pedido para liquidação");

    // 1. Desconto de Materiais (filamentos, resinas)
    if (pedido.materiais && pedido.materiais.length > 0) {
      for (const mat of pedido.materiais) {
        try {
          const listaMats = await apiMateriais.listar(usuarioId);
          const materialEstoque = listaMats.find(m => m.id === mat.idMaterial || m.id === mat.id);
          
          if (materialEstoque) {
            const novoPeso = Math.max(0, (materialEstoque.pesoRestanteGramas || 0) - (mat.quantidadeGasta || 0));
            await apiMateriais.atualizar(
              { id: materialEstoque.id, pesoRestanteGramas: novoPeso },
              usuarioId,
              {
                data: new Date().toISOString(),
                nomePeca: pedido.descricao,
                quantidadeGastaGramas: mat.quantidadeGasta || 0,
                status: "SUCESSO"
              }
            );

            // Alerta de estoque baixo (< 200g)
            if (novoPeso < 200) {
              usarArmazemNotificacoes.getState().adicionarNotificacao({
                titulo: `Estoque Baixo: ${materialEstoque.nome} ⚠️`,
                mensagem: `Restam apenas ${Math.round(novoPeso)}g. Considere comprar mais.`,
                tipo: TipoNotificacao.AVISO,
                categoria: CategoriaNotificacao.SISTEMA,
                idReferencia: materialEstoque.id,
                link: "/materiais"
              });
            }
          }
        } catch (e) {
          const msg = `Erro ao descontar material ${mat.nome || mat.idMaterial}`;
          registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
          erros.push(msg);
        }
      }
    }

    // 2. Desconto de Insumos Secundários (parafusos, tintas, embalagens, etc)
    if (pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0) {
      for (const ins of pedido.insumosSecundarios) {
        try {
          const listaIns = await apiInsumos.listar(usuarioId);
          const insumoEstoque = listaIns.find(i => i.id === ins.idInsumo || i.id === ins.id);

          if (insumoEstoque) {
            const novaQtd = Math.max(0, (insumoEstoque.quantidadeAtual || 0) - ins.quantidade);
            await apiInsumos.atualizar(
              { id: insumoEstoque.id, quantidadeAtual: novaQtd },
              usuarioId,
              {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                tipo: "Saída",
                quantidade: ins.quantidade,
                motivo: "Consumo",
                observacao: `Conclusão do pedido: ${pedido.descricao}`,
                valorTotal: ins.quantidade * (insumoEstoque.custoMedioUnidade || 0)
              }
            );

            // Alerta de insumo abaixo do mínimo
            if (novaQtd <= insumoEstoque.quantidadeMinima) {
              usarArmazemNotificacoes.getState().adicionarNotificacao({
                titulo: `Insumo Abaixo do Mínimo: ${insumoEstoque.nome} ⚠️`,
                mensagem: `Estoque atual: ${novaQtd} ${insumoEstoque.unidadeMedida}. Mínimo: ${insumoEstoque.quantidadeMinima}.`,
                tipo: TipoNotificacao.AVISO,
                categoria: CategoriaNotificacao.SISTEMA,
                idReferencia: insumoEstoque.id,
                link: "/insumos"
              });
            }
          }
        } catch (e) {
          const msg = `Erro ao descontar insumo ${ins.nome || ins.idInsumo}`;
          registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
          erros.push(msg);
        }
      }
    }

    // 3. Horímetro + Métricas Completas da Impressora
    if (pedido.idImpressora && pedido.tempoMinutos && pedido.tempoMinutos > 0) {
      try {
        await servicoManutencao.registrarUsoMaquina(
          pedido.idImpressora,
          pedido.tempoMinutos,
          usuarioId,
          {
            idPedido: pedido.id,
            nomeProjeto: pedido.descricao,
            valorCentavos: pedido.valorCentavos,
            // Extrai o preço do kWh das configurações do pedido.
            // Na calculadora, o valor é salvo em reais (ex: 0.85), então convertemos para centavos.
            precoKwhCentavos: pedido.configuracoes?.precoKwh
              ? Math.round(pedido.configuracoes.precoKwh * 100)
              : 0,
            reversao: false,
          }
        );
      } catch (e) {
        const msg = "Erro ao atualizar métricas da impressora";
        registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
        erros.push(msg);
      }
    }

    // 4. Histórico e Métricas do Cliente
    if (pedido.idCliente && pedido.idCliente !== "avulso") {
      try {
        const listaClientes = await apiClientes.buscarTodos(usuarioId);
        const cliente = listaClientes.find(c => c.id === pedido.idCliente);

        if (cliente) {
          const novoHistorico = [
            ...(cliente.historico || []),
            {
              id: crypto.randomUUID(),
              data: new Date(),
              descricao: pedido.descricao,
              valorCentavos: pedido.valorCentavos,
              status: StatusPedido.CONCLUIDO,
            }
          ];

          await apiClientes.salvar({
            id: cliente.id,
            ltvCentavos: (cliente.ltvCentavos || 0) + pedido.valorCentavos,
            totalProdutos: (cliente.totalProdutos || 0) + 1,
            historico: novoHistorico,
          }, usuarioId);
        }
      } catch (e) {
        const msg = "Erro ao atualizar histórico do cliente";
        registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
        erros.push(msg);
      }
    }

    // 5. Lançamento Financeiro (Entrada de Receita)
    try {
      await apiFinanceiro.registrar({
        descricao: `Receita: ${pedido.descricao}`,
        valorCentavos: pedido.valorCentavos,
        tipo: TipoLancamentoFinanceiro.ENTRADA,
        categoria: "Venda de Impressão 3D",
        data: new Date(),
        idCliente: pedido.idCliente,
        // Usamos o ID do pedido como referência para podermos reverter depois
        idReferencia: pedido.id,
      }, usuarioId);
    } catch (e) {
      const msg = "Erro ao registrar lançamento financeiro";
      registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
      erros.push(msg);
    }

    if (erros.length > 0) {
      registrar.warn({ rastreioId, servico: "Pedidos", erros }, "Liquidação concluída com erros parciais");
    } else {
      registrar.info({ rastreioId, servico: "Pedidos" }, "Liquidação de conclusão concluída com sucesso");
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // REVERSÃO DE CONCLUSÃO
  // Desfaz todos os descontos e acréscimos quando o pedido sai de Concluído.
  // ───────────────────────────────────────────────────────────────────────────
  private async reverterConclusao(pedido: any, usuarioId: string, rastreioId: string): Promise<void> {
    const erros: string[] = [];

    // 1. Estornar lançamento financeiro (busca pelo id_pedido = id do pedido)
    try {
      const lancamentos = await servicoFinanceiro.buscarLancamentos(usuarioId, rastreioId);
      const lancamentoPedido = lancamentos.find(
        l => (l as any).idPedido === pedido.id || (l as any).id_pedido === pedido.id
      );

      if (lancamentoPedido) {
        await apiFinanceiro.remover(lancamentoPedido.id, usuarioId);
      }
    } catch (e) {
      const msg = "Erro ao estornar lançamento financeiro";
      registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
      erros.push(msg);
    }

    // 2. Estornar desconto de materiais (devolver gramas ao estoque)
    if (pedido.materiais && pedido.materiais.length > 0) {
      for (const mat of pedido.materiais) {
        try {
          const listaMats = await apiMateriais.listar(usuarioId);
          const materialEstoque = listaMats.find(m => m.id === mat.idMaterial || m.id === mat.id);

          if (materialEstoque) {
            const pesoDevolucao = (materialEstoque.pesoRestanteGramas || 0) + (mat.quantidadeGasta || 0);
            // Limita ao máximo do peso original do carretel
            const novoPeso = Math.min(pesoDevolucao, materialEstoque.pesoGramas || pesoDevolucao);
            await apiMateriais.atualizar(
              { id: materialEstoque.id, pesoRestanteGramas: novoPeso },
              usuarioId,
              {
                data: new Date().toISOString(),
                nomePeca: `[REVERSÃO] ${pedido.descricao}`,
                quantidadeGastaGramas: -(mat.quantidadeGasta || 0), // Negativo = devolução
                status: "CANCELADO"
              }
            );
          }
        } catch (e) {
          const msg = `Erro ao estornar material ${mat.nome || mat.idMaterial}`;
          registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
          erros.push(msg);
        }
      }
    }

    // 3. Estornar desconto de insumos (devolver ao estoque)
    if (pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0) {
      for (const ins of pedido.insumosSecundarios) {
        try {
          const listaIns = await apiInsumos.listar(usuarioId);
          const insumoEstoque = listaIns.find(i => i.id === ins.idInsumo || i.id === ins.id);

          if (insumoEstoque) {
            const qtdDevolvida = (insumoEstoque.quantidadeAtual || 0) + ins.quantidade;
            await apiInsumos.atualizar(
              { id: insumoEstoque.id, quantidadeAtual: qtdDevolvida },
              usuarioId,
              {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                tipo: "Entrada",
                quantidade: ins.quantidade,
                observacao: `[REVERSÃO] Pedido reaberto: ${pedido.descricao}`,
              }
            );
          }
        } catch (e) {
          const msg = `Erro ao estornar insumo ${ins.nome || ins.idInsumo}`;
          registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
          erros.push(msg);
        }
      }
    }

    // 4. Estornar horímetro + Métricas da impressora
    if (pedido.idImpressora && pedido.tempoMinutos && pedido.tempoMinutos > 0) {
      try {
        await servicoManutencao.registrarUsoMaquina(
          pedido.idImpressora,
          -pedido.tempoMinutos,
          usuarioId,
          {
            idPedido: pedido.id,
            nomeProjeto: pedido.descricao,
            valorCentavos: pedido.valorCentavos,
            precoKwhCentavos: pedido.configuracoes?.precoKwh
              ? Math.round(pedido.configuracoes.precoKwh * 100)
              : 0,
            reversao: true,
          }
        );
      } catch (e) {
        const msg = "Erro ao estornar métricas da impressora";
        registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
        erros.push(msg);
      }
    }

    // 5. Estornar histórico e métricas do cliente
    if (pedido.idCliente && pedido.idCliente !== "avulso") {
      try {
        const listaClientes = await apiClientes.buscarTodos(usuarioId);
        const cliente = listaClientes.find(c => c.id === pedido.idCliente);

        if (cliente) {
          // Remove o registro desse pedido do histórico
          const historicoSemPedido = (cliente.historico || []).filter(
            h => h.descricao !== pedido.descricao || h.valorCentavos !== pedido.valorCentavos
          );

          await apiClientes.salvar({
            id: cliente.id,
            ltvCentavos: Math.max(0, (cliente.ltvCentavos || 0) - pedido.valorCentavos),
            totalProdutos: Math.max(0, (cliente.totalProdutos || 0) - 1),
            historico: historicoSemPedido,
          }, usuarioId);
        }
      } catch (e) {
        const msg = "Erro ao estornar histórico do cliente";
        registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
        erros.push(msg);
      }
    }

    if (erros.length > 0) {
      registrar.warn({ rastreioId, servico: "Pedidos", erros }, "Reversão concluída com erros parciais");
    } else {
      registrar.info({ rastreioId, servico: "Pedidos" }, "Reversão de conclusão concluída com sucesso");
    }
  }

  async excluirPedido(id: string, usuarioId: string): Promise<void> {
    await apiPedidos.excluir(id, usuarioId);
  }
}

export const servicoPedidos = new ServicoPedidos();
