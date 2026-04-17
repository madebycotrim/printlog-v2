/// <reference types="@cloudflare/workers-types" />

/**
 * API de Manutenções - Cloudflare Pages Functions (v2.0 Soft Delete)
 */

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const idImpressora = url.searchParams.get("idImpressora");
    const metodo = request.method;

    try {
        // GET - Listar (Com Fallback para Esquemas Antigos)
        if (metodo === "GET") {
            let query = "SELECT * FROM registros_manutencao WHERE id_usuario = ?";
            let params = [usuarioId];

            if (idImpressora) {
                query += " AND id_impressora = ?";
                params.push(idImpressora);
            }

            // Tentamos filtrar por arquivados, mas envolvemos em um try interno 
            // para não quebrar caso a coluna ainda não tenha sido criada via migração
            try {
                const { results } = await env.DB.prepare(query + " AND arquivado = 0").bind(...params).all();
                return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
            } catch (e) {
                // Se falhar (ex: no such column: arquivado), retorna sem o filtro
                const { results } = await env.DB.prepare(query).bind(...params).all();
                return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
            }
        }

        // POST - Criar / Registrar
        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            
            // Garantimos que todos os campos do tipo RegistroManutencao sejam persistidos
            await env.DB.prepare(`
                INSERT INTO registros_manutencao (
                    id, id_usuario, id_impressora, data, tipo, descricao, 
                    custo_centavos, observacoes, tempo_parada_minutos, 
                    pecas_trocadas, responsavel, horas_maquina_atualmente, arquivado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                ON CONFLICT(id) DO UPDATE SET
                    data = excluded.data,
                    tipo = excluded.tipo,
                    descricao = excluded.descricao,
                    custo_centavos = excluded.custo_centavos,
                    observacoes = excluded.observacoes,
                    tempo_parada_minutos = excluded.tempo_parada_minutos,
                    pecas_trocadas = excluded.pecas_trocadas,
                    responsavel = excluded.responsavel,
                    horas_maquina_atualmente = excluded.horas_maquina_atualmente
            `).bind(
                novoId, 
                usuarioId, 
                dados.idImpressora, 
                dados.data || new Date().toISOString(),
                dados.tipo, 
                dados.descricao, 
                dados.custoCentavos || 0, 
                dados.observacoes || '',
                dados.tempoParadaMinutos || 0,
                dados.pecasTrocadas || '',
                dados.responsavel || '',
                dados.horasMaquinaNoMomentoMinutos || 0
            ).run();

            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { 
                status: 201,
                headers: { "Content-Type": "application/json" }
            });
        }

        // DELETE - Soft Delete
        if (metodo === "DELETE") {
            if (!id) return new Response("ID não informado", { status: 400 });
            await env.DB.prepare(
                "UPDATE registros_manutencao SET arquivado = 1 WHERE id = ? AND id_usuario = ?"
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
