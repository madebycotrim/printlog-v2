/// <reference types="@cloudflare/workers-types" />

/**
 * API de Materiais - Cloudflare Pages Functions
 * Gerencia a persistência de Filamentos e Resinas no D1.
 */

interface Env {
    DB: D1Database;
}

/**
 * GET /api/materiais
 * Retorna todos os materiais do usuário logado.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    
    // TODO: Validar Firebase Token real
    // Por enquanto, pegaremos o uid de um header ou parâmetro para teste
    // Buscamos pelo ID do usuário (id_usuario conforme docs/esquema-banco.sql)
    const usuarioId = request.headers.get("x-usuario-id");

    if (!usuarioId) {
        return new Response(JSON.stringify({ erro: "Usuário não identificado" }), { status: 401 });
    }

    try {
        const { results: materiais } = await env.DB.prepare(
            "SELECT * FROM materiais WHERE id_usuario = ? AND arquivado = 0 ORDER BY data_criacao DESC"
        )
        .bind(usuarioId)
        .all();

        // Para cada material, buscamos o histórico na tabela historico_uso_materiais
        const materiaisComHistorico = await Promise.all(materiais.map(async (m: any) => {
            const { results: historico } = await env.DB.prepare(
                "SELECT * FROM historico_uso_materiais WHERE id_material = ? AND id_usuario = ? ORDER BY data DESC"
            )
            .bind(m.id, usuarioId)
            .all();
            
            return {
                ...m,
                estoque: m.estoque_unidades, // Mapeia p/ o frontend
                arquivado: m.arquivado === 1,
                historicoUso: historico
            };
        }));

        return new Response(JSON.stringify(materiaisComHistorico), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};

/**
 * POST /api/materiais
 * Cria um novo material no D1.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const dados = await request.json() as any;
    const id = dados.id || crypto.randomUUID();

    try {
        await env.DB.prepare(`
            INSERT INTO materiais (
                id, id_usuario, tipo, nome, tipo_material, fabricante,
                cor, preco_centavos, peso_gramas, estoque_unidades, peso_restante_gramas, arquivado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).bind(
            id, usuarioId, dados.tipo, dados.nome, dados.tipoMaterial, dados.fabricante,
            dados.cor, dados.precoCentavos, 
            dados.pesoGramas, dados.estoque, dados.pesoRestanteGramas
        ).run();

        return new Response(JSON.stringify({ id, sucesso: true }), { status: 201 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};

/**
 * PATCH /api/materiais (ou PUT)
 * Atualiza dados ou abater peso.
 */
export const onRequestPatch: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const dados = await request.json() as any;

    try {
        // Se for um abatimento de peso, precisamos registrar no histórico também
        if (dados.registroUso) {
            const reg = dados.registroUso;
            await env.DB.prepare(`
                INSERT INTO historico_uso_materiais (
                    id, id_material, id_usuario, data, nome_peca, 
                    quantidade_gasta_gramas, tempo_impressao_minutos, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                crypto.randomUUID(), dados.id, usuarioId, reg.data, reg.nomePeca,
                reg.quantidadeGastaGramas, reg.tempoImpressaoMinutos, reg.status
            ).run();
        }

        // Atualiza a tabela principal
        await env.DB.prepare(`
            UPDATE materiais SET 
                estoque_unidades = ?,
                peso_restante_gramas = ?,
                preco_centavos = ?,
                data_criacao = datetime('now') -- Mantendo data_criacao como última atualização para simplificar se não houver coluna update
            WHERE id = ? AND id_usuario = ?
        `).bind(
            dados.estoque, dados.pesoRestanteGramas, dados.precoCentavos, 
            dados.id, usuarioId
        ).run();

        return new Response(JSON.stringify({ sucesso: true }));
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};
