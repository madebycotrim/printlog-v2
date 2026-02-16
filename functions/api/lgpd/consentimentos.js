
export async function onRequestPost(contexto) {
    // Sincronizar Consentimentos (Salvar)
    try {
        const consentimentos = await contexto.request.json();

        if (!Array.isArray(consentimentos)) {
            return new Response("Esperado array de consentimentos", { status: 400 });
        }

        const resultados = [];

        for (const item of consentimentos) {
            try {
                // Inserir ou Atualizar
                await contexto.env.DB_SCAE.prepare(
                    `INSERT OR REPLACE INTO consentimentos 
                    (id, aluno_matricula, versao_termo, tipo_consentimento, consentido, data_consentimento, coletado_por, valido_ate, retirado, data_retirada, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    item.id,
                    item.aluno_matricula,
                    item.versao_termo,
                    item.tipo_consentimento,
                    item.consentido ? 1 : 0,
                    item.data_consentimento,
                    item.coletado_por,
                    item.valido_ate,
                    item.retirado ? 1 : 0,
                    item.data_retirada,
                    item.created_at || new Date().toISOString()
                ).run();

                resultados.push({ id: item.id, status: 'sincronizado' });
            } catch (erro) {
                console.error(`Erro ao sincronizar consentimento ${item.id}:`, erro);
                resultados.push({ id: item.id, status: 'erro', erro: erro.message });
            }
        }

        return Response.json(resultados);
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}

export async function onRequestGet(contexto) {
    // Buscar histórico de consentimento de um aluno
    try {
        const url = new URL(contexto.request.url);
        const matricula = url.searchParams.get("matricula");

        if (!matricula) {
            return new Response("Matrícula obrigatória", { status: 400 });
        }

        const { results } = await contexto.env.DB_SCAE.prepare(
            "SELECT * FROM consentimentos WHERE aluno_matricula = ? ORDER BY data_consentimento DESC"
        ).bind(matricula).all();

        return Response.json(results);
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}
