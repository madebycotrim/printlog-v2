/// <reference types="@cloudflare/workers-types" />

interface Env {
    DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { env, request } = context;
    const usuarioId = request.headers.get("x-usuario-id");
    if (!usuarioId) return new Response("Não autorizado", { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const metodo = request.method;

    try {
        if (metodo === "GET") {
            const { results: impressoras } = await env.DB.prepare(
                "SELECT * FROM impressoras WHERE id_usuario = ? ORDER BY nome ASC"
            ).bind(usuarioId).all();

            // Buscar histórico de produção (pedidos vinculados)
            const { results: pedidos } = await env.DB.prepare(
                `SELECT id as idProtocolo, descricao as nomeProjeto, valor_centavos as valorGeradoCentavos, 
                        data_conclusao as dataConclusao, status, id_impressora
                 FROM pedidos_impressao 
                 WHERE id_usuario = ? AND status = 'concluido' AND id_impressora IS NOT NULL`
            ).bind(usuarioId).all();

            // Mapear pedidos para cada impressora
            const impressorasComHistorico = impressoras.map((imp: any) => {
                const historico = pedidos
                    .filter((p: any) => p.id_impressora === imp.id)
                    .map((p: any) => ({
                        idProtocolo: p.idProtocolo,
                        nomeProjeto: p.nomeProjeto,
                        valorGeradoCentavos: p.valorGeradoCentavos,
                        dataConclusao: p.dataConclusao,
                        sucesso: p.status === 'concluido'
                    }));

                return {
                    ...imp,
                    historicoProducao: historico
                };
            });

            return new Response(JSON.stringify(impressorasComHistorico), { headers: { "Content-Type": "application/json" } });
        }

        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO impressoras (
                    id, id_usuario, nome, tecnologia, status, 
                    marca, modelo_base, imagem_url,
                    taxa_hora_centavos, horimetro_total_minutos,
                    intervalo_revisao_minutos, valor_compra_centavos,
                    observacoes, potencia_watts, consumo_kw, data_criacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                novoId, 
                usuarioId, 
                dados.nome ?? null, 
                dados.tecnologia ?? 'FDM', 
                dados.status ?? 'livre', 
                dados.marca ?? null,
                dados.modeloBase ?? dados.modelo_base ?? null,
                dados.imagemUrl ?? dados.imagem_url ?? null,
                dados.taxaHoraCentavos ?? dados.taxa_hora_centavos ?? 0,
                dados.horimetroTotalMinutos ?? dados.horimetro_total_minutos ?? 0, 
                dados.intervaloRevisaoMinutos ?? dados.intervalo_revisao_minutos ?? 30000,
                dados.valorCompraCentavos ?? dados.valor_compra_centavos ?? 0,
                dados.observacoes ?? null,
                dados.potenciaWatts ?? dados.potencia_watts ?? 0,
                dados.consumoKw ?? dados.consumo_kw ?? 0,
                new Date().toISOString()
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { status: 201 });
        }

        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            await env.DB.prepare(`
                UPDATE impressoras SET 
                    nome = ?, tecnologia = ?, status = ?, 
                    marca = ?, modelo_base = ?, imagem_url = ?,
                    taxa_hora_centavos = ?, horimetro_total_minutos = ?,
                    intervalo_revisao_minutos = ?, valor_compra_centavos = ?,
                    observacoes = ?, potencia_watts = ?, consumo_kw = ?, data_aposentadoria = ?
                WHERE id = ? AND id_usuario = ?
            `).bind(
                dados.nome ?? null, 
                dados.tecnologia ?? null, 
                dados.status ?? 'livre',
                dados.marca ?? null,
                dados.modeloBase ?? dados.modelo_base ?? null,
                dados.imagemUrl ?? dados.imagem_url ?? null,
                dados.taxaHoraCentavos ?? dados.taxa_hora_centavos ?? 0, 
                dados.horimetroTotalMinutos ?? dados.horimetro_total_minutos ?? 0,
                dados.intervaloRevisaoMinutos ?? dados.intervalo_revisao_minutos ?? 30000, 
                dados.valorCompraCentavos ?? dados.valor_compra_centavos ?? 0,
                dados.observacoes ?? null, 
                dados.potenciaWatts ?? dados.potencia_watts ?? 0,
                dados.consumoKw ?? dados.consumo_kw ?? 0,
                dados.dataAposentadoria ?? dados.data_aposentadoria ?? null,
                dados.id, 
                usuarioId
            ).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        if (metodo === "DELETE") {
            if (!id) return new Response("ID não fornecido", { status: 400 });
            await env.DB.prepare(
                "DELETE FROM impressoras WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};
