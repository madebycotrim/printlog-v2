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
    const idImpressora = url.searchParams.get("idImpressora");
    const metodo = request.method;

    try {
        if (metodo === "GET") {
            let query = "SELECT * FROM pecas_desgaste WHERE id_usuario = ?";
            const params: any[] = [usuarioId];

            if (idImpressora) {
                query += " AND id_impressora = ?";
                params.push(idImpressora);
            }

            const { results } = await env.DB.prepare(query).bind(...params).all();
            return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
        }

        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO pecas_desgaste (
                    id, id_usuario, id_impressora, nome, vida_util_minutos, 
                    horas_uso_atual_minutos, data_ultima_troca
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                novoId, usuarioId, dados.idImpressora, dados.nome, 
                dados.vidaUtilMinutos, dados.horasUsoAtualMinutos || 0,
                dados.dataUltimaTroca || new Date().toISOString()
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { status: 201 });
        }

        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            await env.DB.prepare(`
                UPDATE pecas_desgaste SET 
                    nome = ?, vida_util_minutos = ?, 
                    horas_uso_atual_minutos = ?, data_ultima_troca = ?
                WHERE id = ? AND id_usuario = ?
            `).bind(
                dados.nome, dados.vidaUtilMinutos, 
                dados.horasUsoAtualMinutos, dados.dataUltimaTroca,
                dados.id, usuarioId
            ).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        if (metodo === "DELETE") {
            if (!id) return new Response("ID não fornecido", { status: 400 });
            await env.DB.prepare(
                "DELETE FROM pecas_desgaste WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};
