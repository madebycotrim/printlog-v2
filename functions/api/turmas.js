export async function onRequestGet(contexto) {
    try {
        const { results } = await contexto.env.DB_SCAE.prepare(
            "SELECT * FROM turmas ORDER BY nome"
        ).all();
        // Alocar para variável PT
        const resultados = results;
        return Response.json(resultados);
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}
