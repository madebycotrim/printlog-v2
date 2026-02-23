import { useEffect, useMemo } from "react";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { servicoImpressoras } from "@/funcionalidades/producao/impressoras/servicos/ServicoImpressoras";
import { Impressora, PecaDesgaste, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";
import toast from "react-hot-toast";

export function usarGerenciadorImpressoras() {
    const store = usarArmazemImpressoras();

    useEffect(() => {
        carregarImpressoras();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const carregarImpressoras = async () => {
        store.definirCarregando(true);
        try {
            const dados = await servicoImpressoras.buscarImpressoras();
            store.definirImpressoras(dados);
        } catch (e) {
            store.definirErro("Erro ao carregar impressoras.");
            toast.error("Erro ao carregar impressoras.");
            console.error(e);
        } finally {
            store.definirCarregando(false);
        }
    };

    const salvarImpressora = async (impressora: Impressora) => {
        try {
            const salva = await servicoImpressoras.salvarImpressora(impressora);
            const existe = store.impressoras.find((i) => i.id === salva.id);

            if (existe) {
                store.definirImpressoras(
                    store.impressoras.map((i) => (i.id === salva.id ? salva : i))
                );
                toast.success("Impressora atualizada com sucesso!");
            } else {
                store.definirImpressoras([...store.impressoras, salva]);
                toast.success("Impressora cadastrada com sucesso!");
            }
            store.fecharEditar();
        } catch (e) {
            toast.error("Erro ao salvar impressora.");
            console.error(e);
        }
    };

    const salvarObservacoes = async (id: string, observacoes: string) => {
        try {
            const impressoraOriginal = store.impressoras.find(i => i.id === id);
            if (!impressoraOriginal) return;

            const impressoraAtualizada = { ...impressoraOriginal, observacoes };
            const salva = await servicoImpressoras.salvarImpressora(impressoraAtualizada);

            store.definirImpressoras(
                store.impressoras.map((i) => (i.id === id ? salva : i))
            );

            // Se o modal de detalhes estiver focado nessa impressora, atualiza o ref também
            if (store.impressoraEmDetalhes?.id === id) {
                store.abrirDetalhes(salva); // Atualiza os dados no modal aberto
            }

            toast.success("Observações atualizadas com sucesso!");
        } catch (e) {
            toast.error("Erro ao atualizar observações.");
            console.error(e);
        }
    }

    const registrarManutencao = async (id: string, registro: Omit<RegistroManutencao, "id" | "data">) => {
        try {
            const impressoraOriginal = store.impressoras.find(i => i.id === id);
            if (!impressoraOriginal) return;

            const novoRegistro: RegistroManutencao = {
                ...registro,
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
            };

            const historicoManutencao = [...(impressoraOriginal.historicoManutencao || []), novoRegistro];

            // Opcional: Atualizar horímetro se vier no registro
            let horimetroAtualizado = impressoraOriginal.horimetroTotal;
            if (registro.horasMaquinaNoMomento !== undefined && registro.horasMaquinaNoMomento > (horimetroAtualizado || 0)) {
                horimetroAtualizado = registro.horasMaquinaNoMomento;
            }

            const impressoraAtualizada = {
                ...impressoraOriginal,
                historicoManutencao,
                horimetroTotal: horimetroAtualizado
            };

            const salva = await servicoImpressoras.salvarImpressora(impressoraAtualizada);

            store.definirImpressoras(
                store.impressoras.map((i) => (i.id === id ? salva : i))
            );

            toast.success("Manutenção registrada com sucesso!");
            store.fecharManutencao();
        } catch (e) {
            toast.error("Erro ao registrar manutenção.");
            console.error(e);
        }
    };

    const salvarPecasDesgaste = async (id: string, pecas: PecaDesgaste[]) => {
        try {
            const impressoraOriginal = store.impressoras.find(i => i.id === id);
            if (!impressoraOriginal) return;

            const impressoraAtualizada = { ...impressoraOriginal, pecasDesgaste: pecas };
            const salva = await servicoImpressoras.salvarImpressora(impressoraAtualizada);

            store.definirImpressoras(
                store.impressoras.map((i) => (i.id === id ? salva : i))
            );
        } catch (e) {
            toast.error("Erro ao atualizar rastreamento de peças.");
            console.error(e);
        }
    };

    const confirmarAposentadoria = async () => {
        if (!store.impressoraParaAposentar?.id) return;

        try {
            const id = store.impressoraParaAposentar.id;
            const impressoraAtualizada: Impressora = {
                ...store.impressoraParaAposentar,
                status: "Aposentada",
                dataAposentadoria: new Date().toISOString()
            };

            const salva = await servicoImpressoras.salvarImpressora(impressoraAtualizada);

            store.definirImpressoras(
                store.impressoras.map((i) => (i.id === id ? salva : i))
            );
            toast.success("Impressora arquivada com sucesso.");
            store.fecharAposentar();
        } catch (e) {
            toast.error("Erro ao arquivar impressora.");
            console.error(e);
        }
    };

    const impressorasFiltradas = useMemo(() => {
        let filtradas = store.impressoras.filter((i) => {
            // Ignorar as aposentadas na listagem padrão (a não ser que implementemos um filtro "Exibir Aposentadas")
            if (i.status === "Aposentada") return false;

            const matchTexto = i.nome.toLowerCase().includes(store.filtroBusca.toLowerCase());
            const matchTecnologia = store.filtroTecnologia === "Todas" || i.tecnologia === store.filtroTecnologia;
            return matchTexto && matchTecnologia;
        });

        filtradas.sort((a, b) => {
            let comparacao = 0;
            switch (store.ordenacao) {
                case "NOME":
                    comparacao = a.nome.localeCompare(b.nome);
                    break;
                case "MAIOR_HORIMETRO":
                    comparacao = (b.horimetroTotal || 0) - (a.horimetroTotal || 0);
                    break;
                case "MENOR_HORIMETRO":
                    comparacao = (a.horimetroTotal || 0) - (b.horimetroTotal || 0);
                    break;
                case "MAIOR_VALOR":
                    comparacao = (b.valorCompra || 0) - (a.valorCompra || 0);
                    break;
                case "RECENTES":
                    comparacao = new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime();
                    break;
            }
            return store.ordemInvertida ? -comparacao : comparacao;
        });

        return filtradas;
    }, [store.impressoras, store.filtroBusca, store.filtroTecnologia, store.ordenacao, store.ordemInvertida]);

    const agrupadasPorTecnologia = useMemo(() => {
        const mapa = new Map<string, Impressora[]>();
        impressorasFiltradas.forEach(i => {
            const grupo = i.tecnologia || "Outras";
            if (!mapa.has(grupo)) {
                mapa.set(grupo, []);
            }
            mapa.get(grupo)!.push(i);
        });
        return Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [impressorasFiltradas]);

    const totais = useMemo(() => {
        const total = store.impressoras.length;
        const manutencao = store.impressoras.filter((i) => i.status === "Em Manutenção").length;
        const valorInvestido = store.impressoras.reduce((acc, i) => acc + (i.valorCompra || 0), 0);
        const horasImpressao = store.impressoras.reduce((acc, i) => acc + (i.horimetroTotal || 0), 0);

        return { total, manutencao, valorInvestido, horasImpressao };
    }, [store.impressoras]);

    return {
        state: {
            impressoras: store.impressoras,
            impressorasFiltradas,
            agrupadasPorTecnologia,
            carregando: store.carregando,
            filtroBusca: store.filtroBusca,
            filtroTecnologia: store.filtroTecnologia,
            ordenacao: store.ordenacao,
            ordemInvertida: store.ordemInvertida,
            modalAberto: store.modalAberto,
            modalAposentarAberto: store.modalAposentarAberto,
            modalDetalhesAberto: store.modalDetalhesAberto,
            modalHistoricoAberto: store.modalHistoricoAberto,
            modalManutencaoAberto: store.modalManutencaoAberto,
            modalPecasAberto: store.modalPecasAberto,
            modalProducaoAberto: store.modalProducaoAberto,
            impressoraSendoEditada: store.impressoraSendoEditada,
            impressoraParaAposentar: store.impressoraParaAposentar,
            impressoraEmDetalhes: store.impressoraEmDetalhes,
            impressoraHistorico: store.impressoraHistorico,
            impressoraManutencao: store.impressoraManutencao,
            impressoraPecas: store.impressoraPecas,
            impressoraProducao: store.impressoraProducao,
            totais
        },
        actions: {
            carregarImpressoras,
            salvarImpressora,
            salvarObservacoes,
            registrarManutencao,
            salvarPecasDesgaste,
            confirmarAposentadoria,
            pesquisar: store.pesquisar,
            filtrarPorTecnologia: store.filtrarPorTecnologia,
            ordenarPor: store.ordenarPor,
            inverterOrdem: store.inverterOrdem,
            abrirEditar: store.abrirEditar,
            fecharEditar: store.fecharEditar,
            abrirAposentar: store.abrirAposentar,
            fecharAposentar: store.fecharAposentar,
            abrirDetalhes: store.abrirDetalhes,
            fecharDetalhes: store.fecharDetalhes,
            abrirHistorico: store.abrirHistorico,
            fecharHistorico: store.fecharHistorico,
            abrirManutencao: store.abrirManutencao,
            fecharManutencao: store.fecharManutencao,
            abrirPecas: store.abrirPecas,
            fecharPecas: store.fecharPecas,
            abrirProducao: store.abrirProducao,
            fecharProducao: store.fecharProducao
        }
    };
}
