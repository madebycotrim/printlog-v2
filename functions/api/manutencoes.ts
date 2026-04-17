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
            let query = "SELECT * FROM registro_manutencao WHERE id_usuario = ?";
            const params: any[] = [usuarioId];

            if (idImpressora) {
                query += " AND id_impressora = ?";
                params.push(idImpressora);
            }

            query += " ORDER BY data DESC";

            const { results } = await env.DB.prepare(query).bind(...params).all();
            return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
        }

        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO registro_manutencao (
                    id, id_usuario, id_impressora, data, tipo, descricao, custo_centavos
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                novoId, usuarioId, dados.idImpressora, 
                dados.data || new Date().toISOString(),
                dados.tipo, dados.descricao, dados.custoCentavos || 0
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { status: 201 });
        }

        if (metodo === "DELETE") {
            if (!id) return new Response("ID não fornecido", { status: 400 });
            await env.DB.prepare(
                "DELETE FROM registro_manutencao WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};
