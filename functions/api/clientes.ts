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
            const { results: clientes } = await env.DB.prepare(
                "SELECT * FROM clientes WHERE id_usuario = ? ORDER BY nome ASC"
            ).bind(usuarioId).all();
            return new Response(JSON.stringify(clientes), { headers: { "Content-Type": "application/json" } });
        }

        if (metodo === "POST") {
            const dados = await request.json() as any;
            const novoId = dados.id || crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO clientes (
                    id, id_usuario, nome, email, telefone, status_comercial, observacoes_crm, data_criacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                novoId, usuarioId, dados.nome, dados.email, dados.telefone,
                dados.statusComercial || 'Prospect', dados.observacoesCRM || '',
                new Date().toISOString()
            ).run();
            return new Response(JSON.stringify({ id: novoId, sucesso: true }), { status: 201 });
        }

        if (metodo === "PATCH" || metodo === "PUT") {
            const dados = await request.json() as any;
            await env.DB.prepare(`
                UPDATE clientes SET 
                    nome = ?, email = ?, telefone = ?, 
                    status_comercial = ?, observacoes_crm = ?
                WHERE id = ? AND id_usuario = ?
            `).bind(
                dados.nome, dados.email, dados.telefone,
                dados.statusComercial, dados.observacoesCRM,
                dados.id, usuarioId
            ).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        if (metodo === "DELETE") {
            if (!id) return new Response("ID não fornecido", { status: 400 });
            await env.DB.prepare(
                "DELETE FROM clientes WHERE id = ? AND id_usuario = ?"
            ).bind(id, usuarioId).run();
            return new Response(JSON.stringify({ sucesso: true }));
        }

        return new Response("Método não permitido", { status: 405 });
    } catch (erro: any) {
        return new Response(JSON.stringify({ erro: erro.message }), { status: 500 });
    }
};
