
export async function onRequestPost(contexto) {
    // Endpoint protegido para limpeza de dados expirados
    // Deve ser chamado por um CRON Job externo ou Admin

    const { request, env } = contexto;
    const url = new URL(request.url);
    const chaveExecucao = url.searchParams.get("key");
    const CHAVE_SECRETA = env.CRON_SECRET || 'chave-padrao-dev'; // Definir no Cloudflare Dashboard

    // 1. Verificação de Segurança
    if (chaveExecucao !== CHAVE_SECRETA) {
        return new Response("Acesso negado", { status: 401 });
    }

    const relatorio = {
        executado_em: new Date().toISOString(),
        logs_auditoria_removidos: 0,
        acessos_removidos: 0,
        erros: []
    };

    try {
        // 2. Limpeza de Logs de Auditoria
        // Política Padrão: 5 anos (1825 dias) se não houver configuração específica
        const diasRetencaoAuditoria = 1825;

        const dataCorteAuditoria = new Date();
        dataCorteAuditoria.setDate(dataCorteAuditoria.getDate() - diasRetencaoAuditoria);
        const isoCorteAuditoria = dataCorteAuditoria.toISOString();

        const resAuditoria = await env.DB_SCAE.prepare(
            "DELETE FROM logs_auditoria WHERE timestamp < ?"
        ).bind(isoCorteAuditoria).run();

        relatorio.logs_auditoria_removidos = resAuditoria.meta.changes;

        // 3. Limpeza de Registros de Acesso
        // Política Padrão: 2 anos (730 dias)
        const diasRetencaoAcesso = 730;

        const dataCorteAcesso = new Date();
        dataCorteAcesso.setDate(dataCorteAcesso.getDate() - diasRetencaoAcesso);
        const isoCorteAcesso = dataCorteAcesso.toISOString();

        const resAcessos = await env.DB_SCAE.prepare(
            "DELETE FROM registros_acesso WHERE timestamp < ?"
        ).bind(isoCorteAcesso).run();

        relatorio.acessos_removidos = resAcessos.meta.changes;

        // 4. (Futuro) Limpeza de Alunos Inativos
        // Requereria coluna 'data_inativacao' ou tabela de histórico de status no D1

        return Response.json({
            status: 'sucesso',
            relatorio
        });

    } catch (erro) {
        console.error('Erro no cleanup:', erro);
        return new Response(JSON.stringify({
            status: 'erro',
            mensagem: erro.message,
            relatorio
        }), { status: 500 });
    }
}
