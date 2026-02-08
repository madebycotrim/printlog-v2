/**
 * Serviço para processar planilhas (CSV/Texto) do SIGE/SEEDF/i-Educar
 */
export const importadorPlanilhas = {
    /**
     * Processa texto CSV bruto e retorna array de alunos normalizados
     * @param {string} textoBruto - Conteúdo do arquivo CSV ou colar
     * @returns {Array} Lista de objetos { matricula, nome_completo, turma_id }
     */
    processarCSV: (textoBruto) => {
        if (!textoBruto) return [];

        const linhas = textoBruto.split(/\r?\n/).filter(linha => linha.trim() !== '');
        if (linhas.length === 0) return [];

        // Detectar separador (vírgula ou ponto e vírgula)
        const primeiraLinha = linhas[0];
        const separador = primeiraLinha.includes(';') ? ';' : ',';

        // Mapeamento de colunas (tentativa de detectar cabeçalhos)
        const cabecalhos = primeiraLinha.toLowerCase().split(separador).map(c => c.trim().replace(/"/g, ''));

        let indiceMatricula = -1;
        let indiceNome = -1;
        let indiceTurma = -1;

        // Tenta encontrar colunas pelo nome (padrão SIGE/i-Educar)
        cabecalhos.forEach((col, index) => {
            if (col.includes('matr') || col.includes('cod') || col.includes('id')) indiceMatricula = index;
            if (col.includes('nome') || col.includes('aluno')) indiceNome = index;
            if (col.includes('turma') || col.includes('serie') || col.includes('ano')) indiceTurma = index;
        });

        const alunos = [];
        const inicioDados = (indiceMatricula !== -1) ? 1 : 0; // Se achou cabeçalho, pula a 1ª linha

        // Se não achou cabeçalhos, assume ordem padrão: Matrícula, Nome, Turma
        if (indiceMatricula === -1) {
            indiceMatricula = 0;
            indiceNome = 1;
            indiceTurma = 2;
        }

        for (let i = inicioDados; i < linhas.length; i++) {
            const colunas = linhas[i].split(separador).map(c => c.trim().replace(/"/g, ''));

            if (colunas.length < 2) continue; // Linha inválida

            const matricula = colunas[indiceMatricula];
            const nome = colunas[indiceNome];
            const turma = indiceTurma !== -1 ? colunas[indiceTurma] : 'SEM TURMA';

            if (matricula && nome) {
                alunos.push({
                    matricula: matricula.replace(/[^a-zA-Z0-9]/g, ''), // Limpa caracteres especiais
                    nome_completo: nome.toUpperCase(),
                    turma_id: turma.toUpperCase()
                });
            }
        }

        return alunos;
    }
};
