/// <reference types="@cloudflare/workers-types" />

/**
 * API de Pedidos - Cloudflare Pages Functions (v5.0 Soft Delete)
 */

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env, any, { uid: string }> = async (context) => {
    const { env, request, data } = context;

    // Obtido com segurança via Middleware JWT
    const usuarioId = data.uid;
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const metodo = request.method;

    try {
        // GET - Listar (Apenas Ativos)
        if (metodo === "GET") {
            const { results: pedidos } = await env.DB.prepare(
                "SELECT * FROM pedidos_impressao WHERE id_usuario = ? AND arquivado = 0 ORDER BY data_criacao DESC"
            ).bind(usuarioId).all();

            // Desempacotar dados extras para o frontend ver as colunas virtuais
            const processados = pedidos.map((p: any) => {
                if (p.dados_extras) {
                    try {
                        const extras = JSON.parse(p.dados_extras);
                        return { ...p, ...extras };
                    } catch (e) { return p; }
                }
                return p;
            });

            return new Response(JSON.stringify(processados), { headers: { "Content-Type": "application/json" } });
        }

        // POST - Criar
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            
            // Flexibilidade para aceitar camelCase (antigo) ou snake_case (novo)
            const id_cliente = dados.id_cliente ?? dados.idCliente ?? null;
            const id_impressora = dados.id_impressora ?? dados.idImpressora ?? null;
            const valor_centavos = dados.valor_centavos ?? dados.valorCentavos ?? 0;
            const data_criacao = dados.data_criacao ?? dados.dataCriacao ?? new Date().toISOString();
            const descricao = dados.descricao ?? '';

            // Preparar objeto de dados extras para não sujar a descrição
            const dadosExtras = {
                material: dados.material ?? dados.material_base,
                peso_gramas: dados.peso_gramas ?? dados.pesoGramas,
                tempo_minutos: dados.tempo_minutos ?? dados.tempoMinutos,
                observacoes: dados.observacoes,
                insumos_secundarios: dados.insumos_secundarios ? (typeof dados.insumos_secundarios === 'string' ? JSON.parse(dados.insumos_secundarios) : dados.insumos_secundarios) : []
            };

            await env.DB.prepare(`
                INSERT INTO pedidos_impressao (
                    id, id_usuario, id_cliente, id_impressora, descricao, 
                    status, valor_centavos, data_criacao, dados_extras, arquivado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
            `).bind(
                novoId, 
                usuarioId, 
                id_cliente, 
                id_impressora, 
                descricao, 
                dados.status ?? 'pendente', 
                Number(valor_centavos) || 0, 
                data_criacao,
                JSON.stringify(dadosExtras)
            ).run();

            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201, 
                headers: { "Content-Type": "application/json" } 
            });
        }

        // PATCH / PUT - Atualizar
        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            
            const id_cliente = dados.id_cliente ?? dados.idCliente ?? null;
            const id_impressora = dados.id_impressora ?? dados.idImpressora ?? null;
            const valor_centavos = dados.valor_centavos ?? dados.valorCentavos ?? 0;
            const data_conclusao = dados.data_conclusao ?? dados.dataConclusao ?? null;

            const dadosExtras = dados.dados_extras ? JSON.stringify(dados.dados_extras) : null;

            await env.DB.prepare(`
                UPDATE pedidos_impressao SET 
                    status = ?, descricao = ?, valor_centavos = ?,
                    data_conclusao = ?, id_cliente = ?, id_impressora = ?,
                    dados_extras = ?
                WHERE id = ? AND id_usuario = ?
            `).bind(
                dados.status ?? 'pendente', 
                dados.descricao ?? '', 
                Number(valor_centavos) || 0,
                data_conclusao, 
                id_cliente, 
                id_impressora,
                dadosExtras,
                dados.id, 
                usuarioId
            ).run();
            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // DELETE - Soft Delete
        if (metodo === "DELETE") {
            if (!id) return new Response(JSON.stringify({ erro: "ID não fornecido" }), { status: 400, headers: { "Content-Type": "application/json" } });
            await env.DB.prepare(
                "UPDATE pedidos_impressao SET arquivado = 1 WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
};
