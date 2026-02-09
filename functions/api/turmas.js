export async function onRequestGet(contexto) {
    try {
        const { results } = await contexto.env.DB_SCAE.prepare(
            "SELECT * FROM turmas ORDER BY id"
        ).all();
        return Response.json(results);
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}

export async function onRequestPost(contexto) {
    try {
        const { id, criado_em } = await contexto.request.json();

        if (!id) {
            return new Response("ID da turma obrigatório", { status: 400 });
        }

        await contexto.env.DB_SCAE.prepare(
            "INSERT INTO turmas (id, criado_em) VALUES (?, ?)"
        ).bind(id, criado_em || new Date().toISOString()).run();

        return new Response("Turma criada", { status: 201 });
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}
