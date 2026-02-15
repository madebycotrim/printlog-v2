import { bancoLocal } from './bancoLocal';
import { registrarAuditoria } from './auditoria';

/**
 * Serviço para gerenciar justificativas de faltas
 */
export const justificativasService = {
    /**
     * Lista todas as justificativas com filtros
     */
    async listar(filtros = {}) {
        const banco = await bancoLocal.iniciarBanco();
        let justificativas = await banco.getAll('justificativas');

        // Aplicar filtros
        if (filtros.status) {
            justificativas = justificativas.filter(j => j.status === filtros.status);
        }

        if (filtros.aluno_matricula) {
            justificativas = justificativas.filter(j => j.aluno_matricula === filtros.aluno_matricula);
        }

        if (filtros.data_inicio && filtros.data_fim) {
            justificativas = justificativas.filter(j => {
                return j.data_inicio >= filtros.data_inicio && j.data_fim <= filtros.data_fim;
            });
        }

        // Ordenar por data de criação (mais recentes primeiro)
        justificativas.sort((a, b) => new Date(b.criada_em) - new Date(a.criada_em));

        // Enriquecer com dados do aluno
        const alunos = await banco.getAll('alunos');
        return justificativas.map(j => {
            const aluno = alunos.find(a => a.matricula === j.aluno_matricula);
            return { ...j, aluno };
        });
    },

    /**
     * Busca uma justificativa por ID
     */
    async buscarPorId(id) {
        const banco = await bancoLocal.iniciarBanco();
        const justificativa = await banco.get('justificativas', id);

        if (!justificativa) return null;

        // Buscar dados do aluno
        const aluno = await banco.get('alunos', justificativa.aluno_matricula);
        return { ...justificativa, aluno };
    },

    /**
     * Cria nova justificativa
     */
    async criar(dados, arquivo = null, usuarioEmail = null) {
        const banco = await bancoLocal.iniciarBanco();

        let documentoBase64 = null;
        let documentoNome = null;
        let documentoTipo = null;

        // Converter arquivo para base64 se fornecido
        if (arquivo) {
            documentoBase64 = await this._converterParaBase64(arquivo);
            documentoNome = arquivo.name;
            documentoTipo = arquivo.type;
        }

        const justificativa = {
            id: crypto.randomUUID(),
            aluno_matricula: dados.aluno_matricula,
            data_inicio: dados.data_inicio,
            data_fim: dados.data_fim,
            tipo: dados.tipo,
            descricao: dados.descricao || null,
            documento_base64: documentoBase64,
            documento_nome: documentoNome,
            documento_tipo: documentoTipo,
            status: 'PENDENTE',
            motivo_rejeicao: null,
            criada_em: new Date().toISOString(),
            criada_por: usuarioEmail,
            revisada_em: null,
            revisada_por: null
        };

        await banco.add('justificativas', justificativa);

        // Registrar auditoria
        if (usuarioEmail) {
            await registrarAuditoria({
                usuarioEmail: usuarioEmail,
                acao: 'CRIAR_JUSTIFICATIVA',
                entidadeTipo: 'justificativa',
                entidadeId: justificativa.id,
                dadosNovos: {
                    aluno: dados.aluno_matricula,
                    tipo: dados.tipo,
                    periodo: `${dados.data_inicio} a ${dados.data_fim}`
                }
            });
        }

        return justificativa;
    },

    /**
     * Atualiza status da justificativa (Aprovar/Rejeitar)
     */
    async atualizarStatus(id, status, motivoRejeicao = null, usuarioEmail = null) {
        const banco = await bancoLocal.iniciarBanco();
        const justificativa = await banco.get('justificativas', id);

        if (!justificativa) {
            throw new Error('Justificativa não encontrada');
        }

        if (!['APROVADA', 'REJEITADA'].includes(status)) {
            throw new Error('Status inválido');
        }

        const dadosAnteriores = { ...justificativa };

        justificativa.status = status;
        justificativa.revisada_em = new Date().toISOString();
        justificativa.revisada_por = usuarioEmail;

        if (status === 'REJEITADA' && motivoRejeicao) {
            justificativa.motivo_rejeicao = motivoRejeicao;
        }

        await banco.put('justificativas', justificativa);

        // Registrar auditoria
        if (usuarioEmail) {
            await registrarAuditoria({
                usuarioEmail: usuarioEmail,
                acao: status === 'APROVADA' ? 'APROVAR_JUSTIFICATIVA' : 'REJEITAR_JUSTIFICATIVA',
                entidadeTipo: 'justificativa',
                entidadeId: id,
                dadosAnteriores: { status: dadosAnteriores.status },
                dadosNovos: { status, motivo_rejeicao: motivoRejeicao }
            });
        }

        return justificativa;
    },

    /**
     * Exclui uma justificativa
     */
    async excluir(id, usuarioEmail = null) {
        const banco = await bancoLocal.iniciarBanco();
        const justificativa = await banco.get('justificativas', id);

        if (!justificativa) {
            throw new Error('Justificativa não encontrada');
        }

        await banco.delete('justificativas', id);

        // Registrar auditoria
        if (usuarioEmail) {
            await registrarAuditoria({
                usuarioEmail: usuarioEmail,
                acao: 'EXCLUIR_JUSTIFICATIVA',
                entidadeTipo: 'justificativa',
                entidadeId: id,
                dadosAnteriores: justificativa
            });
        }
    },

    /**
     * Converte arquivo para base64
     */
    _converterParaBase64(arquivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(arquivo);
        });
    },

    /**
     * Conta justificativas por status
     */
    async contarPorStatus() {
        const banco = await bancoLocal.iniciarBanco();
        const justificativas = await banco.getAll('justificativas');

        return {
            pendentes: justificativas.filter(j => j.status === 'PENDENTE').length,
            aprovadas: justificativas.filter(j => j.status === 'APROVADA').length,
            rejeitadas: justificativas.filter(j => j.status === 'REJEITADA').length,
            total: justificativas.length
        };
    },

    /**
     * Verifica se há justificativa aprovada para um período
     */
    async verificarJustificativaAprovada(alunoMatricula, data) {
        const banco = await bancoLocal.iniciarBanco();
        const justificativas = await banco.getAll('justificativas');

        return justificativas.some(j =>
            j.aluno_matricula === alunoMatricula &&
            j.status === 'APROVADA' &&
            data >= j.data_inicio &&
            data <= j.data_fim
        );
    }
};
