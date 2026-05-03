import { RegistroUso } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { apiMateriais } from "./apiMateriais";

/**
 * Serviço de Negócio para Gestão de Consumo de Materiais.
 * Conectado diretamente à API do Cloudflare D1.
 */
class ServicoUsoMateriais {
    /**
     * Registra um novo uso de material (seja por pedido, falha ou manual).
     * Agora persiste diretamente no banco de dados via apiMateriais.
     */
    async registrarUso(idMaterial: string, dados: Omit<RegistroUso, "id" | "data">, usuarioId: string = "sistema"): Promise<RegistroUso> {
        const novoUso: RegistroUso = {
            ...dados,
            id: crypto.randomUUID(),
            data: new Date().toISOString(),
        };

        // Persiste no banco de dados usando o método de atualização do material
        // O backend do D1 está preparado para receber 'registroUso' no Patch
        await apiMateriais.atualizar({ id: idMaterial }, usuarioId, novoUso);

        registrar.info({ rastreioId: crypto.randomUUID(), idMaterial, quantidade: dados.quantidadeGastaGramas }, "Consumo de material registrado no banco");

        return novoUso;
    }

    /**
     * Busca o histórico de uso de um material.
     * Puxa a lista atualizada do banco de dados.
     */
    async buscarHistorico(idMaterial: string, usuarioId: string = "sistema"): Promise<RegistroUso[]> {
        const materiais = await apiMateriais.listar(usuarioId);
        const material = materiais.find(m => m.id === idMaterial);
        
        // Retorna o histórico ordenado pelo mais recente primeiro
        return (material?.historicoUso || []).sort((a, b) => 
            new Date(b.data).getTime() - new Date(a.data).getTime()
        );
    }

    /**
     * Verifica se o material atingiu o nível crítico de 200g (Regra 5.0).
     */
    deveAlertarEstoqueBaixo(pesoRestanteGramas: number): boolean {
        return pesoRestanteGramas < 200;
    }
}

export const servicoUsoMateriais = new ServicoUsoMateriais();
