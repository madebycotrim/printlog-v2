
export async function onRequestPost(contexto) {
    // Sincronizar Registros de Anonimização
    try {
        const registros = await contexto.request.json();

        if (!Array.isArray(registros)) {
            return new Response("Esperado array de registros", { status: 400 });
        }

        const resultados = [];

        for (const item of registros) {
            try {
                await contexto.env.DB_SCAE.prepare(
                    `INSERT OR IGNORE INTO registros_anonimizacao 
                    (id, entidade_tipo, entidade_id_original, entidade_id_hash, data_anonimizacao, motivo, executado_por, dados_preservados, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    item.id,
                    item.entidade_tipo,
                    item.entidade_id_original,
                    item.entidade_id_hash,
                    item.data_anonimizacao,
                    item.motivo,
                    item.executado_por,
                    item.dados_preservados, // JSON string
                    item.created_at || new Date().toISOString()
                ).run();

                resultados.push({ id: item.id, status: 'sincronizado' });
            } catch (erro) {
                console.error(`Erro ao sincronizar anonimização ${item.id}:`, erro);
                resultados.push({ id: item.id, status: 'erro', erro: erro.message });
            }
        }

        return Response.json(resultados);
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}
