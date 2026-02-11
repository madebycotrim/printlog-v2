export async function onRequestGet(contexto) {
    // Sincronização: Retornar todos os alunos ativos para cache local
    try {
        const { results } = await contexto.env.DB_SCAE.prepare(
            "SELECT * FROM alunos"
        ).all();
        // 'results' é propriedade do D1, não posso renomear a desestruturação diretamente, mas posso alocar para variável PT
        const resultados = results;
        return Response.json(resultados);
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}

export async function onRequestPost(contexto) {
    // Apenas Admin: Registrar novo aluno
    // TODO: Adicionar verificação estrita de auth
    try {
        const { matricula, nome_completo, turma_id } = await contexto.request.json();

        if (!matricula || !nome_completo) {
            return new Response("Campos obrigatórios ausentes", { status: 400 });
        }

        await contexto.env.DB_SCAE.prepare(
            "INSERT INTO alunos (matricula, nome_completo, turma_id) VALUES (?, ?, ?)"
        ).bind(matricula, nome_completo, turma_id).run();

        return new Response("Criado", { status: 201 });
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}

export async function onRequestDelete(contexto) {
    try {
        const url = new URL(contexto.request.url);
        const matricula = url.searchParams.get("matricula");

        if (!matricula) {
            return new Response("Matrícula obrigatória", { status: 400 });
        }

        await contexto.env.DB_SCAE.prepare(
            "DELETE FROM alunos WHERE matricula = ?"
        ).bind(matricula).run();

        return new Response("Aluno removido", { status: 200 });
    } catch (erro) {
        return new Response(erro.message, { status: 500 });
    }
}
