async function processarSincronizacaoAcessos(contexto) {
    // Sincronizar registros offline
    try {
        const registros = await contexto.request.json();

        if (!Array.isArray(registros)) {
            return new Response("Esperado array de registros", { status: 400 });
        }

        const resultados = [];

        for (const registro of registros) {
            try {
                // IDEMPOTÊNCIA: Usar INSERT OR IGNORE.
                // Se o ID já existe, o banco ignora e não lança erro.
                // O cliente recebe 'sincronizado' e para de enviar.
                await contexto.env.DB_SCAE.prepare(
                    "INSERT OR IGNORE INTO registros_acesso (id, aluno_matricula, tipo_movimentacao, timestamp, sincronizado) VALUES (?, ?, ?, ?, ?)"
                ).bind(registro.id, registro.aluno_matricula, registro.tipo_movimentacao, registro.timestamp, true).run();

                resultados.push({ id: registro.id, status: 'sincronizado' });
            } catch (erro) {
                console.error(`Erro ao inserir registro ${registro.id}:`, erro);
                resultados.push({ id: registro.id, status: 'erro', erro: erro.message });
            }
        }

        return Response.json(resultados);
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}

async function processarBuscaAcessos(contexto) {
    // Buscar registros recentes
    try {
        const { searchParams } = new URL(contexto.request.url);
        const limite = searchParams.get('limite') || 100;

        const { results } = await contexto.env.DB_SCAE.prepare(
            "SELECT * FROM registros_acesso ORDER BY timestamp DESC LIMIT ?"
        ).bind(limite).all();

        return Response.json(results);
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}

// Exportações com Alias para o Framework
export {
    processarSincronizacaoAcessos as onRequestPost,
    processarBuscaAcessos as onRequestGet
};
