// import { differenceInMilliseconds } from 'date-fns';

const CHAVE_DESLOCAMENTO = 'scae_relogio_offset';

// Obtém o offset salvo ou 0
let deslocamentoGlobal = Number(localStorage.getItem(CHAVE_DESLOCAMENTO) || 0);

export const sincronizarRelogio = async () => {
    try {
        const inicio = Date.now();
        // Faz uma requisição HEAD leve para pegar o cabeçalho Date do servidor/CDN
        const resposta = await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
        const fim = Date.now();

        const cabecalhoData = resposta.headers.get('date');
        if (!cabecalhoData) return;

        const dataServidor = new Date(cabecalhoData).getTime();
        const latencia = (fim - inicio) / 2; // Estima latência de ida

        // Data do servidor ajustada pela latência
        const dataServidorReal = dataServidor + latencia;

        // Calcula a diferença: Servidor - Local
        // Se offset > 0, o servidor está à frente (relógio local atrasado)
        // Se offset < 0, o servidor está atrás (relógio local adiantado)
        deslocamentoGlobal = dataServidorReal - Date.now();

        localStorage.setItem(CHAVE_DESLOCAMENTO, deslocamentoGlobal.toString());

        console.log(`Relógio sincronizado. Offset: ${deslocamentoGlobal}ms (${(deslocamentoGlobal / 1000).toFixed(2)}s)`);

        return deslocamentoGlobal;
    } catch (erro) {
        console.warn('Falha ao sincronizar relógio:', erro);
        return deslocamentoGlobal; // Retorna o último conhecido
    }
};

export const obterDataCorrigida = () => {
    return new Date(Date.now() + deslocamentoGlobal);
};

// Auto-inicia sincronização se online
if (typeof window !== 'undefined' && navigator.onLine) {
    sincronizarRelogio();
    // Re-sincroniza a cada 10 minutos
    setInterval(sincronizarRelogio, 10 * 60 * 1000);
}

// Escuta evento online para forçar sync
if (typeof window !== 'undefined') {
    window.addEventListener('online', sincronizarRelogio);
}
